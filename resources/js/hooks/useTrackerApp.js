import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { clearToken, getToken, setToken } from '../lib/auth'
import { getIsoWeek, isFutureDate, shiftIsoWeek } from '../lib/date'

export function useTrackerApp() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [me, setMe] = useState(null)
  const [week, setWeek] = useState(null)
  const [streaks, setStreaks] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(() => getIsoWeek(new Date()))
  const [pending, setPending] = useState(() => new Set())

  const dayLabels = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [])

  function prevWeek() {
    setSelected((s) => shiftIsoWeek(s.year, s.week, -1))
  }

  function nextWeek() {
    setSelected((s) => shiftIsoWeek(s.year, s.week, +1))
  }

  async function loadStreaks() {
    const data = await api('/tracker/streaks')
    setStreaks(data)
  }

  async function reloadWeekOnly(curr = selected) {
    const weekData = await api(`/tracker/week?year=${encodeURIComponent(curr.year)}&week=${encodeURIComponent(curr.week)}`)
    setWeek(weekData)
    loadStreaks().catch(() => {})
  }

  async function loadMeAndWeek(curr = selected) {
    setError('')
    setLoading(true)

    try {
      const meData = await api('/me')
      setMe(meData)

      const weekData = await api(`/tracker/week?year=${encodeURIComponent(curr.year)}&week=${encodeURIComponent(curr.week)}`)
      setWeek(weekData)

      loadStreaks().catch(() => {})
    } catch (e) {
      clearToken()
      setMe(null)
      setWeek(null)
      setStreaks(null)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') logout()
      if (e.key === 'ArrowLeft') prevWeek()
      if (e.key === 'ArrowRight') nextWeek()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!getToken()) return
    loadMeAndWeek().catch(() => {})
  }, [])

  useEffect(() => {
    if (!me) return
    loadMeAndWeek(selected).catch(() => {})
  }, [selected.year, selected.week])

  async function login(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api('/login', {
        method: 'POST',
        body: { email, password },
      })

      setToken(data.token)
      await loadMeAndWeek(selected)
    } catch (e2) {
      setError(e2.message)
      setLoading(false)
    }
  }

  async function register(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api('/register', {
        method: 'POST',
        body: { email, password, name: email },
      })

      setToken(data.token)
      await loadMeAndWeek(selected)
    } catch (e2) {
      setError(e2.message)
      setLoading(false)
    }
  }

  async function logout() {
    setError('')
    setLoading(true)

    try {
      await api('/logout', { method: 'POST' })
    } catch {
      // ignore
    } finally {
      clearToken()
      setMe(null)
      setWeek(null)
      setStreaks(null)
      setLoading(false)
    }
  }

  async function deleteDirection(directionId) {
    if (!window.confirm('Удалить направление? Все отметки по нему тоже удалятся.')) return

    setError('')
    setLoading(true)

    try {
      await api(`/directions/${directionId}`, { method: 'DELETE' })
      await reloadWeekOnly(selected)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleMark(directionId, isoWeekday, nextValue) {
    if (!week) return

    const day = week.days.find((d) => d.iso_weekday === isoWeekday)
    if (!day) return
    if (isFutureDate(day.date)) return

    const pKey = `${directionId}|${isoWeekday}|${day.date}`

    setError('')
    setPending((prev) => new Set(prev).add(pKey))

    const prevWeekState = week

    const optimistic = {
      ...week,
      rows: week.rows.map((r) => {
        if (r.direction.id !== directionId) return r

        const statuses = { ...(r.statuses || {}) }
        statuses[String(isoWeekday)] = !!nextValue
        statuses[isoWeekday] = !!nextValue

        return { ...r, statuses }
      }),
    }

    setWeek(optimistic)

    try {
      await api('/tracker/mark', {
        method: 'POST',
        body: {
          direction_id: directionId,
          date: day.date,
          completed: Boolean(nextValue),
        },
      })

      await reloadWeekOnly(selected)
    } catch (e) {
      setWeek(prevWeekState)
      setError(e.message)
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(pKey)
        return next
      })
    }
  }

  const rangeLabel = (() => {
    const from = week?.days?.[0]?.date ?? ''
    const to = week?.days?.[6]?.date ?? ''
    return from && to ? `${from} — ${to}` : week ? `ISO ${week.year} / week ${week.week}` : ''
  })()

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    me,
    week,
    streaks,
    loading,
    error,
    selected,
    pending,
    dayLabels,
    rangeLabel,
    login,
    register,
    logout,
    prevWeek,
    nextWeek,
    toggleMark,
    deleteDirection,
    reloadWeekOnly,
  }
}
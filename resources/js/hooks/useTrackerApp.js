import { useEffect, useMemo, useState } from 'react'
import { clearToken, getToken, setToken } from '../lib/auth'
import { getIsoWeek, isFutureDate, shiftIsoWeek } from '../lib/date'
import {
  api,
  getNotes,
  createNote,
  deleteNote,
  updateNote,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../lib/api'

export function useTrackerApp() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [me, setMe] = useState(null)
  const [week, setWeek] = useState(null)
  const [streaks, setStreaks] = useState(null)
  const [notes, setNotes] = useState([])
  const [todos, setTodos] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [booting, setBooting] = useState(true)
  const SELECTED_WEEK_KEY = 'tracker_selected_week'

  const [selected, setSelected] = useState(() => {
  try {
    const saved = localStorage.getItem(SELECTED_WEEK_KEY)

    if (saved) {
      const parsed = JSON.parse(saved)

      if (parsed?.year && parsed?.week) {
        return parsed
      }
    }
  } catch {
  }

  return getIsoWeek(new Date())
  })

  const [pending, setPending] = useState(() => new Set())

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [directionToDelete, setDirectionToDelete] = useState(null)

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

  async function loadNotes() {
    const data = await getNotes()

    setNotes(Array.isArray(data) ? data : [])
  }

  async function loadTodos() {
    const data = await getTodos()

    setTodos(Array.isArray(data) ? data : [])
  }

  async function handleCreateNote(data) {
    const newNote = await createNote(data)

    setNotes((prev) => [newNote, ...prev])

    return newNote
  }

  async function handleDeleteNote(id) {
    await deleteNote(id)

    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  async function handleUpdateNote(id, data) {
    const updatedNote = await updateNote(id, data)

    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    )

    return updatedNote
  }

  async function handleCreateTodo(data) {
    const newTodo = await createTodo(data)

    setTodos((prev) => [newTodo, ...prev])

    return newTodo
  }

  async function handleToggleTodo(todo) {
    const updatedTodo = await updateTodo(todo.id, {
      is_done: !todo.is_done,
    })

    setTodos((prev) =>
      prev.map((item) => (item.id === updatedTodo.id ? updatedTodo : item))
    )

    return updatedTodo
  }

  async function handleDeleteTodo(id) {
    await deleteTodo(id)

    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  async function handleUpdateTodo(id, data) {
  const updatedTodo = await updateTodo(id, data)

  setTodos((prev) =>
    prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
  )

  return updatedTodo
  }

  async function reloadWeekOnly(curr = selected) {
    const weekData = await api(
      `/tracker/week?year=${encodeURIComponent(curr.year)}&week=${encodeURIComponent(curr.week)}`
    )

    setWeek(weekData)

    loadStreaks().catch(() => {})
    loadNotes().catch(() => {})
    loadTodos().catch(() => {})
  }

  async function loadMeAndWeek(curr = selected) {
    setError('')
    setLoading(true)

    try {
      const meData = await api('/me')
      setMe(meData)

      const weekData = await api(
        `/tracker/week?year=${encodeURIComponent(curr.year)}&week=${encodeURIComponent(curr.week)}`
      )

      setWeek(weekData)

      loadStreaks().catch(() => {})
      loadNotes().catch(() => {})
      loadTodos().catch(() => {})
    } catch (e) {
      clearToken()
      setMe(null)
      setWeek(null)
      setStreaks(null)
      setNotes([])
      setTodos([])
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  function onKey(e) {
    if (e.key === 'ArrowLeft') prevWeek()
    if (e.key === 'ArrowRight') nextWeek()
  }

  async function handleUpdateTodo(id, data) {
  const updatedTodo = await updateTodo(id, data)

  setTodos((prev) =>
    prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
  )

  return updatedTodo
}

  window.addEventListener('keydown', onKey)

  return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    async function init() {
      if (!getToken()) {
        setBooting(false)
        return
      }

      try {
        await loadMeAndWeek()
      } finally {
        setBooting(false)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (!me) return

    loadNotes().catch(() => {})
    loadTodos().catch(() => {})
  }, [me])

  useEffect(() => {
    if (!me) return

    loadMeAndWeek(selected).catch(() => {})
  }, [selected.year, selected.week])

  useEffect(() => {
  localStorage.setItem(SELECTED_WEEK_KEY, JSON.stringify(selected))
  }, [selected.year, selected.week])


  async function login() {
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

  async function register() {
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
    } finally {
      clearToken()
      setMe(null)
      setWeek(null)
      setStreaks(null)
      setNotes([])
      setTodos([])
      setLoading(false)
    }
  }

  function requestDeleteDirection(directionId) {
    setDirectionToDelete(directionId)
    setConfirmDeleteOpen(true)
  }

  function cancelDeleteDirection() {
    setConfirmDeleteOpen(false)
    setDirectionToDelete(null)
  }

  async function confirmDeleteDirection() {
    if (!directionToDelete) return

    setError('')
    setLoading(true)
    setConfirmDeleteOpen(false)

    try {
      await api(`/directions/${directionToDelete}`, { method: 'DELETE' })
      await reloadWeekOnly(selected)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setDirectionToDelete(null)
    }
  }

  async function deleteDirection(directionId) {
    if (!directionId) return

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
    notes,
    todos,

    loading,
    error,
    selected,
    pending,
    dayLabels,
    rangeLabel,
    booting,

    login,
    register,
    logout,

    prevWeek,
    nextWeek,
    toggleMark,
    reloadWeekOnly,

    deleteDirection,
    confirmDeleteOpen,
    directionToDelete,
    requestDeleteDirection,
    cancelDeleteDirection,
    confirmDeleteDirection,

    loadNotes,
    onCreateNote: handleCreateNote,
    onDeleteNote: handleDeleteNote,
    onUpdateNote: handleUpdateNote,

    loadTodos,
    onCreateTodo: handleCreateTodo,
    onToggleTodo: handleToggleTodo,
    onDeleteTodo: handleDeleteTodo,
    onUpdateTodo: handleUpdateTodo,
  }
}
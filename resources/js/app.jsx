import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

const API_BASE = '/api'
const TOKEN_KEY = 'tracker_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    throw new Error(data?.message || (text && text.slice(0, 300)) || `HTTP ${res.status}`)
  }

  return data
}

// ISO week helpers
function weeksInIsoYear(year) {
  const d = new Date(Date.UTC(year, 11, 28))
  return getIsoWeek(d).week
}
function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}
function shiftIsoWeek(year, week, delta) {
  let y = year
  let w = week + delta
  while (w < 1) {
    y -= 1
    w += weeksInIsoYear(y)
  }
  while (w > weeksInIsoYear(y)) {
    w -= weeksInIsoYear(y)
    y += 1
  }
  return { year: y, week: w }
}

function todayStrLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isFutureDate(dateStr) {
  return dateStr > todayStrLocal()
}

/**
 * Form: create user direction
 * Requires API: POST /api/directions { name }
 */
function CreateDirectionForm({ disabled, onCreated }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setErr('')
    setSaving(true)
    try {
      const dir = await api('/directions', {
        method: 'POST',
        body: { name: trimmed },
      })
      setName('')
      onCreated?.(dir)
    } catch (e2) {
      setErr(e2.message || 'Failed to create direction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="dirForm">
      <div className="dirFormLeft">
        <span className="dim">Add direction:</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. gym / reading / code"
          disabled={disabled || saving}
        />
        <button className="btn" type="submit" disabled={disabled || saving || !name.trim()}>
          {saving ? 'Saving…' : 'Add'}
        </button>
      </div>

      {err ? <div className="alert" style={{ marginTop: 10 }}>{err}</div> : null}
    </form>
  )
}

function App() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('lp_test@example.com')
  const [password, setPassword] = useState('password')

  const [me, setMe] = useState(null)
  const [week, setWeek] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(() => getIsoWeek(new Date()))
  const dayLabels = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [])

  const [streaks, setStreaks] = useState(null)
  const [pending, setPending] = useState(() => new Set()) // keys: "directionId|isoWeekday|date"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!getToken()) return
    loadMeAndWeek().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!me) return
    loadMeAndWeek(selected).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.year, selected.week])

  async function login(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api('/login', {
        method: 'POST',
        body: { email, password },
      })
      setToken(data.token)
      await loadMeAndWeek(selected)
    } catch (e2) {
      setError(e2.message)
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
  if (!confirm('Удалить направление? Все отметки по нему тоже удалятся.')) return

  setError('')
  setLoading(true)
  try {
    await api(`/directions/${directionId}`, { method: 'DELETE' })
    const weekData = await api(`/tracker/week?year=${encodeURIComponent(selected.year)}&week=${encodeURIComponent(selected.week)}`)
    setWeek(weekData)
    loadStreaks().catch(() => {})
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

  if (!me) {
    return (
      <div className="container">
        <div className="term">
          <div className="termTop">
            <div className="badge">
              <span className="dot" />
              <span>user@host: ~/tasks</span>
            </div>
            <span className="keyBtn" style={{ cursor: 'default' }}>
              <span className="key">API</span>
              <span>offline</span>
            </span>
          </div>

          <div className="termBody">
            <div className="hTitle">
              <span>tracker</span>
              <span className="dim">/ {mode === 'login' ? 'login' : 'register'}</span>
            </div>

            <div className="hr" />

            {error ? <div className="alert">{error}</div> : null}

            <form className="form" onSubmit={mode === 'login' ? login : register}>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />

              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? 'Processing…' : mode === 'login' ? 'Login' : 'Register'}
              </button>
            </form>

            <div style={{ marginTop: 14 }}>
              {mode === 'login' ? (
                <button type="button" className="navBtn" onClick={() => setMode('register')}>
                  No account? Register
                </button>
              ) : (
                <button type="button" className="navBtn" onClick={() => setMode('login')}>
                  Already registered? Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!week) {
    return (
      <div className="container">
        <div className="term">
          <div className="termTop">
            <div className="badge">
              <span className="dot" />
              <span>user@host: ~/tasks</span>
            </div>

            <button className="keyBtn" onClick={logout} disabled={loading} type="button">
              <span className="key">ESC</span>
              <span>logout</span>
            </button>
          </div>

          <div className="termBody">
            <div className="hTitle">
              <span>tracker</span>
              <span className="dim">/ week</span>
            </div>

            <div className="hr" />

            {error ? <div className="alert">{error}</div> : null}

            <div className="meta">{loading ? 'Loading…' : 'No week loaded'}</div>
          </div>
        </div>
      </div>
    )
  }

  const from = week.days?.[0]?.date ?? ''
  const to = week.days?.[6]?.date ?? ''
  const rangeLabel = from && to ? `${from} — ${to}` : `ISO ${week.year} / week ${week.week}`

  return (
    <WeekScreen
      me={me}
      week={week}
      dayLabels={dayLabels}
      busy={loading}
      error={error}
      onLogout={logout}
      onPrev={prevWeek}
      onNext={nextWeek}
      onToggle={toggleMark}
      rangeLabel={rangeLabel}
      pending={pending}
      streaks={streaks}
      onReloadWeek={() => reloadWeekOnly(selected)}
      onDeleteDirection={deleteDirection}
    />
  )
}

function WeekScreen({
  me,
  week,
  dayLabels,
  busy,
  error,
  onLogout,
  onPrev,
  onNext,
  onToggle,
  rangeLabel,
  pending,
  streaks,
  onReloadWeek,
  onDeleteDirection,
}) {
  function extractCurrent(s) {
    if (!s) return 0
    if (typeof s.current === 'number') return s.current
    if (typeof s.current_streak === 'number') return s.current_streak
    return 0
  }

  function extractBest(s) {
    if (!s) return 0
    if (typeof s.best === 'number') return s.best
    if (typeof s.best_streak === 'number') return s.best_streak
    return 0
  }

  const today = todayStrLocal()
  const totalCells = week.rows.length * week.days.length

  let doneCells = 0
  let doneToday = 0

  for (const row of week.rows) {
    for (const d of week.days) {
      const k = String(d.iso_weekday)
      const val = Boolean(row.statuses?.[k] ?? row.statuses?.[d.iso_weekday])
      if (val) doneCells++
      if (d.date === today && val) doneToday++
    }
  }

  const pct = totalCells ? Math.round((doneCells / totalCells) * 100) : 0

  return (
    <div className="container">
      <div className="term">
        <div className="termTop">
          <div className="badge">
            <span className="dot" />
            <span>user@host: ~/tasks</span>
          </div>

          <button className="keyBtn" onClick={onLogout} disabled={busy} type="button">
            <span className="key">ESC</span>
            <span>logout</span>
          </button>
        </div>

        <div className="termBody">
          <div className="hTitle">
            <span>tracker</span>
            <span className="dim">/ week</span>
          </div>

          <div className="hr" />

          {error ? <div className="alert">{error}</div> : null}

          <div className="meta">
            {'<'} User: <span className="good">{me?.email ?? me?.name}</span>
            {' >'} • Done today: <span className="good">{doneToday}</span> • Week: <span className="good">{pct}%</span>
          </div>

          {/* NEW: add direction */}
          <CreateDirectionForm
            disabled={busy}
            onCreated={() => {
              onReloadWeek?.()
            }}
          />

          <div className="gridWrap">
            <table className="grid">
              <thead>
                <tr>
                  <th></th>
                  {week.days.map((d, idx) => (
                    <th key={d.iso_weekday} title={d.date} className={d.date === today ? 'todayHead' : ''}>
                      {dayLabels[idx] ?? `D${d.iso_weekday}`}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {week.rows.map((row) => (
                  <tr key={row.direction.id}>
                    <td className="dirCell">
  <span>{row.direction.name}</span>

  <button
    type="button"
    className="delBtn"
    disabled={busy}
    onClick={() => onDeleteDirection?.(row.direction.id)}
    title="Delete direction"
  >
    DEL
  </button>
</td>


                    {week.days.map((d) => {
                      const k = String(d.iso_weekday)
                      const val = Boolean(row.statuses?.[k] ?? row.statuses?.[d.iso_weekday])

                      const future = isFutureDate(d.date)
                      const pKey = `${row.direction.id}|${d.iso_weekday}|${d.date}`
                      const isPending = pending?.has?.(pKey)

                      return (
                        <td key={d.iso_weekday} className={d.date === today ? 'todayCol' : ''} title={d.date}>
                          <button
                            type="button"
                            className={['markBtn', val ? 'on' : '', future ? 'future' : '', isPending ? 'pending' : '']
                              .filter(Boolean)
                              .join(' ')}
                            disabled={busy || future || isPending}
                            onClick={() => onToggle(row.direction.id, d.iso_weekday, !val)}
                          >
                            {val ? '✓' : '—'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="navRow">
            <button className="navBtn" onClick={onPrev} disabled={busy} type="button">
              &lt;&lt; PREV
            </button>

            <div>{rangeLabel}</div>

            <button className="navBtn" onClick={onNext} disabled={busy} type="button">
              NEXT &gt;&gt;
            </button>
          </div>

          <div className="kpiRow">
            <span>ISO {week.year} / week {week.week}</span>

            <span>
              Ready: <span className="good">{doneCells}</span>/<span className="good">{totalCells}</span> ({pct}%)
            </span>

            <span>
              Today: <span className="good">{doneToday}</span>/<span className="good">{week.rows.length}</span>
            </span>

            <span>
              Streak: <span className="good">{extractCurrent(streaks)}</span> • Best:{' '}
              <span className="good">{extractBest(streaks)}</span>
            </span>

            <span>
              Keep it up! <span className="good">♥</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// HMR-safe root mounting (prevents double createRoot in dev)
const el = document.getElementById('app')
if (el) {
  if (!el.__reactRoot) el.__reactRoot = createRoot(el)
  el.__reactRoot.render(<App />)
}

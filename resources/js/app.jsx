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

  // robust parsing: handles JSON + non-JSON (HTML error pages etc.)
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    // prefer API message, fallback to raw text/status
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

function App() {
  const [email, setEmail] = useState('lp_test@example.com')
  const [password, setPassword] = useState('password')

  const [me, setMe] = useState(null)
  const [week, setWeek] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(() => getIsoWeek(new Date()))

  const dayLabels = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [])

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
    } catch (e) {
      clearToken()
      setMe(null)
      setWeek(null)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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
    // loading управляет loadMeAndWeek (чтобы не было двойного setLoading)
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
      setLoading(false)
    }
  }

  async function toggleMark(directionId, isoWeekday, nextValue) {
    if (!week) return

    const day = week.days.find((d) => d.iso_weekday === isoWeekday)
    if (!day) return

    setError('')
    setLoading(true)

    try {
      await api('/tracker/mark', {
        method: 'POST',
        body: {
          direction_id: directionId,
          date: day.date, // ✅ API ждёт date
          value: nextValue ? 1 : 0,
        },
      })

      const weekData = await api(
        `/tracker/week?year=${encodeURIComponent(selected.year)}&week=${encodeURIComponent(selected.week)}`
      )
      setWeek(weekData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function prevWeek() {
    setSelected((s) => shiftIsoWeek(s.year, s.week, -1))
  }

  function nextWeek() {
    setSelected((s) => shiftIsoWeek(s.year, s.week, +1))
  }

  // ===== RENDER =====
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
              <span className="dim">/ login</span>
            </div>

            <div className="hr" />

            {error ? <div className="alert">{error}</div> : null}

            <form className="form" onSubmit={login}>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="email"
              />
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                type="password"
                autoComplete="current-password"
              />
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>
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
    />
  )
}

function WeekScreen({ me, week, dayLabels, busy, error, onLogout, onPrev, onNext, onToggle, rangeLabel }) {
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
          </div>

          <div className="gridWrap">
            <table className="grid">
              <thead>
                <tr>
                  <th></th>
                  {week.days.map((d, idx) => (
                    <th key={d.iso_weekday} title={d.date}>
                      {dayLabels[idx] ?? `D${d.iso_weekday}`}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {week.rows.map((row) => (
                  <tr key={row.direction.id}>
                    <td>{row.direction.name}</td>
                    {week.days.map((d) => {
                      const key = String(d.iso_weekday)
                      const val = Boolean(row.statuses?.[key] ?? row.statuses?.[d.iso_weekday])
                      return (
                        <td key={d.iso_weekday}>
                          <button
                            type="button"
                            className={`markBtn ${val ? 'on' : ''}`}
                            onClick={() => onToggle(row.direction.id, d.iso_weekday, !val)}
                            disabled={busy}
                            title={d.date}
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

          <div className="footerLine">
            ISO {week.year} / week {week.week} • Keep it up! <span className="good">♥</span>
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

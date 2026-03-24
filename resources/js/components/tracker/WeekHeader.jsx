import React from 'react'

export default function WeekHeader({ me, doneToday, pct, busy, onLogout }) {
  return (
    <>
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

        <div className="meta">
          {'<'} User: <span className="good">{me?.email ?? me?.name}</span>
          {' >'} • Done today: <span className="good">{doneToday}</span> • Week:{' '}
          <span className="good">{pct}%</span>
        </div>
      </div>
    </>
  )
}
import React from 'react'
import AuthPage from '../pages/AuthPage'
import WeekPage from '../pages/WeekPage'
import { useTrackerApp } from '../hooks/useTrackerApp'

export default function App() {
  const tracker = useTrackerApp()
  const { booting } = tracker

  if (booting) {
    return (
      <div className="container">
        <div className="term">
          <div className="termTop">
            <div className="badge">
              <span className="dot" />
              <span>user@host: ~/tasks</span>
            </div>
          </div>

          <div className="termBody">
            <div className="hTitle">
              <span>tracker</span>
              <span className="dim">/ loading</span>
            </div>

            <div className="hr" />
            <div className="meta">Loading…</div>
          </div>
        </div>
      </div>
    )
  }

  if (!tracker.me) {
    return (
      <AuthPage
        mode={tracker.mode}
        setMode={tracker.setMode}
        email={tracker.email}
        setEmail={tracker.setEmail}
        password={tracker.password}
        setPassword={tracker.setPassword}
        loading={tracker.loading}
        error={tracker.error}
        onLogin={tracker.login}
        onRegister={tracker.register}
      />
    )
  }

  if (!tracker.week) {
    return (
      <div className="container">
        <div className="term">
          <div className="termTop">
            <div className="badge">
              <span className="dot" />
              <span>user@host: ~/tasks</span>
            </div>

            <button className="keyBtn" onClick={tracker.logout} disabled={tracker.loading} type="button">
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

            {tracker.error ? <div className="alert">{tracker.error}</div> : null}

            <div className="meta">{tracker.loading ? 'Loading…' : 'No week loaded'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <WeekPage
      me={tracker.me}
      week={tracker.week}
      notes={tracker.notes}
      dayLabels={tracker.dayLabels}
      busy={tracker.loading}
      error={tracker.error}
      onLogout={tracker.logout}
      onPrev={tracker.prevWeek}
      onNext={tracker.nextWeek}
      onToggle={tracker.toggleMark}
      rangeLabel={tracker.rangeLabel}
      pending={tracker.pending}
      streaks={tracker.streaks}
      onReloadWeek={() => tracker.reloadWeekOnly(tracker.selected)}
      onDeleteDirection={tracker.deleteDirection}
      onCreateNote={tracker.onCreateNote}
      onDeleteNote={tracker.onDeleteNote}
      onUpdateNote={tracker.onUpdateNote}
      todos={tracker.todos}
      onCreateTodo={tracker.onCreateTodo}
      onToggleTodo={tracker.onToggleTodo}
      onDeleteTodo={tracker.onDeleteTodo}
      onUpdateTodo={tracker.onUpdateTodo}
    />
  )
}
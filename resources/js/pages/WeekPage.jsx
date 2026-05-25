import React, { useState } from 'react'
import CreateDirectionForm from '../components/directions/CreateDirectionForm'
import WeekGrid from '../components/tracker/WeekGrid'
import WeekStats from '../components/tracker/WeekStats'
import { todayStrLocal } from '../lib/date'
import ConfirmModal from '../components/ConfirmModal'
import NotesPanel from '../components/notes/NotesPanel'
import TodoPanel from '../components/todos/TodoPanel'

export default function WeekPage({
  me,
  week,
  notes,
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
  onCreateNote,
  onDeleteDirection,
  onDeleteNote,
  onUpdateNote,
  todos,
  onCreateTodo,
  onToggleTodo,
  onDeleteTodo,
}) {
  const today = todayStrLocal()
  const totalCells = week.rows.length * week.days.length

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedDirections, setSelectedDirections] = useState([])
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

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

  function startSelectionMode() {
    setSelectionMode(true)
    setSelectedDirections([])
  }

  function cancelSelectionMode() {
    setSelectionMode(false)
    setSelectedDirections([])
  }

  function toggleDirectionSelection(directionId) {
    setSelectedDirections((prev) =>
      prev.includes(directionId)
        ? prev.filter((id) => id !== directionId)
        : [...prev, directionId]
    )
  }

  function requestDeleteSelected() {
    if (!selectedDirections.length) return
    setConfirmDeleteOpen(true)
  }

  function cancelDeleteSelected() {
    setConfirmDeleteOpen(false)
  }

  async function confirmDeleteSelected() {
    setConfirmDeleteOpen(false)

    for (const directionId of selectedDirections) {
      await onDeleteDirection?.(directionId)
    }

    setSelectedDirections([])
    setSelectionMode(false)
  }

  return (
    <>
      <div className="container">
        <div className="term">
          <div className="termTop">
            <div className="badge">
              <span className="dot" />
              <span>tracker@system: ~/week</span>
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
              {' >'} • Done today: <span className="good">{doneToday}</span> • Week:{' '}
              <span className="good">{pct}%</span>
            </div>

            <div className="toolbarRow">
              <CreateDirectionForm
                disabled={busy || selectionMode}
                onCreated={() => {
                  onReloadWeek?.()
                }}
              />

              <div className="bulkActions">
                {!selectionMode ? (
                  <button
                    type="button"
                    className="navBtn"
                    onClick={startSelectionMode}
                    disabled={busy}
                  >
                    Select
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="navBtn dangerBtn"
                      onClick={requestDeleteSelected}
                      disabled={busy || !selectedDirections.length}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      className="navBtn"
                      onClick={cancelSelectionMode}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <WeekGrid
              week={week}
              dayLabels={dayLabels}
              pending={pending}
              busy={busy}
              onToggle={onToggle}
              selectionMode={selectionMode}
              selectedDirections={selectedDirections}
              onToggleDirectionSelection={toggleDirectionSelection}
            />

            <div className="navRow">
              <button className="navBtn" onClick={onPrev} disabled={busy} type="button">
                &lt;&lt; PREV
              </button>

              <div>{rangeLabel}</div>

              <button className="navBtn" onClick={onNext} disabled={busy} type="button">
                NEXT &gt;&gt;
              </button>
            </div>

            <WeekStats
  week={week}
  doneCells={doneCells}
  totalCells={totalCells}
  pct={pct}
  doneToday={doneToday}
  streaks={streaks}
/>

<div className="hr" />

<div className="sidePanels">
  <NotesPanel
    notes={notes}
    busy={busy}
    onCreateNote={onCreateNote}
    onDeleteNote={onDeleteNote}
    onUpdateNote={onUpdateNote}
  />

  <TodoPanel
    todos={todos}
    busy={busy}
    onCreateTodo={onCreateTodo}
    onToggleTodo={onToggleTodo}
    onDeleteTodo={onDeleteTodo}
  />
            </div>
          </div>
        </div>
      </div>

      {confirmDeleteOpen && (
        <ConfirmModal
          count={selectedDirections.length}
          onCancel={cancelDeleteSelected}
          onConfirm={confirmDeleteSelected}
        />
      )}
    </>
  )
}
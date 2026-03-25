import React, { useState } from 'react'
import CreateDirectionForm from '../components/directions/CreateDirectionForm'
import WeekGrid from '../components/tracker/WeekGrid'
import WeekStats from '../components/tracker/WeekStats'
import { todayStrLocal } from '../lib/date'

export default function WeekPage({
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
  const today = todayStrLocal()
  const totalCells = week.rows.length * week.days.length

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedDirections, setSelectedDirections] = useState([])

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

  async function deleteSelectedDirections() {
    if (!selectedDirections.length) return

    const ok = window.confirm('Удалить выбранные направления? Все отметки по ним тоже удалятся.')
    if (!ok) return

    for (const directionId of selectedDirections) {
      await onDeleteDirection?.(directionId)
    }

    setSelectedDirections([])
    setSelectionMode(false)
  }

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
                    onClick={deleteSelectedDirections}
                    disabled={busy || !selectedDirections.length}
                  >
                    Удалить
                  </button>

                  <button
                    type="button"
                    className="navBtn"
                    onClick={cancelSelectionMode}
                    disabled={busy}
                  >
                    Отмена
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
        </div>
      </div>
    </div>
  )
}
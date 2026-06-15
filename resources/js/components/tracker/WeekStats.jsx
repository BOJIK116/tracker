import React from 'react'

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

export default function WeekStats({ week, doneCells, totalCells, pct, doneToday, streaks }) {
  return (
    <div className="kpiRow">
      <span>
        ISO {week.year} / week {week.week}
      </span>

      <span>
        Ready: <span className="good">{doneCells}</span>/<span className="good">{totalCells}</span>{' '}
        ({pct}%)
      </span>

      <span>
        Today: <span className="good">{doneToday}</span>/
        <span className="good">{week.rows.length}</span>
      </span>

      <span>
        Streak: <span className="good">{extractCurrent(streaks)}</span> • Best:{' '}
        <span className="good">{extractBest(streaks)}</span>
      </span>

      <span>
        Keep it up! <span className="good">♥</span>
      </span>
    </div>
  )
}

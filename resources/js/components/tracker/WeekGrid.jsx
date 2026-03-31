import React from 'react'
import { isFutureDate, todayStrLocal } from '../../lib/date'

export default function WeekGrid({
  week,
  dayLabels,
  pending,
  busy,
  onToggle,
  selectionMode,
  selectedDirections,
  onToggleDirectionSelection,
}) {
  const today = todayStrLocal()

  return (
    <div className="gridWrap">
      <table className="grid">
        <thead>
          <tr>
            <th></th>
            {selectionMode ? <th className="selectColHead"></th> : null}

            {week.days.map((d, idx) => (
              <th
                key={d.iso_weekday}
                title={d.date}
                className={d.date === today ? 'todayHead' : ''}
              >
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
              </td>

              {selectionMode ? (
                <td className="dirSelectCell">
                  <button
                    type="button"
                    className={[
                      'selectBtn',
                      selectedDirections?.includes(row.direction.id) ? 'active' : '',
                    ].filter(Boolean).join(' ')}
                    disabled={busy}
                    onClick={() => onToggleDirectionSelection?.(row.direction.id)}
                    title="Select direction"
                  >
                    {selectedDirections?.includes(row.direction.id) ? '✓' : ''}
                  </button>
                </td>
              ) : null}

              {week.days.map((d) => {
                const k = String(d.iso_weekday)
                const val = Boolean(row.statuses?.[k] ?? row.statuses?.[d.iso_weekday])

                const future = isFutureDate(d.date)
                const pKey = `${row.direction.id}|${d.iso_weekday}|${d.date}`
                const isPending = pending?.has?.(pKey)

                return (
                  <td
                    key={d.iso_weekday}
                    className={d.date === today ? 'todayCol' : ''}
                    title={d.date}
                  >
                    <button
                      type="button"
                      className={[
                        'markBtn',
                        val ? 'on' : '',
                        future ? 'future' : '',
                        isPending ? 'pending' : '',
                      ].filter(Boolean).join(' ')}
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
  )
}
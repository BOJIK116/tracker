export function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)

  return { year: d.getUTCFullYear(), week }
}

export function weeksInIsoYear(year) {
  const d = new Date(Date.UTC(year, 11, 28))
  return getIsoWeek(d).week
}

export function shiftIsoWeek(year, week, delta) {
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

export function todayStrLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${y}-${m}-${day}`
}

export function isFutureDate(dateStr) {
  return dateStr > todayStrLocal()
}

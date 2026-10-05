export const money = (n) => Number(n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function fmtDate(d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!d) return '—'
  // Date-only strings would parse as UTC midnight and render a day early in US time zones.
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00`) : new Date(d)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', opts)
}

export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
export const fmtDateTime = (d) => `${fmtDate(d, { month: 'short', day: 'numeric' })} · ${fmtTime(d)}`

export function isoDay(d = new Date()) {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Monday (noon) of the week containing d. */
export function weekStart(d = new Date()) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

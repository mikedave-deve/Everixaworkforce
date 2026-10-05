/* Shared business rules for the employee and admin portals. */

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export const TAX_RATES = { 'Federal income tax': 0.105, 'Social Security': 0.062, Medicare: 0.0145, 'State income tax': 0.04 }

export const MEDICAL_PLANS = {
  pp: { name: 'Everixa PPO Plus', premium: 118 },
  hd: { name: 'HSA-Qualified High Deductible', premium: 74 },
  hm: { name: 'Everixa HMO Select', premium: 92 },
  wv: { name: 'Waive coverage', premium: 0 },
}
export const COVERAGE = {
  ee: { label: 'Employee only', factor: 1 },
  es: { label: 'Employee + spouse', factor: 2.1 },
  ec: { label: 'Employee + child(ren)', factor: 1.9 },
  fa: { label: 'Family', factor: 2.8 },
}
export const medicalPerPaycheck = (e) => {
  if (!e || e.medical === 'wv') return 0
  return round2(((MEDICAL_PLANS[e.medical]?.premium ?? 0) * (COVERAGE[e.coverage]?.factor ?? 1) * 12) / 26)
}

/** Builds a pay statement. Any `taxes` / `deductions` supplied replace the defaults. */
export function buildStub({ rate, regular = 0, overtime = 0, bonus = 0, taxes, deductions, election }) {
  const base = regular * rate + overtime * rate * 1.5
  const gross = round2(base + bonus)
  const tax = taxes ?? Object.fromEntries(Object.entries(TAX_RATES).map(([k, r]) => [k, round2(gross * r)]))
  const ded =
    deductions ??
    (() => {
      const out = {}
      const med = medicalPerPaycheck(election)
      if (med) out['Medical (pre-tax)'] = med
      if (election?.k401) out[`401(k) contribution (${election.k401}%)`] = round2(gross * (election.k401 / 100))
      return out
    })()
  const totalTaxes = round2(Object.values(tax).reduce((a, b) => a + Number(b || 0), 0))
  const totalDeductions = round2(Object.values(ded).reduce((a, b) => a + Number(b || 0), 0))
  return { rate, regular, overtime, bonus, gross, taxes: tax, deductions: ded, totalTaxes, totalDeductions, net: round2(gross - totalTaxes - totalDeductions) }
}

export const DEFAULT_BALANCES = { vacation: 80, sick: 40, personal: 24 }

export const SETUP_FIELDS = ['firstName', 'lastName', 'phone', 'email', 'mailingAddress', 'accountHolder', 'bankName', 'accountNumber', 'routingNumber']

export function setupPercent(values = {}) {
  const done = SETUP_FIELDS.filter((k) => String(values[k] ?? '').trim()).length
  return Math.round((done / SETUP_FIELDS.length) * 100)
}

/** ABA routing-number checksum. */
export function validRouting(n) {
  if (!/^\d{9}$/.test(n)) return false
  const d = n.split('').map(Number)
  return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0
}

/* ── Dates ─────────────────────────────────────────────────────── */
export const isoDay = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const weekStart = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}
export const parseDay = (s) => new Date(`${s}T12:00:00`)
export const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(parseDay(s).getTime())

export function businessDays(start, end) {
  let n = 0
  const d = parseDay(start)
  const stop = parseDay(end)
  while (d <= stop) {
    if (d.getDay() !== 0 && d.getDay() !== 6) n++
    d.setDate(d.getDate() + 1)
  }
  return n
}

export function lastFriday(from = new Date()) {
  const d = new Date(from)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 2) % 7))
  return d
}

export function upcomingHolidays(now = new Date()) {
  const y = now.getFullYear()
  const list = [
    [`${y}-05-25`, 'Memorial Day'], [`${y}-06-19`, 'Juneteenth'], [`${y}-07-04`, 'Independence Day'],
    [`${y}-09-07`, 'Labor Day'], [`${y}-11-11`, "Veterans Day (observed)"], [`${y}-11-26`, 'Thanksgiving Day'],
    [`${y}-12-25`, 'Christmas Day'], [`${y + 1}-01-01`, "New Year's Day"], [`${y + 1}-01-18`, 'Martin Luther King Jr. Day'],
  ]
  const today = isoDay(now)
  return list.filter(([d]) => d >= today).slice(0, 4).map(([date, name]) => ({ date, name }))
}

export const SHIPMENT_STAGES = ['Label Created', 'On the Way', 'Out for Delivery', 'Delivered']

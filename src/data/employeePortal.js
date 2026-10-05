import { addDays, isoDay } from '../lib/portalStore'

/* All figures below are demonstration data. Dates are generated relative to today
   so the portal always looks current. Replace with API calls when a backend exists. */

export const HOURLY_RATE = 24.5

// ─── Pay ────────────────────────────────────────────────────────────────────
function lastFriday(from = new Date()) {
  const d = new Date(from)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 2) % 7))
  return d
}

const HOURS_PATTERN = [80, 80, 84, 80, 78, 80, 82, 80, 80, 76]

export function buildPayStubs(count = 10) {
  const latest = lastFriday()
  return Array.from({ length: count }, (_, i) => {
    const payDate = addDays(latest, -14 * i)
    const periodEnd = addDays(payDate, -6)
    const periodStart = addDays(periodEnd, -13)
    const total = HOURS_PATTERN[i % HOURS_PATTERN.length]
    const regular = Math.min(total, 80)
    const overtime = Math.max(0, total - 80)
    const gross = regular * HOURLY_RATE + overtime * HOURLY_RATE * 1.5
    const taxes = {
      'Federal income tax': gross * 0.105,
      'Social Security': gross * 0.062,
      Medicare: gross * 0.0145,
      'State income tax': gross * 0.04,
    }
    const deductions = {
      'Medical (pre-tax)': 62.5,
      'Dental (pre-tax)': 8.75,
      '401(k) contribution (4%)': gross * 0.04,
    }
    const totalTaxes = Object.values(taxes).reduce((a, b) => a + b, 0)
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)
    return {
      id: `stub-${isoDay(payDate)}`,
      payDate: isoDay(payDate),
      periodStart: isoDay(periodStart),
      periodEnd: isoDay(periodEnd),
      regular,
      overtime,
      rate: HOURLY_RATE,
      gross,
      taxes,
      deductions,
      totalTaxes,
      totalDeductions,
      net: gross - totalTaxes - totalDeductions,
    }
  })
}

export function nextPayday() {
  return addDays(lastFriday(), 14)
}

// ─── Missions & instructions ────────────────────────────────────────────────
export const missions = [
  {
    id: 'm-portland-ops',
    title: 'Client Operations Support — Portland Hub',
    client: 'Pacific Basin Consulting',
    status: 'Active',
    site: '1234 NW Glisan St, Suite 400, Portland, OR 97209',
    schedule: 'Mon–Fri · 8:00 AM – 4:30 PM PT',
    supervisor: { name: 'Daniel Whitmore', role: 'Operations Supervisor', phone: '(863) 243-3789' },
    summary: 'Front-line administrative and data support for the client operations team. Priority is accurate record keeping and same-day response to internal requests.',
    instructions: [
      'Badge in at the reception desk on arrival and sign the visitor ledger if your badge is not active.',
      'Review the daily priorities email from your supervisor before 8:15 AM.',
      'Enter all records in the client system the same day; flag any discrepancy to your supervisor, do not correct source data yourself.',
      'Keep client documents inside approved folders only. No personal email or removable drives.',
      'Clock out for your 30-minute unpaid meal break. Missed breaks must be reported to HR.',
    ],
    safety: ['Know the nearest emergency exit and assembly point (north lot).', 'Report any injury or near-miss to your supervisor within the hour.'],
    dress: 'Business casual. Closed-toe shoes required on the warehouse mezzanine.',
  },
  {
    id: 'm-remote-payroll',
    title: 'Payroll Reconciliation — Remote',
    client: 'ClearSky Technologies',
    status: 'Upcoming',
    site: 'Remote (U.S.)',
    schedule: 'Starts in 2 weeks · Tue/Thu · 9:00 AM – 1:00 PM ET',
    supervisor: { name: 'Matthew Sullivan', role: 'Hiring Manager', phone: '(863) 243-3789' },
    summary: 'Part-time reconciliation of bi-weekly payroll runs against timekeeping exports. Training is provided on day one.',
    instructions: [
      'Complete the client security and confidentiality module before your first session.',
      'Work from a private location on a company-approved device with the VPN connected.',
      'Submit the reconciliation checklist by 1:00 PM on each working day.',
    ],
    safety: ['Ergonomic check: screen at eye level, breaks every 60 minutes.'],
    dress: 'Camera-ready business casual for client video calls.',
  },
  {
    id: 'm-seasonal-logistics',
    title: 'Seasonal Logistics Coordination',
    client: 'NorthWest Industrial',
    status: 'Completed',
    site: 'Tacoma, WA — Distribution Center',
    schedule: 'Completed',
    supervisor: { name: 'Marcus Stone', role: 'Senior Recruitment Consultant', phone: '(863) 243-3789' },
    summary: 'Coordinated inbound shipment scheduling during the peak season. Assignment closed with a positive client review.',
    instructions: ['Assignment complete. No further action required.'],
    safety: [],
    dress: '—',
  },
]

// ─── Activity (seed; user actions are appended live) ────────────────────────
export function seedActivity() {
  const now = new Date()
  const ago = (days, h = 9, m = 0) => {
    const d = addDays(now, -days)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }
  return [
    { id: 's1', type: 'pay', title: 'Pay statement posted', detail: 'Direct deposit sent to account ending 4821', at: ago(2, 6, 0) },
    { id: 's2', type: 'time', title: 'Timesheet approved', detail: 'Approved by Daniel Whitmore', at: ago(3, 14, 12) },
    { id: 's3', type: 'mission', title: 'Instructions updated', detail: 'Client Operations Support — Portland Hub', at: ago(5, 11, 40) },
    { id: 's4', type: 'doc', title: 'Document added', detail: 'Employee Handbook (2026 edition)', at: ago(9, 10, 5) },
    { id: 's5', type: 'security', title: 'Signed in from a new device', detail: 'Windows · Chrome · Portland, OR', at: ago(12, 8, 21) },
    { id: 's6', type: 'benefit', title: 'Benefits election saved', detail: 'Medical, Dental, 401(k) 4%', at: ago(21, 15, 3) },
    { id: 's7', type: 'time', title: 'Time off approved', detail: 'Vacation · 2 days', at: ago(30, 9, 30) },
  ]
}

// ─── Tax forms ──────────────────────────────────────────────────────────────
export function taxFormList() {
  const y = new Date().getFullYear()
  return [
    { id: 'w4', name: 'Form W-4', desc: "Employee's Withholding Certificate", period: 'Current', status: 'On file', action: 'update' },
    { id: 'state', name: 'State Withholding Certificate', desc: 'State income tax withholding election', period: 'Current', status: 'On file', action: 'view' },
    { id: 'i9', name: 'Form I-9', desc: 'Employment Eligibility Verification', period: 'Onboarding', status: 'See Identity Verification', action: 'link' },
    { id: 'w2', name: `Form W-2 (${y - 1})`, desc: 'Wage and Tax Statement', period: `${y - 1}`, status: 'Available', action: 'download' },
    { id: '1095', name: `Form 1095-C (${y - 1})`, desc: 'Employer-Provided Health Insurance Offer and Coverage', period: `${y - 1}`, status: 'Available', action: 'download' },
    { id: 'w2-now', name: `Form W-2 (${y})`, desc: 'Wage and Tax Statement', period: `${y}`, status: `Available Jan 31, ${y + 1}`, action: 'none' },
  ]
}

// ─── Benefits ───────────────────────────────────────────────────────────────
export const medicalPlans = [
  { id: 'pp', name: 'Everixa PPO Plus', premium: 118, deductible: '$1,000', oop: '$4,500', note: 'Largest provider network, no referrals needed.' },
  { id: 'hd', name: 'HSA-Qualified High Deductible', premium: 74, deductible: '$3,200', oop: '$6,500', note: 'Lower premium with a tax-advantaged health savings account.' },
  { id: 'hm', name: 'Everixa HMO Select', premium: 92, deductible: '$500', oop: '$3,800', note: 'Coordinated care through a primary care physician.' },
  { id: 'wv', name: 'Waive coverage', premium: 0, deductible: '—', oop: '—', note: 'I have coverage elsewhere.' },
]

export const coverageLevels = [
  { id: 'ee', label: 'Employee only', factor: 1 },
  { id: 'es', label: 'Employee + spouse', factor: 2.1 },
  { id: 'ec', label: 'Employee + child(ren)', factor: 1.9 },
  { id: 'fa', label: 'Family', factor: 2.8 },
]

export const otherBenefits = [
  { id: 'dental', name: 'Dental', detail: 'Preventive care covered at 100%.', cost: '$8.75 / pay period' },
  { id: 'vision', name: 'Vision', detail: 'Annual exam plus frames or contacts allowance.', cost: '$4.20 / pay period' },
  { id: 'life', name: 'Basic life & AD&D', detail: '1× annual pay, paid by Everixa.', cost: 'Company paid' },
  { id: 'std', name: 'Short-term disability', detail: '60% of pay after a 7-day waiting period.', cost: '$6.10 / pay period' },
]

// ─── Company services ───────────────────────────────────────────────────────
export const companyServices = [
  { id: 'eap', name: 'Employee Assistance Program', body: 'Free, confidential counseling and life-event support for you and your household, available 24/7.', cta: 'Request a callback' },
  { id: 'tuition', name: 'Tuition & Certification Assistance', body: 'Up to $2,500 per year toward job-related courses and professional certifications.', cta: 'Start a request' },
  { id: 'referral', name: 'Referral Bonus Program', body: 'Earn a bonus when someone you refer is placed and completes 90 days.', cta: 'Refer a candidate' },
  { id: 'coach', name: 'Career Coaching', body: 'One-on-one sessions with a recruiter on resumes, interviews and next-step planning.', cta: 'Book a session' },
  { id: 'finwell', name: 'Financial Wellness', body: 'Budgeting tools, earned-wage access guidance and free retirement planning consultations.', cta: 'Request a consultation' },
  { id: 'legal', name: 'Legal & ID Theft Protection', body: 'Discounted legal consultations and identity monitoring through our partner network.', cta: 'Learn more' },
]

// ─── Equipment & logistics ──────────────────────────────────────────────────
export const equipmentSeed = [
  { id: 'eq-badge', item: 'Site access badge', tag: 'BDG-20481', issued: 'Mar 6, 2023', condition: 'Good', ack: true },
  { id: 'eq-laptop', item: 'Laptop — Dell Latitude 5440', tag: 'EW-LT-77310', issued: 'Mar 6, 2023', condition: 'Good', ack: false },
  { id: 'eq-headset', item: 'USB headset', tag: 'EW-HS-11942', issued: 'Mar 6, 2023', condition: 'Good', ack: true },
  { id: 'eq-vest', item: 'Hi-vis safety vest (L)', tag: 'PPE-3358', issued: 'Mar 20, 2023', condition: 'Worn', ack: true },
]

export function shipmentsSeed() {
  const now = new Date()
  const fmt = (n) => isoDay(addDays(now, n))
  return [
    { id: 'sh1', what: 'Replacement badge', carrier: 'UPS', tracking: '1Z84A7430391627184', status: 'In transit', eta: fmt(2), steps: ['Label created', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'], stage: 2 },
    { id: 'sh2', what: 'Ergonomic keyboard kit', carrier: 'FedEx', tracking: '778245019336', status: 'Delivered', eta: fmt(-6), steps: ['Label created', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'], stage: 4 },
  ]
}

// ─── Time off ───────────────────────────────────────────────────────────────
export const timeOffBalances = [
  { id: 'vacation', label: 'Vacation', accrued: 80, used: 16 },
  { id: 'sick', label: 'Sick', accrued: 40, used: 8 },
  { id: 'personal', label: 'Personal', accrued: 24, used: 0 },
]

export function upcomingHolidays() {
  const y = new Date().getFullYear()
  const list = [
    [`${y}-11-11`, "Veterans Day (observed)"],
    [`${y}-11-26`, 'Thanksgiving Day'],
    [`${y}-12-25`, 'Christmas Day'],
    [`${y + 1}-01-01`, "New Year's Day"],
    [`${y + 1}-01-18`, 'Martin Luther King Jr. Day'],
    [`${y + 1}-05-31`, 'Memorial Day'],
  ]
  const today = isoDay()
  return list.filter(([d]) => d >= today).slice(0, 4).map(([date, name]) => ({ date, name }))
}

// ─── Documents ──────────────────────────────────────────────────────────────
export const documents = [
  { id: 1, name: 'Offer Letter', category: 'Onboarding', date: '2023-03-06', size: '112 KB' },
  { id: 2, name: 'Employee Handbook (2026)', category: 'Policies', date: '2026-09-02', size: '842 KB' },
  { id: 3, name: 'Direct Deposit Authorization', category: 'Payroll', date: '2023-03-08', size: '58 KB' },
  { id: 4, name: 'Confidentiality Agreement', category: 'Onboarding', date: '2023-03-06', size: '64 KB' },
  { id: 5, name: 'Safety & Conduct Acknowledgment', category: 'Policies', date: '2023-03-06', size: '71 KB' },
  { id: 6, name: 'W-4 Withholding Form', category: 'Tax', date: '2023-03-06', size: '74 KB' },
  { id: 7, name: 'Benefits Summary Plan Description', category: 'Benefits', date: '2026-07-15', size: '1.2 MB' },
]

// ─── Announcements & recognition ────────────────────────────────────────────
export const announcements = [
  {
    id: 1,
    title: 'Q3 Recognition Awards Announced',
    date: 'Recent',
    body: "Congratulations to everyone recognized in this quarter's awards ceremony. Your dedication continues to set the standard for our entire team.",
  },
  {
    id: 2,
    title: 'Timesheet Submission Deadline',
    date: 'Reminder',
    body: 'Timesheets are due by 5:00 PM every Friday to ensure on-time processing.',
  },
  {
    id: 3,
    title: 'Open Enrollment',
    date: 'Upcoming',
    body: 'Benefits open enrollment runs November 1 – November 15. Review or update your elections in Benefits.',
  },
]

export const recognitionPoints = 1240

// ─── Help & HR ──────────────────────────────────────────────────────────────
export const hrContacts = [
  { name: 'HR & Payroll Desk', detail: 'Pay, benefits, leave and records', phone: '(863) 243-3789', email: 'info@everixaworkforce.com', hours: 'Mon–Fri, 8:00 AM – 6:00 PM PT' },
  { name: 'Safety & Incident Line', detail: 'Injuries, near-misses, site concerns', phone: '(863) 243-3789', email: 'info@everixaworkforce.com', hours: 'Available 24/7 for emergencies' },
]

export const faqs = [
  { q: 'When is payday?', a: 'Pay is issued every other Friday by direct deposit. If the Friday is a bank holiday, funds arrive the business day before.' },
  { q: 'How do I correct a timesheet after submitting it?', a: 'Contact your supervisor before the Friday 5:00 PM deadline and ask them to return it to you. After approval, open a Help request so payroll can adjust the next check.' },
  { q: 'How much notice do I need for time off?', a: 'Please request vacation at least 14 days ahead. Sick leave can be requested the same day.' },
  { q: 'Where do I get my W-2?', a: 'Your W-2 is available in Tax Forms by January 31. You can also request a mailed paper copy through Help & HR.' },
  { q: 'I lost my badge or equipment — what now?', a: 'Open Equipment & Logistics and submit a replacement request. For lost badges, also tell your supervisor so the old badge can be deactivated.' },
  { q: 'How do I change my direct deposit?', a: 'Update it in Information Setup. Changes made before Tuesday take effect on the next pay date; a $0.01 test deposit may be sent first.' },
]

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { mkdtempSync } from 'node:fs'

// Isolated environment: embedded database, no real email, local file storage.
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = ''
process.env.MEMORY_DB_PATH = mkdtempSync(path.join(os.tmpdir(), 'everixa-test-db-'))
process.env.MAIL_DRY_RUN = '1'
process.env.HOSTINGER_API_TOKEN = ''
process.env.BLOB_READ_WRITE_TOKEN = ''
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret'
process.env.ADMIN_EMAIL = 'admin@test.local'
process.env.ADMIN_PASSWORD = 'AdminPass123!'
process.env.COMPANY_NOTIFY_EMAIL = 'hr@test.local'
process.env.FRONTEND_ORIGIN = 'http://localhost:5173'

const { handle } = await import('../server/app.js')
const { closeDb } = await import('../server/db.js')

let server
let base
before(async () => {
  server = http.createServer((req, res) => handle(req, res))
  await new Promise((r) => server.listen(0, r))
  base = `http://127.0.0.1:${server.address().port}`
})
after(async () => {
  server.close()
  await closeDb()
})

async function call(method, url, { body, token, raw, headers = {} } = {}) {
  const res = await fetch(base + url, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body && !raw ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  })
  const type = res.headers.get('content-type') ?? ''
  const data = type.includes('json') ? await res.json() : Buffer.from(await res.arrayBuffer())
  return { status: res.status, data }
}

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)])
const PDF = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(64, 2)])
const sentTo = (to) => (globalThis.__sentMail ?? []).filter((m) => m.to.includes(to))

let adminToken, empToken, empId, missionId, shipmentId
const EMAIL = 'ava@test.local'

test('health', async () => {
  const r = await call('GET', '/api/health')
  assert.equal(r.status, 200)
})

test('signup validates and creates a pending account, emailing the employee and the admin', async () => {
  let r = await call('POST', '/api/auth/signup', { body: { firstName: 'Ava', lastName: 'Martinez', phone: '123', email: EMAIL, password: 'Password1' } })
  assert.equal(r.status, 400)
  r = await call('POST', '/api/auth/signup', { body: { firstName: 'Ava', lastName: 'Martinez', phone: '(512) 555-0199', email: EMAIL, password: 'Password1' } })
  assert.equal(r.status, 200)
  assert.equal(r.data.status, 'pending')
  assert.ok(sentTo(EMAIL).some((m) => /received your Everixa account/i.test(m.subject)), 'employee gets pending email')
  assert.ok(sentTo('hr@test.local').some((m) => /New account request/.test(m.subject)), 'admin is notified')
  assert.match(sentTo(EMAIL)[0].html, /EVERIXA/, 'email uses Everixa branding')
  r = await call('POST', '/api/auth/signup', { body: { firstName: 'Ava', lastName: 'Martinez', phone: '(512) 555-0199', email: EMAIL, password: 'Password1' } })
  assert.equal(r.status, 409)
})

test('pending employee cannot sign in; admin can', async () => {
  let r = await call('POST', '/api/auth/login', { body: { email: EMAIL, password: 'Password1' } })
  assert.equal(r.status, 403)
  assert.equal(r.data.code, 'pending')
  r = await call('POST', '/api/auth/login', { body: { email: 'admin@test.local', password: 'wrong' } })
  assert.equal(r.status, 401)
  r = await call('POST', '/api/auth/login', { body: { email: 'admin@test.local', password: 'AdminPass123!' } })
  assert.equal(r.status, 200)
  adminToken = r.data.token
  assert.equal(r.data.user.role, 'admin')
})

test('employee endpoints reject anonymous and non-admin access to admin routes', async () => {
  assert.equal((await call('GET', '/api/dashboard')).status, 401)
  assert.equal((await call('GET', '/api/admin/overview')).status, 401)
})

test('admin sees the account request with a checklist, approves it, and the employee is emailed', async () => {
  const r = await call('GET', '/api/admin/approvals', { token: adminToken })
  const item = r.data.items.find((i) => i.type === 'account')
  assert.ok(item)
  assert.equal(item.recommendation, 'approve')
  assert.ok(item.checks.length >= 3)
  empId = item.employee.id
  const d = await call('POST', `/api/admin/approvals/account/${item.id}`, { token: adminToken, body: { decision: 'approve' } })
  assert.equal(d.status, 200)
  assert.ok(sentTo(EMAIL).some((m) => /approved/i.test(m.subject)))
})

test('approved employee signs in; non-admin cannot reach admin routes', async () => {
  const r = await call('POST', '/api/auth/login', { body: { email: EMAIL, password: 'Password1', remember: true } })
  assert.equal(r.status, 200)
  empToken = r.data.token
  assert.equal((await call('GET', '/api/admin/overview', { token: empToken })).status, 403)
})

test('admin creates a mission, employee sees it, reads instructions and acknowledges', async () => {
  const m = await call('POST', '/api/admin/missions', {
    token: adminToken,
    body: { title: 'Front desk coverage', client: 'Acme', status: 'Active', site: '1 Main St', schedule: 'Mon-Fri', supervisor: { name: 'Sam', role: 'Lead', phone: '555' }, summary: 'Cover reception.', instructions: ['Badge in', 'Greet visitors'], safety: ['Know exits'], dress: 'Business casual', assignAll: true },
  })
  assert.equal(m.status, 200)
  missionId = m.data.id
  let r = await call('GET', '/api/missions', { token: empToken })
  assert.equal(r.data.missions.length, 1)
  assert.equal(r.data.missions[0].title, 'Front desk coverage')
  assert.equal((await call('POST', `/api/missions/${missionId}/acknowledge`, { token: empToken })).status, 400)
  await call('POST', `/api/missions/${missionId}/progress`, { token: empToken, body: { steps: [0, 1] } })
  assert.equal((await call('POST', `/api/missions/${missionId}/acknowledge`, { token: empToken })).status, 200)
  r = await call('GET', '/api/missions', { token: empToken })
  assert.equal(r.data.missions[0].acknowledged, true)
})

test('admin sets an hourly rate and posts pay; employee sees it and downloads an Everixa PDF', async () => {
  await call('PATCH', `/api/admin/employees/${empId}`, { token: adminToken, body: { hourlyRate: 25, position: 'Receptionist' } })
  const prev = await call('POST', '/api/admin/pay/preview', { token: adminToken, body: { userId: empId, payDate: '2026-09-18', periodStart: '2026-09-05', periodEnd: '2026-09-18', regular: 80, overtime: 4 } })
  assert.equal(prev.status, 200)
  assert.equal(prev.data.stub.gross, 2150)
  const p = await call('POST', '/api/admin/pay', { token: adminToken, body: { userId: empId, payDate: '2026-09-18', periodStart: '2026-09-05', periodEnd: '2026-09-18', regular: 80, overtime: 4 } })
  assert.equal(p.status, 200)
  const pay = await call('GET', '/api/pay', { token: empToken })
  assert.equal(pay.data.stubs.length, 1)
  assert.equal(pay.data.stubs[0].gross, 2150)
  const pdf = await call('GET', `/api/pay/${pay.data.stubs[0].id}/pdf`, { token: empToken })
  assert.equal(pdf.status, 200)
  assert.equal(pdf.data.slice(0, 5).toString(), '%PDF-')
})

test('direct deposit validates the routing number, encrypts the account and emails the admin', async () => {
  let r = await call('POST', '/api/pay/direct-deposit', { token: empToken, body: { accountHolder: 'Ava Martinez', bankName: 'Test Bank', accountNumber: '000123456', routingNumber: '123456789' } })
  assert.equal(r.status, 400)
  r = await call('POST', '/api/pay/direct-deposit', { token: empToken, body: { accountHolder: 'Ava Martinez', bankName: 'Test Bank', accountNumber: '000123456', routingNumber: '021000021' } })
  assert.equal(r.status, 200)
  assert.equal(r.data.directDeposit.accountMasked, '••••3456')
  const pay = await call('GET', '/api/pay', { token: empToken })
  assert.ok(!JSON.stringify(pay.data).includes('000123456'), 'full account number never returned to the employee')
  assert.ok(sentTo('hr@test.local').some((m) => /Direct deposit/.test(m.subject)))
  const adminView = await call('GET', `/api/admin/employees/${empId}`, { token: adminToken })
  assert.equal(adminView.data.directDeposit.account, '000123456')
})

test('timesheet: log, submit, admin approves with preset checks', async () => {
  const monday = (() => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })()
  let r = await call('PUT', `/api/timesheets/${monday}`, { token: empToken, body: { hours: { 0: 8 } } })
  assert.equal(r.status, 200)
  r = await call('POST', `/api/timesheets/${monday}/submit`, { token: empToken })
  assert.equal(r.data.status, 'submitted')
  assert.equal((await call('PUT', `/api/timesheets/${monday}`, { token: empToken, body: { hours: { 0: 9 } } })).status, 400)
  const ap = await call('GET', '/api/admin/approvals', { token: adminToken })
  const sheet = ap.data.items.find((i) => i.type === 'timesheet')
  assert.ok(sheet && sheet.checks.length)
  await call('POST', `/api/admin/approvals/timesheet/${sheet.id}`, { token: adminToken, body: { decision: 'approve' } })
  r = await call('GET', `/api/timesheets/${monday}`, { token: empToken })
  assert.equal(r.data.status, 'approved')
})

test('time off: balance check, request, admin approves', async () => {
  const d = new Date(); d.setDate(d.getDate() + 30)
  const day = d.toISOString().slice(0, 10)
  let r = await call('POST', '/api/timeoff', { token: empToken, body: { type: 'vacation', start: '2020-01-01', end: '2020-01-02' } })
  assert.equal(r.status, 400)
  r = await call('POST', '/api/timeoff', { token: empToken, body: { type: 'vacation', start: day, end: day } })
  assert.equal(r.status, 200)
  const ap = await call('GET', '/api/admin/approvals', { token: adminToken })
  const it = ap.data.items.find((i) => i.type === 'timeoff')
  assert.ok(it)
  await call('POST', `/api/admin/approvals/timeoff/${it.id}`, { token: adminToken, body: { decision: 'approve' } })
  const t = await call('GET', '/api/timeoff', { token: empToken })
  assert.equal(t.data.requests[0].status, 'approved')
  assert.ok(t.data.balances.find((b) => b.id === 'vacation').used >= 8)
})

test('benefits + tax: submit, admin preset, approval enables the PDFs', async () => {
  assert.equal((await call('POST', '/api/benefits', { token: empToken, body: { medical: 'xx', coverage: 'ee', k401: 4 } })).status, 400)
  assert.equal((await call('POST', '/api/benefits', { token: empToken, body: { medical: 'hd', coverage: 'ee', k401: 6 } })).status, 200)
  await call('POST', '/api/tax/w4', { token: empToken, body: { filing: 'single', multipleJobs: 'no', dependents: 0, otherIncome: 0, deductions: 0, extra: 10 } })
  await call('POST', '/api/tax/request', { token: empToken, body: { form: 'w2', year: new Date().getFullYear() } })
  const ap = await call('GET', '/api/admin/approvals', { token: adminToken })
  const w2 = ap.data.items.find((i) => i.type === 'tax' && /W-2/.test(i.title))
  assert.equal(w2.recommendation, 'approve') // payroll exists this year
  for (const it of ap.data.items.filter((i) => ['tax', 'benefits'].includes(i.type))) {
    await call('POST', `/api/admin/approvals/${it.type}/${it.id}`, { token: adminToken, body: { decision: 'approve' } })
  }
  const tax = await call('GET', '/api/tax', { token: empToken })
  for (const f of tax.data.forms) {
    const pdf = await call('GET', `/api/tax/${f.id}/pdf`, { token: empToken })
    assert.equal(pdf.status, 200, `${f.form} pdf`)
    assert.equal(pdf.data.slice(0, 5).toString(), '%PDF-')
  }
  const b = await call('GET', '/api/benefits', { token: empToken })
  assert.equal(b.data.approved.medical, 'hd')
})

test('a rejected request requires a reason', async () => {
  await call('POST', '/api/tax/request', { token: empToken, body: { form: '1095c', year: 2019 } })
  const ap = await call('GET', '/api/admin/approvals', { token: adminToken })
  const it = ap.data.items.find((i) => i.type === 'tax')
  assert.equal((await call('POST', `/api/admin/approvals/tax/${it.id}`, { token: adminToken, body: { decision: 'reject' } })).status, 400)
  assert.equal((await call('POST', `/api/admin/approvals/tax/${it.id}`, { token: adminToken, body: { decision: 'reject', note: it.suggestedNote || 'Not available' } })).status, 200)
})

test('shipments: admin creates, employee tracks, pause shows reason, resume, invoice PDF', async () => {
  const body = {
    from: { name: 'Everixa HQ', address: '1200 Forest Way', city: 'Austin', state: 'TX', zip: '78701' },
    to: { name: 'Ava Martinez', address: '1 Main St', city: 'Portland', state: 'OR', zip: '97209' },
    service: 'Everixa Ground', weightKg: 1.4, reference: 'PO-77', estimatedDelivery: new Date(Date.now() + 3 * 864e5).toISOString(),
    items: [{ description: 'Laptop', qty: 1, unitPrice: 900 }, { description: 'Headset', qty: 2, unitPrice: 45 }], shippingCost: 25,
  }
  const c = await call('POST', '/api/admin/shipments', { token: adminToken, body })
  assert.equal(c.status, 200)
  shipmentId = c.data.shipment.id
  const tracking = c.data.shipment.tracking
  assert.match(tracking, /^EW\d{12}$/)
  assert.equal((await call('GET', '/api/track/NOPE123', { token: empToken })).status, 404)
  let t = await call('GET', `/api/track/${tracking.toLowerCase()}`, { token: empToken })
  assert.equal(t.data.shipment.status, 'Label Created')
  assert.ok(!('items' in t.data.shipment), 'internal fields are not exposed')
  await call('PATCH', `/api/admin/shipments/${shipmentId}`, { token: adminToken, body: { stage: 2 } })
  assert.equal((await call('POST', `/api/admin/shipments/${shipmentId}/pause`, { token: adminToken, body: {} })).status, 400)
  await call('POST', `/api/admin/shipments/${shipmentId}/pause`, { token: adminToken, body: { reason: 'Address needs confirmation' } })
  t = await call('GET', `/api/track/${tracking}`, { token: empToken })
  assert.equal(t.data.shipment.paused, true)
  assert.equal(t.data.shipment.pauseReason, 'Address needs confirmation')
  assert.equal(t.data.shipment.status, 'Paused')
  await call('POST', `/api/admin/shipments/${shipmentId}/resume`, { token: adminToken })
  t = await call('GET', `/api/track/${tracking}`, { token: empToken })
  assert.equal(t.data.shipment.paused, false)
  assert.equal(t.data.shipment.status, 'Out for Delivery')
  const inv = await call('GET', `/api/admin/shipments/${shipmentId}/invoice`, { token: adminToken })
  assert.equal(inv.status, 200)
  assert.equal(inv.data.slice(0, 5).toString(), '%PDF-')
  assert.equal((await call('GET', `/api/admin/shipments/${shipmentId}/invoice`, { token: empToken })).status, 403)
})

test('information setup computes a percentage, validates, and emails the admin the full details', async () => {
  let s = await call('GET', '/api/setup', { token: empToken })
  assert.ok(s.data.percent > 0 && s.data.percent < 100)
  const bad = await call('POST', '/api/setup', { token: empToken, body: { firstName: 'Ava', lastName: 'Martinez', phone: '(512) 555-0199', email: EMAIL, mailingAddress: '1 Main St, Austin TX', accountHolder: 'Ava Martinez', bankName: 'Test Bank', accountNumber: '', routingNumber: '' } })
  assert.equal(bad.status, 200, 'bank numbers already on file are kept when left blank')
  s = await call('GET', '/api/setup', { token: empToken })
  assert.equal(s.data.percent, 100)
  const mail = sentTo('hr@test.local').filter((m) => /Information setup/.test(m.subject)).pop()
  assert.ok(mail.html.includes('000123456') && mail.html.includes('021000021'))
})

test('identity: five images + numbers, validation, masked admin email, admin can view and approve', async () => {
  const slots = ['dlFront', 'dlBack', 'ssnFront', 'ssnBack', 'selfie']
  assert.equal((await call('POST', '/api/identity/upload?slot=dlFront', { token: empToken, raw: PDF })).status, 415)
  const files = {}
  for (const slot of slots) {
    const r = await call('POST', `/api/identity/upload?slot=${slot}`, { token: empToken, raw: PNG, headers: { 'Content-Type': 'image/png' } })
    assert.equal(r.status, 200, slot)
    files[slot] = r.data.id
  }
  assert.equal((await call('POST', '/api/identity', { token: empToken, body: { dlNumber: 'D1234567', ssn: '123', files } })).status, 400)
  assert.equal((await call('POST', '/api/identity', { token: empToken, body: { dlNumber: 'D1234567', ssn: '123-45-6789', files } })).status, 200)
  const mail = sentTo('hr@test.local').filter((m) => /Identity verification/.test(m.subject)).pop()
  assert.ok(!mail.html.includes('123456789'), 'full SSN is not emailed')
  const ap = await call('GET', '/api/admin/approvals', { token: adminToken })
  const it = ap.data.items.find((i) => i.type === 'identity')
  assert.ok(it)
  const detail = await call('GET', `/api/admin/identity/${it.employee.id}`, { token: adminToken })
  assert.equal(detail.data.ssn, '123456789')
  const img = await call('GET', `/api/files/${detail.data.files.selfie}`, { token: adminToken })
  assert.equal(img.status, 200)
  await call('POST', `/api/admin/approvals/identity/${it.id}`, { token: adminToken, body: { decision: 'approve' } })
  assert.equal((await call('GET', '/api/identity', { token: empToken })).data.status, 'verified')
})

test('documents: admin uploads for an employee, employee downloads; others cannot', async () => {
  const up = await call('POST', `/api/admin/documents?userId=${empId}&title=${encodeURIComponent('Offer letter')}&category=Onboarding`, { token: adminToken, raw: PDF, headers: { 'X-Filename': 'offer.pdf', 'Content-Type': 'application/pdf' } })
  assert.equal(up.status, 200)
  const docs = await call('GET', '/api/documents', { token: empToken })
  assert.equal(docs.data.documents.length, 1)
  const file = await call('GET', `/api/files/${docs.data.documents[0].fileId}`, { token: empToken })
  assert.equal(file.status, 200)
  // a second employee must not read it
  await call('POST', '/api/auth/signup', { body: { firstName: 'Bo', lastName: 'Lee', phone: '(512) 555-0100', email: 'bo@test.local', password: 'Password1' } })
  const ap = await call('GET', '/api/admin/approvals', { token: adminToken })
  await call('POST', `/api/admin/approvals/account/${ap.data.items.find((i) => i.type === 'account').id}`, { token: adminToken, body: { decision: 'approve' } })
  const bo = (await call('POST', '/api/auth/login', { body: { email: 'bo@test.local', password: 'Password1' } })).data.token
  assert.equal((await call('GET', `/api/files/${docs.data.documents[0].fileId}`, { token: bo })).status, 403)
  assert.equal((await call('GET', '/api/documents', { token: bo })).data.documents.length, 0)
})

test('profile: update, avatar upload, password change with sessions', async () => {
  let r = await call('PATCH', '/api/me', { token: empToken, body: { firstName: 'Avery', lastName: 'Martinez', phone: '(512) 555-0199' } })
  assert.equal(r.data.user.firstName, 'Avery')
  r = await call('POST', '/api/me/avatar', { token: empToken, raw: PNG, headers: { 'Content-Type': 'image/png' } })
  assert.ok(r.data.user.avatarFileId)
  assert.equal((await call('GET', `/api/files/${r.data.user.avatarFileId}`, { token: empToken })).status, 200)
  assert.equal((await call('POST', '/api/me/password', { token: empToken, body: { current: 'nope', next: 'NewPassword1' } })).status, 400)
  assert.equal((await call('POST', '/api/me/password', { token: empToken, body: { current: 'Password1', next: 'NewPassword1' } })).status, 200)
  assert.equal((await call('POST', '/api/auth/login', { body: { email: EMAIL, password: 'Password1' } })).status, 401)
  const second = await call('POST', '/api/auth/login', { body: { email: EMAIL, password: 'NewPassword1' } })
  assert.equal(second.status, 200)
  const s = await call('GET', '/api/me/sessions', { token: second.data.token })
  assert.ok(s.data.sessions.length >= 2)
  assert.equal(s.data.sessions.filter((x) => x.current).length, 1)
  await call('POST', '/api/me/sessions/revoke-others', { token: second.data.token })
  assert.equal((await call('GET', '/api/auth/me', { token: empToken })).status, 401, 'revoked session is rejected')
  empToken = second.data.token
})

test('services, help and public forms reach the admin mailbox; activity records real events', async () => {
  assert.equal((await call('POST', '/api/services/request', { token: empToken, body: { firstName: 'Avery', surname: 'Martinez', service: 'Career Coaching' } })).status, 200)
  assert.ok(sentTo('hr@test.local').some((m) => /Company service request/.test(m.subject)))
  const h = await call('POST', '/api/help', { token: empToken, body: { topic: 'Pay', subject: 'Question', message: 'Hello' } })
  assert.match(h.data.ref, /^HR-/)
  assert.ok(sentTo('hr@test.local').some((m) => m.subject.includes(h.data.ref)))

  assert.equal((await call('POST', '/api/public/contact', { body: { firstName: 'X', lastName: 'Y', email: 'not-an-email', inquiryType: 'other', message: 'hi there' } })).status, 400)
  assert.equal((await call('POST', '/api/public/contact', { body: { firstName: 'Cy', lastName: 'Dee', email: 'cy@example.com', phone: '', inquiryType: 'employer', company: 'Acme', message: 'We need staff' } })).status, 200)
  assert.equal((await call('POST', '/api/public/apply', { body: { fullName: 'Eve Ng', email: 'eve@example.com', phone: '(512) 555-0111', dob: '1990-01-01', address: '2 Oak St', jobPosition: 'Payroll Specialist', availability: 'Full Time', workDuration: 'Long-term' } })).status, 200)
  const up = await call('POST', '/api/public/upload', { raw: PDF, headers: { 'X-Filename': 'cv.pdf', 'Content-Type': 'application/pdf' } })
  assert.equal(up.status, 200)
  assert.equal((await call('POST', '/api/public/resume', { body: { firstName: 'Flo', lastName: 'Ray', email: 'flo@example.com', phone: '(512) 555-0122', industry: 'Finance', fileId: up.data.id } })).status, 200)
  assert.equal((await call('POST', '/api/public/resume', { body: { firstName: 'Flo', lastName: 'Ray', email: 'flo@example.com', phone: '(512) 555-0122', industry: 'Finance' } })).status, 400)
  const inbox = await call('GET', '/api/admin/inbox', { token: adminToken })
  const types = new Set(inbox.data.items.map((i) => i.type))
  for (const t of ['contact', 'apply', 'resume', 'help', 'service', 'setup']) assert.ok(types.has(t), `inbox has ${t}`)
  assert.equal((await call('GET', '/api/files/' + inbox.data.items.find((i) => i.type === 'resume').fileId, { token: adminToken })).status, 200)

  const act = await call('GET', '/api/activity', { token: empToken })
  const titles = act.data.items.map((i) => i.title)
  for (const t of ['Account approved', 'Instructions acknowledged', 'Pay statement posted', 'Timesheet approved', 'Time off approved', 'Identity verified', 'Help request opened']) assert.ok(titles.includes(t), `activity has "${t}"`)
})

test('dashboard reflects real data', async () => {
  const d = await call('GET', '/api/dashboard', { token: empToken })
  assert.equal(d.status, 200)
  assert.equal(d.data.hoursThisWeek, 8)
  assert.equal(d.data.setupPercent, 100)
  assert.equal(d.data.mission.title, 'Front desk coverage')
  assert.ok(d.data.nextPayday)
  assert.ok(d.data.vacation.available < d.data.vacation.accrued)
})

test('password reset flow emails a link and changes the password', async () => {
  await call('POST', '/api/auth/forgot', { body: { email: EMAIL } })
  const mail = sentTo(EMAIL).filter((m) => /Reset your Everixa/.test(m.subject)).pop()
  const token = mail.html.match(/token=([a-f0-9]{64})/)[1]
  assert.equal((await call('POST', '/api/auth/reset', { body: { token: 'bad', password: 'Another1234' } })).status, 400)
  assert.equal((await call('POST', '/api/auth/reset', { body: { token, password: 'Another1234' } })).status, 200)
  assert.equal((await call('POST', '/api/auth/login', { body: { email: EMAIL, password: 'Another1234' } })).status, 200)
})

test('Vercel-style routing: /api?__path=... reaches the same routes and keeps other query params', async () => {
  assert.equal((await call('GET', '/api?__path=health')).status, 200)
  assert.equal((await call('GET', '/api/health?__path=health')).status, 200)
  // multi-segment path through the rewritten URL
  const login = await call('POST', '/api?__path=auth/login', { body: { email: EMAIL, password: 'Another1234' } })
  assert.equal(login.status, 200, 'login through the rewritten URL')
  // a real query param (used by uploads) survives alongside __path
  const up = await call('POST', '/api?__path=identity/upload&slot=dlFront', { token: login.data.token, raw: PNG, headers: { 'Content-Type': 'image/png' } })
  assert.equal(up.status, 200, 'identity upload through the rewritten URL')
})

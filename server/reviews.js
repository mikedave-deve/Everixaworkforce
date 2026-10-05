import { ObjectId, oid } from './db.js'
import { COVERAGE, DEFAULT_BALANCES, MEDICAL_PLANS, parseDay } from './domain.js'
import { decrypt } from './crypto.js'
import { sendMail } from './mailer.js'
import { accountApproved, accountRejected } from './emails.js'
import { logActivity } from './activity.js'
import { HttpError } from './http.js'

/**
 * Approval presets. Every pending item is returned with:
 *   checks:        automatic yes/no checks (ok / warn / fail)
 *   recommendation: 'approve' | 'review' | 'reject'
 *   suggestedNote:  a ready-to-use rejection reason when the recommendation is 'reject'
 * so an admin can see at a glance what is safe to approve.
 */
const ok = (label, detail = '') => ({ label, status: 'ok', detail })
const warn = (label, detail = '') => ({ label, status: 'warn', detail })
const fail = (label, detail = '') => ({ label, status: 'fail', detail })

function recommend(checks) {
  if (checks.some((c) => c.status === 'fail')) return 'reject'
  if (checks.some((c) => c.status === 'warn')) return 'review'
  return 'approve'
}

const nameOf = (u) => (u ? `${u.firstName} ${u.lastName}` : 'Unknown employee')
const sumHours = (h = {}) => Object.values(h).reduce((a, b) => a + Number(b || 0), 0)

function item({ type, doc, user, title, summary, at, checks, suggestedNote = '' }) {
  return {
    type,
    id: String(doc._id),
    employee: user ? { id: String(user._id), name: nameOf(user), employeeId: user.employeeId } : null,
    title,
    summary,
    submittedAt: at,
    checks,
    recommendation: recommend(checks),
    suggestedNote,
  }
}

export async function listApprovals(db) {
  const users = new Map()
  const need = async (ids) => {
    const missing = [...new Set(ids.map(String))].filter((i) => !users.has(i)).map((i) => new ObjectId(i))
    if (missing.length) for (const u of await db.collection('users').find({ _id: { $in: missing } }).toArray()) users.set(String(u._id), u)
  }
  const out = []

  /* Accounts */
  const accounts = await db.collection('users').find({ status: 'pending' }).sort({ createdAt: 1 }).toArray()
  for (const u of accounts) {
    const dup = await db.collection('users').findOne({ _id: { $ne: u._id }, firstName: u.firstName, lastName: u.lastName, status: 'approved' })
    const checks = [
      ok('Valid email address', u.email),
      ok('Phone number provided', u.phone),
      dup ? warn('Same name as an existing employee', `${nameOf(dup)} (${dup.employeeId})`) : ok('No duplicate name on file'),
    ]
    out.push(item({ type: 'account', doc: u, user: u, title: 'New account request', summary: `${nameOf(u)} · ${u.email} · ${u.phone}`, at: u.createdAt, checks }))
  }

  /* Timesheets */
  const sheets = await db.collection('timesheets').find({ status: 'submitted' }).sort({ submittedAt: 1 }).toArray()
  await need(sheets.map((s) => s.userId))
  for (const s of sheets) {
    const u = users.get(String(s.userId))
    const total = sumHours(s.hours)
    const hasMission = await db.collection('missions').findOne({ status: 'Active', archived: { $ne: true }, $or: [{ assignAll: true }, { assignees: s.userId }] })
    const checks = [
      total > 0 ? ok('Hours were logged', `${total.toFixed(1)} h`) : fail('No hours logged'),
      total <= 60 ? ok('Within a normal week (≤ 60 h)') : warn('Unusually high hours', `${total.toFixed(1)} h`),
      total > 40 ? warn('Includes overtime', `${(total - 40).toFixed(1)} h at 1.5×`) : ok('No overtime'),
      hasMission ? ok('Employee has an active mission') : warn('No active mission assigned', 'Hours may not map to a client'),
    ]
    out.push(item({ type: 'timesheet', doc: s, user: u, title: `Timesheet · week of ${s.week}`, summary: `${total.toFixed(1)} hours submitted`, at: s.submittedAt, checks, suggestedNote: 'Please correct the hours and resubmit.' }))
  }

  /* Time off */
  const leaves = await db.collection('timeoff').find({ status: 'pending' }).sort({ requestedAt: 1 }).toArray()
  await need(leaves.map((l) => l.userId))
  for (const l of leaves) {
    const u = users.get(String(l.userId))
    const bal = { ...DEFAULT_BALANCES, ...(u?.balances ?? {}) }
    const taken = await db.collection('timeoff').find({ userId: l.userId, type: l.type, status: 'approved' }).toArray()
    const available = bal[l.type] - taken.reduce((a, t) => a + t.hours, 0)
    const overlap = await db.collection('timeoff').findOne({ userId: l.userId, status: 'approved', start: { $lte: l.end }, end: { $gte: l.start } })
    const notice = Math.round((parseDay(l.start) - Date.now()) / 864e5)
    const checks = [
      available >= l.hours ? ok('Enough leave balance', `${available}h available, ${l.hours}h requested`) : fail('Not enough leave balance', `${available}h available, ${l.hours}h requested`),
      overlap ? fail('Overlaps approved leave', `${overlap.start} – ${overlap.end}`) : ok('No overlap with approved leave'),
      l.type === 'vacation' ? (notice >= 14 ? ok('14+ days notice given') : warn('Less than 14 days notice', `${Math.max(0, notice)} days`)) : ok('Notice policy does not apply'),
    ]
    out.push(item({
      type: 'timeoff', doc: l, user: u, title: `${l.type[0].toUpperCase() + l.type.slice(1)} leave · ${l.days} day${l.days > 1 ? 's' : ''}`,
      summary: `${l.start} → ${l.end}${l.note ? ` · “${l.note}”` : ''}`, at: l.requestedAt, checks,
      suggestedNote: available < l.hours ? 'Your leave balance does not cover these dates.' : overlap ? 'These dates overlap leave that is already approved.' : '',
    }))
  }

  /* Tax forms */
  const forms = await db.collection('taxforms').find({ status: 'pending' }).sort({ requestedAt: 1 }).toArray()
  await need(forms.map((f) => f.userId))
  for (const f of forms) {
    const u = users.get(String(f.userId))
    let checks
    let title
    let summary
    let suggestedNote = ''
    if (f.form === 'w4') {
      title = 'Form W-4 withholding update'
      summary = `${f.data.filing} · extra $${f.data.extra}/period`
      checks = [
        ok('Filing status recognised', f.data.filing),
        f.data.extra <= 500 ? ok('Extra withholding is reasonable', `$${f.data.extra}`) : warn('Large extra withholding', `$${f.data.extra} per period`),
        f.data.dependents <= 20000 ? ok('Dependents credit within range') : warn('High dependents credit', `$${f.data.dependents}`),
      ]
    } else {
      const count = await db.collection('payroll').countDocuments({ userId: f.userId, payDate: { $gte: `${f.year}-01-01`, $lte: `${f.year}-12-31` } })
      title = `${f.form === 'w2' ? 'Form W-2' : 'Form 1095-C'} · ${f.year}`
      summary = `Requested for tax year ${f.year}`
      if (f.form === 'w2') {
        checks = [count ? ok('Payroll records exist', `${count} pay statement${count > 1 ? 's' : ''} in ${f.year}`) : fail(`No payroll records for ${f.year}`)]
        if (!count) suggestedNote = `We have no pay records for ${f.year}, so a W-2 cannot be issued.`
      } else {
        const el = await db.collection('benefits').findOne({ userId: f.userId, status: 'approved' })
        checks = [el ? ok('Benefits election on file') : fail('No approved benefits election')]
        if (!el) suggestedNote = 'There is no approved benefits election on file for this employee.'
      }
    }
    out.push(item({ type: 'tax', doc: f, user: u, title, summary, at: f.requestedAt, checks, suggestedNote }))
  }

  /* Benefits */
  const bens = await db.collection('benefits').find({ status: 'pending' }).sort({ submittedAt: 1 }).toArray()
  await need(bens.map((b) => b.userId))
  for (const b of bens) {
    const u = users.get(String(b.userId))
    const tenure = u?.startDate ? Math.round((Date.now() - parseDay(u.startDate)) / 864e5) : 0
    const month = new Date().getMonth()
    const inEnrollment = month === 10 && new Date().getDate() <= 15
    const checks = [
      MEDICAL_PLANS[b.medical] && COVERAGE[b.coverage] ? ok('Plan and coverage level are valid') : fail('Invalid plan selection'),
      b.k401 <= 15 ? ok('401(k) within the 15% limit', `${b.k401}%`) : fail('401(k) exceeds the limit'),
      tenure >= 30 ? ok('Employee has 30+ days of tenure', `${tenure} days`) : warn('Less than 30 days of tenure', `${tenure} days`),
      inEnrollment ? ok('Within open enrollment (Nov 1–15)') : warn('Outside open enrollment', 'Confirm a qualifying life event'),
    ]
    out.push(item({ type: 'benefits', doc: b, user: u, title: 'Benefits election', summary: `${MEDICAL_PLANS[b.medical]?.name} · ${COVERAGE[b.coverage]?.label} · 401(k) ${b.k401}%`, at: b.submittedAt, checks, suggestedNote: 'Please contact HR about your qualifying life event.' }))
  }

  /* Identity */
  const ids = await db.collection('users').find({ 'identity.status': 'submitted' }).sort({ 'identity.submittedAt': 1 }).toArray()
  for (const u of ids) {
    const i = u.identity
    const ssn = decrypt(i.ssnEnc)
    const badSsn = /^(\d)\1{8}$/.test(ssn) || ssn.startsWith('000') || ssn.startsWith('666') || ssn.startsWith('9') || ssn.slice(3, 5) === '00' || ssn.slice(5) === '0000'
    const checks = [
      Object.keys(i.files ?? {}).length === 5 ? ok('All 5 images uploaded', "Licence front/back, SSN card front/back, selfie") : fail('Missing images'),
      /^[A-Za-z0-9]{4,20}$/.test(decrypt(i.dlEnc)) ? ok("Driver's license number format looks valid") : fail("Driver's license number looks invalid"),
      badSsn ? fail('SSN is not a possible valid number') : ok('SSN passes basic validity rules'),
      warn('Compare the images with the numbers', 'Open the documents and confirm the name and numbers match'),
    ]
    const rec = item({ type: 'identity', doc: { _id: u._id }, user: u, title: 'Identity verification', summary: `Licence ${'••••' + i.dlLast4} · SSN ${'••••' + i.ssnLast4}`, at: i.submittedAt, checks, suggestedNote: 'The documents provided could not be verified. Please resubmit clear photos.' })
    out.push(rec)
  }

  return out.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
}

export async function decide(db, type, id, decision, note, admin) {
  if (!['approve', 'reject'].includes(decision)) throw new HttpError(400, 'Invalid decision.')
  if (decision === 'reject' && !String(note ?? '').trim() && type !== 'timesheet') throw new HttpError(400, 'Please add a short reason so the employee knows why.')
  const _id = oid(id)
  const now = new Date()
  const approved = decision === 'approve'
  const stamp = { reviewedAt: now, reviewedBy: admin._id, reviewNote: String(note ?? '').trim() }

  const notFound = () => new HttpError(404, 'That request is no longer pending.')

  if (type === 'account') {
    const u = await db.collection('users').findOneAndUpdate({ _id, status: 'pending' }, { $set: { status: approved ? 'approved' : 'rejected', ...stamp } }, { returnDocument: 'after' })
    if (!u) throw notFound()
    await sendMail({ to: u.email, ...(approved ? accountApproved(u) : accountRejected(u, stamp.reviewNote)) })
    await logActivity(u._id, 'security', approved ? 'Account approved' : 'Account request rejected', stamp.reviewNote)
    return
  }
  if (type === 'timesheet') {
    const s = await db.collection('timesheets').findOneAndUpdate({ _id, status: 'submitted' }, { $set: { status: approved ? 'approved' : 'rejected', ...stamp } }, { returnDocument: 'after' })
    if (!s) throw notFound()
    await logActivity(s.userId, 'time', approved ? 'Timesheet approved' : 'Timesheet returned', approved ? `Week of ${s.week}` : stamp.reviewNote || `Week of ${s.week}`)
    return
  }
  if (type === 'timeoff') {
    const t = await db.collection('timeoff').findOneAndUpdate({ _id, status: 'pending' }, { $set: { status: approved ? 'approved' : 'denied', ...stamp } }, { returnDocument: 'after' })
    if (!t) throw notFound()
    await logActivity(t.userId, 'timeoff', approved ? 'Time off approved' : 'Time off denied', `${t.type} · ${t.start} → ${t.end}${stamp.reviewNote ? ` · ${stamp.reviewNote}` : ''}`)
    return
  }
  if (type === 'tax') {
    const f = await db.collection('taxforms').findOneAndUpdate({ _id, status: 'pending' }, { $set: { status: approved ? 'approved' : 'rejected', ...stamp } }, { returnDocument: 'after' })
    if (!f) throw notFound()
    const name = f.form === 'w4' ? 'W-4' : f.form === 'w2' ? `W-2 (${f.year})` : `1095-C (${f.year})`
    await logActivity(f.userId, 'pay', approved ? `${name} approved` : `${name} not approved`, stamp.reviewNote)
    return
  }
  if (type === 'benefits') {
    const b = await db.collection('benefits').findOneAndUpdate({ _id, status: 'pending' }, { $set: { status: approved ? 'approved' : 'rejected', ...stamp } }, { returnDocument: 'after' })
    if (!b) throw notFound()
    await logActivity(b.userId, 'benefit', approved ? 'Benefits election approved' : 'Benefits election not approved', stamp.reviewNote)
    return
  }
  if (type === 'identity') {
    const u = await db.collection('users').findOneAndUpdate({ _id, 'identity.status': 'submitted' }, { $set: { 'identity.status': approved ? 'verified' : 'rejected', 'identity.reviewedAt': now, 'identity.note': stamp.reviewNote } }, { returnDocument: 'after' })
    if (!u) throw notFound()
    await logActivity(u._id, 'security', approved ? 'Identity verified' : 'Identity verification rejected', stamp.reviewNote)
    return
  }
  throw new HttpError(400, 'Unknown request type.')
}


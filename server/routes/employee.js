import { randomInt, timingSafeEqual } from 'node:crypto'
import { getDb, oid, ser } from '../db.js'
import { bad, notFound, readBody, readJson, str, email as vEmail, phone as vPhone, num, forbidden, rateLimit } from '../http.js'
import { requireAuth, publicUser } from '../auth.js'
import { decrypt, encrypt, last4, mask, sha256 } from '../crypto.js'
import { notifyCompany, sendMail } from '../mailer.js'
import { adminNotice, transferCode, transferComplete } from '../emails.js'
import { saveFile } from '../storage.js'
import { logActivity } from '../activity.js'
import { signedFileUrl } from '../links.js'
import {
  COVERAGE, DEFAULT_BALANCES, MEDICAL_PLANS, addDays, businessDays, isDay, isoDay,
  parseDay, round2, setupPercent, upcomingHolidays, validRouting, weekStart,
} from '../domain.js'
import { normalizeTracking, shipmentView } from '../shipments.js'
import { f1095Pdf, payStubPdf, w2Pdf, w4Pdf } from '../pdf.js'

const WEEK_DAYS = 7
const sumHours = (h = {}) => Object.values(h).reduce((a, b) => a + Number(b || 0), 0)

/** Missions visible to this employee. */
async function myMissions(db, userId) {
  return db
    .collection('missions')
    .find({ archived: { $ne: true }, $or: [{ assignAll: true }, { assignees: userId }] })
    .sort({ createdAt: -1 })
    .toArray()
}

function bankFromBody(b, existing) {
  const holder = str(b.accountHolder, { field: 'Account holder name', min: 2, max: 100 })
  const bank = str(b.bankName, { field: 'Bank name', min: 2, max: 100 })
  const acct = String(b.accountNumber ?? '').replace(/\s|-/g, '')
  const routing = String(b.routingNumber ?? '').replace(/\s|-/g, '')
  const out = { holder, bank, updatedAt: new Date() }
  if (acct || !existing?.accountEnc) {
    if (!/^\d{4,17}$/.test(acct)) throw bad('Account number must be 4–17 digits.')
    out.accountEnc = encrypt(acct)
    out.last4 = last4(acct)
  } else {
    out.accountEnc = existing.accountEnc
    out.last4 = existing.last4
  }
  if (routing || !existing?.routingEnc) {
    if (!validRouting(routing)) throw bad('That routing number is not valid. Check the 9 digits on your check or banking app.')
    out.routingEnc = encrypt(routing)
    out.routingLast4 = last4(routing)
  } else {
    out.routingEnc = existing.routingEnc
    out.routingLast4 = existing.routingLast4
  }
  return { out, acct, routing }
}

/** One source of truth for the Information Setup values and completion percentage. */
function setupState(u) {
  const s = u.setup ?? {}
  const dd = u.directDeposit
  const values = {
    firstName: s.firstName ?? u.firstName, lastName: s.lastName ?? u.lastName, phone: s.phone ?? u.phone,
    email: s.email ?? u.email, mailingAddress: s.mailingAddress ?? '', accountHolder: dd?.holder ?? '', bankName: dd?.bank ?? '',
  }
  return {
    values,
    bank: { onFile: Boolean(dd?.accountEnc), accountMasked: dd?.accountEnc ? mask(dd.last4) : '', routingMasked: dd?.routingEnc ? mask(dd.routingLast4) : '' },
    submittedAt: s.submittedAt ?? null,
    percent: setupPercent({ ...values, accountNumber: dd?.accountEnc ? 'x' : '', routingNumber: dd?.routingEnc ? 'x' : '' }),
  }
}

const TRANSFER_CODE_MINUTES = 10
const TRANSFER_MAX_ATTEMPTS = 5
const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

/** Balance = net pay posted by payroll, minus everything already transferred out. */
async function payBalance(db, userId) {
  const [stubs, sent] = await Promise.all([
    db.collection('payroll').find({ userId }).project({ net: 1 }).toArray(),
    db.collection('transfers').find({ userId }).project({ amount: 1 }).toArray(),
  ])
  const earned = round2(stubs.reduce((a, s) => a + (s.net ?? 0), 0))
  const transferred = round2(sent.reduce((a, t) => a + (t.amount ?? 0), 0))
  return { earned, transferred, balance: Math.max(0, round2(earned - transferred)) }
}

const transferAmount = (v, balance) => {
  const amount = round2(Number(v))
  if (!Number.isFinite(amount) || amount < 1) throw bad('Enter an amount of at least $1.00.')
  if (amount > balance) throw bad(`You can transfer up to ${usd(balance)}.`)
  return amount
}

const maskedDeposit = (d) =>
  d?.accountEnc
    ? { holder: d.holder, bank: d.bank, accountMasked: mask(d.last4), routingMasked: mask(d.routingLast4), updatedAt: d.updatedAt }
    : null

export function registerEmployee(r) {
  /* ── Dashboard ─────────────────────────────────────────────── */
  r.get('/dashboard', requireAuth, async (ctx) => {
    const db = await getDb()
    const uid = ctx.user._id
    const wk = isoDay(weekStart())
    const [sheet, stub, missions, progress, pendingTimeOff, approvedTimeOff, recent] = await Promise.all([
      db.collection('timesheets').findOne({ userId: uid, week: wk }),
      db.collection('payroll').find({ userId: uid }).sort({ payDate: -1 }).limit(1).toArray(),
      myMissions(db, uid),
      db.collection('missionProgress').find({ userId: uid }).toArray(),
      db.collection('timeoff').find({ userId: uid, status: 'pending' }).toArray(),
      db.collection('timeoff').find({ userId: uid, status: 'approved', type: 'vacation' }).toArray(),
      db.collection('activity').find({ userId: uid }).sort({ at: -1 }).limit(6).toArray(),
    ])
    const bal = { ...DEFAULT_BALANCES, ...(ctx.user.balances ?? {}) }
    const vacUsed = [...approvedTimeOff, ...pendingTimeOff.filter((t) => t.type === 'vacation')].reduce((a, t) => a + t.hours, 0)
    const pct = setupState(ctx.user).percent
    const ack = new Set(progress.filter((p) => p.acknowledged).map((p) => String(p.missionId)))
    const active = missions.find((m) => m.status === 'Active')
    const idStatus = ctx.user.identity?.status ?? 'none'

    const todos = []
    if (idStatus === 'none' || idStatus === 'rejected') todos.push({ label: idStatus === 'rejected' ? 'Resubmit your identity verification' : 'Complete identity verification', to: '/portal/identity', tag: 'Required', tone: 'danger' })
    if (pct < 100) todos.push({ label: `Finish information setup — ${pct}% complete`, to: '/portal/setup', tag: 'Setup', tone: 'brass' })
    if (!sheet || ['draft', 'rejected'].includes(sheet.status)) todos.push({ label: "Submit this week's timesheet by Friday 5:00 PM", to: '/portal/timesheet', tag: 'Due Fri', tone: 'brass' })
    for (const m of missions.filter((m) => m.status !== 'Completed' && !ack.has(String(m._id))).slice(0, 2)) {
      todos.push({ label: `Review and acknowledge instructions — ${m.title}`, to: '/portal/missions', tag: 'Mission', tone: 'neutral' })
    }

    const lastPay = stub[0]
    return {
      user: publicUser(ctx.user),
      hoursThisWeek: round2(sumHours(sheet?.hours)),
      timesheetStatus: sheet?.status ?? 'draft',
      nextPayday: lastPay ? isoDay(addDays(parseDay(lastPay.payDate), 14)) : null,
      lastNet: lastPay?.net ?? null,
      vacation: { accrued: bal.vacation, available: Math.max(0, bal.vacation - vacUsed) },
      setupPercent: pct,
      identityStatus: idStatus,
      mission: active ? { id: String(active._id), title: active.title, client: active.client, schedule: active.schedule, site: active.site, status: active.status } : null,
      todos,
      recent: recent.map((a) => ser(a, ['userId'])),
    }
  })

  /* ── Missions & instructions ───────────────────────────────── */
  r.get('/missions', requireAuth, async (ctx) => {
    const db = await getDb()
    const [missions, progress] = await Promise.all([myMissions(db, ctx.user._id), db.collection('missionProgress').find({ userId: ctx.user._id }).toArray()])
    const byMission = new Map(progress.map((p) => [String(p.missionId), p]))
    return {
      missions: missions.map((m) => {
        const p = byMission.get(String(m._id))
        return { ...ser(m, ['assignees', 'assignAll', 'archived']), done: p?.steps ?? [], acknowledged: Boolean(p?.acknowledged) }
      }),
    }
  })

  r.post('/missions/:id/progress', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const db = await getDb()
    const m = await db.collection('missions').findOne({ _id: oid(ctx.params.id) })
    if (!m) throw notFound()
    const steps = [...new Set((Array.isArray(b.steps) ? b.steps : []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < m.instructions.length))]
    await db.collection('missionProgress').updateOne({ userId: ctx.user._id, missionId: m._id }, { $set: { steps } }, { upsert: true })
    ctx.ok({ ok: true, steps })
  })

  r.post('/missions/:id/acknowledge', requireAuth, async (ctx) => {
    const db = await getDb()
    const m = await db.collection('missions').findOne({ _id: oid(ctx.params.id) })
    if (!m) throw notFound()
    const p = await db.collection('missionProgress').findOne({ userId: ctx.user._id, missionId: m._id })
    if ((p?.steps?.length ?? 0) < m.instructions.length) throw bad('Please read every instruction first.')
    await db.collection('missionProgress').updateOne({ userId: ctx.user._id, missionId: m._id }, { $set: { acknowledged: true, ackAt: new Date() } })
    await logActivity(ctx.user._id, 'mission', 'Instructions acknowledged', m.title)
    ctx.ok()
  })

  /* ── Activity history ──────────────────────────────────────── */
  r.get('/activity', requireAuth, async (ctx) => {
    const db = await getDb()
    const list = await db.collection('activity').find({ userId: ctx.user._id }).sort({ at: -1 }).limit(300).toArray()
    return { items: list.map((a) => ser(a, ['userId'])) }
  })

  /* ── Pay ───────────────────────────────────────────────────── */
  r.get('/pay', requireAuth, async (ctx) => {
    const db = await getDb()
    const stubs = await db.collection('payroll').find({ userId: ctx.user._id }).sort({ payDate: -1 }).limit(60).toArray()
    const year = String(new Date().getFullYear())
    const ytd = stubs.filter((s) => s.payDate.startsWith(year))
    const sum = (k) => round2(ytd.reduce((a, s) => a + (s[k] ?? 0), 0))
    const [{ balance }, transfers] = await Promise.all([
      payBalance(db, ctx.user._id),
      db.collection('transfers').find({ userId: ctx.user._id }).sort({ createdAt: -1 }).limit(10).toArray(),
    ])
    return {
      balance,
      transfers: transfers.map((t) => ser(t, ['userId'])),
      rate: ctx.user.hourlyRate ?? 0,
      stubs: stubs.map((s) => ser(s, ['userId'])),
      ytd: { gross: sum('gross'), taxes: sum('totalTaxes'), net: sum('net'), periods: ytd.length },
      nextPayday: stubs[0] ? isoDay(addDays(parseDay(stubs[0].payDate), 14)) : null,
      directDeposit: maskedDeposit(ctx.user.directDeposit),
    }
  })

  r.get('/pay/:id/pdf', requireAuth, async (ctx) => {
    const db = await getDb()
    const stub = await db.collection('payroll').findOne({ _id: oid(ctx.params.id), userId: ctx.user._id })
    if (!stub) throw notFound()
    ctx.file(await payStubPdf(ctx.user, stub), { type: 'application/pdf', filename: `earnings-statement-${stub.payDate}.pdf` })
  })

  r.post('/pay/direct-deposit', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const { out, acct, routing } = bankFromBody(b, ctx.user.directDeposit)
    const db = await getDb()
    await db.collection('users').updateOne({ _id: ctx.user._id }, { $set: { directDeposit: out } })
    await logActivity(ctx.user._id, 'pay', 'Direct deposit updated', `${out.bank} ${mask(out.last4)}`)
    await notifyCompany(adminNotice({
      eyebrow: 'Direct deposit',
      title: `${ctx.user.firstName} ${ctx.user.lastName} updated direct deposit`,
      fields: [
        ['Employee', `${ctx.user.firstName} ${ctx.user.lastName} (${ctx.user.employeeId})`],
        ['Account holder', out.holder], ['Bank', out.bank],
        ['Account number', acct || decrypt(out.accountEnc)], ['Routing number', routing || decrypt(out.routingEnc)],
      ],
      link: `/admin/employees`,
    }))
    ctx.ok({ ok: true, directDeposit: maskedDeposit(out) })
  })

  /* ── Transfer balance to the direct-deposit account ────────── */
  // Step 1: validate the amount and email a 6-digit code to the employee's own address.
  r.post('/pay/transfer/request', requireAuth, async (ctx) => {
    rateLimit(`transfer-req:${ctx.user._id}`, { limit: 6, windowMs: 15 * 60e3 })
    const b = await readJson(ctx.req)
    const dd = ctx.user.directDeposit
    if (!dd?.accountEnc) throw bad('Add your direct deposit account before transferring funds.')
    const db = await getDb()
    const { balance } = await payBalance(db, ctx.user._id)
    const amount = transferAmount(b.amount, balance)

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const expiresAt = new Date(Date.now() + TRANSFER_CODE_MINUTES * 60e3)
    await db.collection('transferCodes').deleteMany({ userId: ctx.user._id })
    await db.collection('transferCodes').insertOne({ userId: ctx.user._id, amount, codeHash: sha256(`${ctx.user._id}:${code}`), attempts: 0, expiresAt, createdAt: new Date() })

    const mail = transferCode(ctx.user, { code, amount: usd(amount), bank: `${dd.bank} ${mask(dd.last4)}`, minutes: TRANSFER_CODE_MINUTES })
    const sent = await sendMail({ to: ctx.user.email, ...mail })
    if (!sent.sent && sent.reason !== 'dry-run') {
      await db.collection('transferCodes').deleteMany({ userId: ctx.user._id })
      throw bad('We could not send your confirmation code. Please try again in a moment.')
    }
    const [name, domain] = ctx.user.email.split('@')
    ctx.ok({ ok: true, amount, expiresInMinutes: TRANSFER_CODE_MINUTES, sentTo: `${name.slice(0, 2)}${'•'.repeat(Math.max(2, name.length - 2))}@${domain}` })
  })

  // Step 2: the employee types the code from the email; on a match the transfer is recorded.
  r.post('/pay/transfer/confirm', requireAuth, async (ctx) => {
    rateLimit(`transfer-confirm:${ctx.user._id}`, { limit: 20, windowMs: 15 * 60e3 })
    const b = await readJson(ctx.req)
    const code = String(b.code ?? '').replace(/\D/g, '')
    if (code.length !== 6) throw bad('Enter the 6-digit code from your email.')
    const db = await getDb()
    const req = await db.collection('transferCodes').findOne({ userId: ctx.user._id })
    if (!req || req.expiresAt < new Date()) throw bad('That code has expired. Request a new one.', 'code-expired')
    if (req.attempts >= TRANSFER_MAX_ATTEMPTS) {
      await db.collection('transferCodes').deleteOne({ _id: req._id })
      throw bad('Too many incorrect attempts. Request a new code.', 'code-expired')
    }
    const given = Buffer.from(sha256(`${ctx.user._id}:${code}`))
    const want = Buffer.from(req.codeHash)
    if (given.length !== want.length || !timingSafeEqual(given, want)) {
      await db.collection('transferCodes').updateOne({ _id: req._id }, { $inc: { attempts: 1 } })
      const left = TRANSFER_MAX_ATTEMPTS - req.attempts - 1
      throw bad(left > 0 ? `That code is not correct. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Request a new code.')
    }
    // Single use: only one request can claim the code.
    const claimed = await db.collection('transferCodes').findOneAndDelete({ _id: req._id })
    if (!claimed) throw bad('That code was already used.')

    const dd = ctx.user.directDeposit
    if (!dd?.accountEnc) throw bad('Add your direct deposit account before transferring funds.')
    const { balance } = await payBalance(db, ctx.user._id)
    const amount = transferAmount(req.amount, balance)
    const reference = `TR-${String(randomInt(0, 1e8)).padStart(8, '0')}`
    const doc = { userId: ctx.user._id, amount, reference, bank: dd.bank, last4: dd.last4, holder: dd.holder, status: 'completed', createdAt: new Date() }
    const { insertedId } = await db.collection('transfers').insertOne(doc)
    const bankLabel = `${dd.bank} ${mask(dd.last4)}`
    await logActivity(ctx.user._id, 'pay', 'Pay transferred to bank', `${usd(amount)} → ${bankLabel} · ${reference}`)
    await notifyCompany(adminNotice({
      eyebrow: 'Pay transfer',
      title: `${ctx.user.firstName} ${ctx.user.lastName} transferred ${usd(amount)}`,
      fields: [
        ['Employee', `${ctx.user.firstName} ${ctx.user.lastName} (${ctx.user.employeeId})`], ['Amount', usd(amount)], ['Reference', reference],
        ['Account holder', dd.holder], ['Bank', dd.bank], ['Account number', decrypt(dd.accountEnc)], ['Routing number', decrypt(dd.routingEnc)],
      ],
      link: '/admin/employees',
    }))
    await sendMail({ to: ctx.user.email, ...transferComplete(ctx.user, { amount: usd(amount), bank: bankLabel, reference }) })
    ctx.ok({ ok: true, transfer: ser({ _id: insertedId, ...doc }, ['userId']), balance: round2(balance - amount) })
  })

  /* ── Time sheet ────────────────────────────────────────────── */
  const sheetView = (week, doc) => ({
    week,
    hours: doc?.hours ?? {},
    status: doc?.status ?? 'draft',
    clockIn: doc?.clockIn ?? null,
    submittedAt: doc?.submittedAt ?? null,
    reviewNote: doc?.reviewNote ?? '',
  })
  const validWeek = (w) => {
    if (!isDay(w) || parseDay(w).getDay() !== 1) throw bad('Invalid week.')
    return w
  }

  r.get('/timesheets/:week', requireAuth, async (ctx) => {
    const week = validWeek(ctx.params.week)
    const db = await getDb()
    return sheetView(week, await db.collection('timesheets').findOne({ userId: ctx.user._id, week }))
  })

  r.put('/timesheets/:week', requireAuth, async (ctx) => {
    const week = validWeek(ctx.params.week)
    const b = await readJson(ctx.req)
    const db = await getDb()
    const cur = await db.collection('timesheets').findOne({ userId: ctx.user._id, week })
    if (cur && ['submitted', 'approved'].includes(cur.status)) throw bad('This timesheet is locked. Ask your supervisor to reopen it.')
    const today = isoDay()
    const hours = {}
    for (let i = 0; i < WEEK_DAYS; i++) {
      const v = Number(b.hours?.[i] ?? 0)
      if (!Number.isFinite(v) || v < 0 || v > 24) throw bad('Hours must be between 0 and 24.')
      if (v > 0 && isoDay(addDays(parseDay(week), i)) > today) throw bad('You cannot log hours for a future day.')
      if (v > 0) hours[i] = round2(v)
    }
    await db.collection('timesheets').updateOne({ userId: ctx.user._id, week }, { $set: { hours }, $setOnInsert: { status: 'draft', createdAt: new Date() } }, { upsert: true })
    return sheetView(week, await db.collection('timesheets').findOne({ userId: ctx.user._id, week }))
  })

  r.post('/timesheets/:week/clock', requireAuth, async (ctx) => {
    const week = validWeek(ctx.params.week)
    if (week !== isoDay(weekStart())) throw bad('You can only clock in for the current week.')
    const b = await readJson(ctx.req)
    const db = await getDb()
    const cur = await db.collection('timesheets').findOne({ userId: ctx.user._id, week })
    if (cur && ['submitted', 'approved'].includes(cur.status)) throw bad('This timesheet is locked.')
    if (b.action === 'in') {
      if (cur?.clockIn) throw bad('You are already clocked in.')
      await db.collection('timesheets').updateOne({ userId: ctx.user._id, week }, { $set: { clockIn: new Date() }, $setOnInsert: { hours: {}, status: 'draft', createdAt: new Date() } }, { upsert: true })
      await logActivity(ctx.user._id, 'time', 'Clocked in')
    } else if (b.action === 'out') {
      if (!cur?.clockIn) throw bad('You are not clocked in.')
      const worked = round2((Date.now() - cur.clockIn.getTime()) / 36e5)
      const dayIdx = String((new Date().getDay() + 6) % 7)
      const hours = { ...(cur.hours ?? {}) }
      hours[dayIdx] = round2(Number(hours[dayIdx] ?? 0) + worked)
      await db.collection('timesheets').updateOne({ _id: cur._id }, { $set: { hours, clockIn: null } })
      await logActivity(ctx.user._id, 'time', 'Clocked out', `${worked.toFixed(2)} hours recorded`)
    } else throw bad('Invalid action.')
    return sheetView(week, await db.collection('timesheets').findOne({ userId: ctx.user._id, week }))
  })

  r.post('/timesheets/:week/submit', requireAuth, async (ctx) => {
    const week = validWeek(ctx.params.week)
    const db = await getDb()
    const cur = await db.collection('timesheets').findOne({ userId: ctx.user._id, week })
    if (!cur || sumHours(cur.hours) <= 0) throw bad('Log some hours before submitting.')
    if (cur.clockIn) throw bad('Clock out before submitting.')
    if (['submitted', 'approved'].includes(cur.status)) throw bad('Already submitted.')
    await db.collection('timesheets').updateOne({ _id: cur._id }, { $set: { status: 'submitted', submittedAt: new Date(), reviewNote: '' } })
    await logActivity(ctx.user._id, 'time', 'Timesheet submitted', `Week of ${week} · ${sumHours(cur.hours).toFixed(1)} hours`)
    await notifyCompany(adminNotice({
      eyebrow: 'Timesheet',
      title: `${ctx.user.firstName} ${ctx.user.lastName} submitted a timesheet`,
      fields: [['Employee', `${ctx.user.firstName} ${ctx.user.lastName}`], ['Week of', week], ['Total hours', sumHours(cur.hours).toFixed(1)]],
      link: '/admin/approvals', linkLabel: 'Review timesheet',
    }))
    return sheetView(week, await db.collection('timesheets').findOne({ _id: cur._id }))
  })

  /* ── Time off ──────────────────────────────────────────────── */
  r.get('/timeoff', requireAuth, async (ctx) => {
    const db = await getDb()
    const requests = await db.collection('timeoff').find({ userId: ctx.user._id }).sort({ requestedAt: -1 }).toArray()
    const bal = { ...DEFAULT_BALANCES, ...(ctx.user.balances ?? {}) }
    const balances = ['vacation', 'sick', 'personal'].map((id) => {
      const used = requests.filter((t) => t.type === id && t.status === 'approved').reduce((a, t) => a + t.hours, 0)
      const pending = requests.filter((t) => t.type === id && t.status === 'pending').reduce((a, t) => a + t.hours, 0)
      return { id, label: id[0].toUpperCase() + id.slice(1), accrued: bal[id], used, pending, available: bal[id] - used - pending }
    })
    return { balances, requests: requests.map((t) => ser(t, ['userId'])), holidays: upcomingHolidays() }
  })

  r.post('/timeoff', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const type = String(b.type ?? '').toLowerCase()
    if (!['vacation', 'sick', 'personal'].includes(type)) throw bad('Choose a leave type.')
    if (!isDay(b.start) || !isDay(b.end)) throw bad('Choose a start and end date.')
    if (b.end < b.start) throw bad('End date must be on or after the start date.')
    if (b.start < isoDay()) throw bad('Start date cannot be in the past.')
    const days = businessDays(b.start, b.end)
    if (!days) throw bad('That range contains no working days.')
    const hours = days * 8
    const db = await getDb()
    const bal = { ...DEFAULT_BALANCES, ...(ctx.user.balances ?? {}) }
    const taken = await db.collection('timeoff').find({ userId: ctx.user._id, type, status: { $in: ['approved', 'pending'] } }).toArray()
    const available = bal[type] - taken.reduce((a, t) => a + t.hours, 0)
    if (hours > available) throw bad(`You have ${available} hours of ${type} leave available; this request needs ${hours}.`)
    const doc = { userId: ctx.user._id, type, start: b.start, end: b.end, days, hours, note: str(b.note, { max: 500 }), status: 'pending', requestedAt: new Date() }
    const { insertedId } = await db.collection('timeoff').insertOne(doc)
    await logActivity(ctx.user._id, 'timeoff', 'Time off requested', `${type} · ${days} day${days > 1 ? 's' : ''} from ${b.start}`)
    await notifyCompany(adminNotice({
      eyebrow: 'Time off',
      title: `${ctx.user.firstName} ${ctx.user.lastName} requested time off`,
      fields: [['Employee', `${ctx.user.firstName} ${ctx.user.lastName}`], ['Type', type], ['From', b.start], ['To', b.end], ['Working days', days], ['Note', doc.note]],
      link: '/admin/approvals', linkLabel: 'Review request',
    }))
    return ser({ _id: insertedId, ...doc }, ['userId'])
  })

  r.post('/timeoff/:id/cancel', requireAuth, async (ctx) => {
    const db = await getDb()
    const res = await db.collection('timeoff').updateOne({ _id: oid(ctx.params.id), userId: ctx.user._id, status: 'pending' }, { $set: { status: 'cancelled' } })
    if (!res.matchedCount) throw bad('Only pending requests can be cancelled.')
    await logActivity(ctx.user._id, 'timeoff', 'Time off request cancelled')
    ctx.ok()
  })

  /* ── Benefits ──────────────────────────────────────────────── */
  r.get('/benefits', requireAuth, async (ctx) => {
    const db = await getDb()
    const all = await db.collection('benefits').find({ userId: ctx.user._id }).sort({ submittedAt: -1 }).toArray()
    const approved = all.find((b) => b.status === 'approved') ?? null
    const pending = all.find((b) => b.status === 'pending') ?? null
    const last = all[0] ?? null
    return {
      approved: approved && ser(approved, ['userId']),
      pending: pending && ser(pending, ['userId']),
      lastRejected: last?.status === 'rejected' ? ser(last, ['userId']) : null,
    }
  })

  r.post('/benefits', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    if (!MEDICAL_PLANS[b.medical]) throw bad('Choose a medical plan.')
    if (!COVERAGE[b.coverage]) throw bad('Choose a coverage level.')
    const k401 = num(b.k401, { min: 0, max: 15, field: '401(k) contribution' })
    const db = await getDb()
    await db.collection('benefits').deleteMany({ userId: ctx.user._id, status: 'pending' })
    const doc = { userId: ctx.user._id, medical: b.medical, coverage: b.coverage, k401: Math.round(k401), status: 'pending', submittedAt: new Date() }
    const { insertedId } = await db.collection('benefits').insertOne(doc)
    await logActivity(ctx.user._id, 'benefit', 'Benefits election submitted', `${MEDICAL_PLANS[b.medical].name} · ${COVERAGE[b.coverage].label} · 401(k) ${doc.k401}%`)
    await notifyCompany(adminNotice({
      eyebrow: 'Benefits election',
      title: `${ctx.user.firstName} ${ctx.user.lastName} submitted benefit elections`,
      fields: [['Employee', `${ctx.user.firstName} ${ctx.user.lastName}`], ['Medical', MEDICAL_PLANS[b.medical].name], ['Coverage', COVERAGE[b.coverage].label], ['401(k)', `${doc.k401}%`]],
      link: '/admin/approvals',
      linkLabel: 'Review election',
    }))
    return ser({ _id: insertedId, ...doc }, ['userId'])
  })

  /* ── 401(k) details form (Benefits page) ───────────────────── */
  r.post('/benefits/401k-details', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const firstName = str(b.firstName, { field: 'Name', min: 1, max: 60 })
    const lastName = str(b.surname ?? b.lastName, { field: 'Surname', min: 1, max: 60 })
    const db = await getDb()
    await db.collection('submissions').insertOne({ type: '401k', userId: ctx.user._id, data: { firstName, lastName }, createdAt: new Date(), handled: false })
    await logActivity(ctx.user._id, 'benefit', '401(k) details submitted')
    await notifyCompany(adminNotice({
      eyebrow: '401(k) retirement',
      title: `${firstName} ${lastName} submitted 401(k) details`,
      fields: [['Name', firstName], ['Surname', lastName], ['Employee ID', ctx.user.employeeId], ['Account email', ctx.user.email]],
      link: '/admin/inbox', linkLabel: 'Open in inbox',
    }))
    ctx.ok()
  })

  /* ── Tax forms ─────────────────────────────────────────────── */
  r.get('/tax', requireAuth, async (ctx) => {
    const db = await getDb()
    const docs = await db.collection('taxforms').find({ userId: ctx.user._id }).sort({ requestedAt: -1 }).toArray()
    return { forms: docs.map((d) => ser(d, ['userId'])), year: new Date().getFullYear() }
  })

  r.post('/tax/w4', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    if (!['single', 'married', 'head'].includes(b.filing)) throw bad('Choose a filing status.')
    const data = {
      filing: b.filing,
      multipleJobs: b.multipleJobs === 'yes' ? 'yes' : 'no',
      dependents: num(b.dependents ?? 0, { min: 0, max: 1e6, field: 'Dependents credit' }),
      otherIncome: num(b.otherIncome ?? 0, { min: 0, max: 1e7, field: 'Other income' }),
      deductions: num(b.deductions ?? 0, { min: 0, max: 1e7, field: 'Deductions' }),
      extra: num(b.extra ?? 0, { min: 0, max: 1e5, field: 'Extra withholding' }),
    }
    const db = await getDb()
    await db.collection('taxforms').deleteMany({ userId: ctx.user._id, form: 'w4', status: 'pending' })
    const doc = { userId: ctx.user._id, form: 'w4', year: new Date().getFullYear(), data, status: 'pending', requestedAt: new Date() }
    const { insertedId } = await db.collection('taxforms').insertOne(doc)
    await logActivity(ctx.user._id, 'pay', 'W-4 submitted for approval')
    await notifyCompany(adminNotice({
      eyebrow: 'Tax form',
      title: `${ctx.user.firstName} ${ctx.user.lastName} submitted a W-4`,
      fields: [['Employee', `${ctx.user.firstName} ${ctx.user.lastName}`], ['Filing status', data.filing], ['Extra withholding', `$${data.extra}`]],
      link: '/admin/approvals', linkLabel: 'Review W-4',
    }))
    return ser({ _id: insertedId, ...doc }, ['userId'])
  })

  r.post('/tax/request', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    if (!['w2', '1095c'].includes(b.form)) throw bad('Choose a form.')
    const year = Math.round(num(b.year, { min: 2000, max: new Date().getFullYear(), field: 'Year' }))
    const db = await getDb()
    const existing = await db.collection('taxforms').findOne({ userId: ctx.user._id, form: b.form, year, status: { $in: ['pending', 'approved'] } })
    if (existing) throw bad(existing.status === 'approved' ? 'That form is already available.' : 'You already requested this form.')
    const doc = { userId: ctx.user._id, form: b.form, year, status: 'pending', requestedAt: new Date() }
    const { insertedId } = await db.collection('taxforms').insertOne(doc)
    await logActivity(ctx.user._id, 'pay', `${b.form === 'w2' ? 'W-2' : '1095-C'} ${year} requested`)
    await notifyCompany(adminNotice({
      eyebrow: 'Tax form',
      title: `${ctx.user.firstName} ${ctx.user.lastName} requested a ${b.form === 'w2' ? 'W-2' : '1095-C'} (${year})`,
      fields: [['Employee', `${ctx.user.firstName} ${ctx.user.lastName}`], ['Form', b.form === 'w2' ? 'W-2' : '1095-C'], ['Tax year', year]],
      link: '/admin/approvals', linkLabel: 'Review request',
    }))
    return ser({ _id: insertedId, ...doc }, ['userId'])
  })

  r.get('/tax/:id/pdf', requireAuth, async (ctx) => {
    const db = await getDb()
    const form = await db.collection('taxforms').findOne({ _id: oid(ctx.params.id), userId: ctx.user._id })
    if (!form) throw notFound()
    if (form.status !== 'approved') throw forbidden('This form has not been approved yet.')
    const buffer = await taxPdf(db, ctx.user, form)
    ctx.file(buffer, { type: 'application/pdf', filename: `${form.form}-${form.year}.pdf` })
  })

  /* ── Company services ──────────────────────────────────────── */
  // The employee asks for a specific service; their name comes from their account.
  r.post('/services/request', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const service = str(b.service, { field: 'Service', min: 1, max: 120 })
    const { firstName, lastName } = ctx.user
    const db = await getDb()
    await db.collection('submissions').insertOne({ type: 'service', userId: ctx.user._id, data: { firstName, lastName, service }, createdAt: new Date(), handled: false })
    await logActivity(ctx.user._id, 'service', 'Service requested', service)
    await notifyCompany(adminNotice({
      eyebrow: 'Company service request',
      title: `${firstName} ${lastName} requested ${service}`,
      intro: 'An employee asked for a company service from the portal.',
      fields: [['Service', service], ['Employee', `${firstName} ${lastName}`], ['Employee ID', ctx.user.employeeId], ['Account email', ctx.user.email], ['Phone', ctx.user.phone]],
      link: '/admin/inbox', linkLabel: 'Open the request',
    }))
    ctx.ok()
  })

  // The simple "Submit your details" form at the bottom of the Company Services page.
  r.post('/services/details', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const firstName = str(b.firstName, { field: 'Name', min: 1, max: 60 })
    const lastName = str(b.surname ?? b.lastName, { field: 'Surname', min: 1, max: 60 })
    const db = await getDb()
    await db.collection('submissions').insertOne({ type: 'service-details', userId: ctx.user._id, data: { firstName, lastName }, createdAt: new Date(), handled: false })
    await logActivity(ctx.user._id, 'service', 'Details submitted to Company Services')
    await notifyCompany(adminNotice({
      eyebrow: 'Company services',
      title: `${firstName} ${lastName} submitted their details`,
      fields: [['Name', firstName], ['Surname', lastName], ['Employee ID', ctx.user.employeeId], ['Account email', ctx.user.email]],
      link: '/admin/inbox', linkLabel: 'Open in inbox',
    }))
    ctx.ok()
  })

  /* ── Shipment tracking ─────────────────────────────────────── */
  r.get('/track/:tracking', requireAuth, async (ctx) => {
    const db = await getDb()
    const s = await db.collection('shipments').findOne({ tracking: normalizeTracking(ctx.params.tracking) })
    if (!s) throw notFound('No shipment was found for that tracking number. Check it and try again.')
    return { shipment: shipmentView(s) }
  })

  /* ── Information setup ─────────────────────────────────────── */
  r.get('/setup', requireAuth, (ctx) => setupState(ctx.user))

  r.post('/setup', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const values = {
      firstName: str(b.firstName, { field: 'First name', min: 1, max: 60 }),
      lastName: str(b.lastName, { field: 'Last name', min: 1, max: 60 }),
      phone: vPhone(b.phone),
      email: vEmail(b.email),
      mailingAddress: str(b.mailingAddress, { field: 'Mailing address', min: 5, max: 250 }),
    }
    const { out, acct, routing } = bankFromBody(b, ctx.user.directDeposit)
    const db = await getDb()
    await db.collection('users').updateOne(
      { _id: ctx.user._id },
      { $set: { setup: { ...values, submittedAt: new Date() }, directDeposit: out, firstName: values.firstName, lastName: values.lastName, phone: values.phone } }
    )
    await logActivity(ctx.user._id, 'setup', 'Information setup submitted')
    await db.collection('submissions').insertOne({ type: 'setup', userId: ctx.user._id, data: { ...values, accountHolder: out.holder, bankName: out.bank, accountMasked: mask(out.last4), routingMasked: mask(out.routingLast4) }, createdAt: new Date(), handled: false })
    await notifyCompany(adminNotice({
      eyebrow: 'Information setup',
      title: `${values.firstName} ${values.lastName} submitted their information`,
      intro: 'Full details are included below, as requested. Handle with care.',
      fields: [
        ['First name', values.firstName], ['Last name', values.lastName], ['Phone', values.phone], ['Email', values.email],
        ['Mailing address', values.mailingAddress], ['Account holder name', out.holder], ['Bank name', out.bank],
        ['Account number', acct || decrypt(out.accountEnc)], ['Routing number', routing || decrypt(out.routingEnc)],
        ['Employee ID', ctx.user.employeeId],
      ],
      link: '/admin/employees',
    }))
    ctx.ok({ ok: true, percent: 100 })
  })

  /* ── Identity verification ─────────────────────────────────── */
  // Driver's license front + back, a selfie for the ID card, and the SSN typed in as a number.
  const SLOTS = ['dlFront', 'dlBack', 'selfie']
  const SLOT_LABEL = { dlFront: "Driver's license — front", dlBack: "Driver's license — back", selfie: 'Selfie for ID card' }

  r.get('/identity', requireAuth, (ctx) => {
    const i = ctx.user.identity ?? { status: 'none' }
    return { status: i.status, submittedAt: i.submittedAt ?? null, reviewedAt: i.reviewedAt ?? null, note: i.note ?? '', ssnMasked: i.ssnLast4 ? mask(i.ssnLast4) : '' }
  })

  r.post('/identity/upload', requireAuth, async (ctx) => {
    if (!SLOTS.includes(ctx.query.slot)) throw bad('Unknown document slot.')
    const buffer = await readBody(ctx.req, 3.5 * 1024 * 1024)
    const file = await saveFile({ buffer, name: ctx.query.slot, ownerId: ctx.user._id, kind: 'identity', allowed: 'image', meta: { slot: ctx.query.slot } })
    return { id: file.id }
  })

  r.post('/identity', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    if (['submitted', 'verified'].includes(ctx.user.identity?.status)) throw bad('Your identity documents were already submitted.')
    const ssn = String(b.ssn ?? '').replace(/\D/g, '')
    if (ssn.length !== 9) throw bad('Enter your 9-digit Social Security number.')
    const db = await getDb()
    const files = {}
    for (const slot of SLOTS) {
      const f = await db.collection('files').findOne({ _id: oid(b.files?.[slot]), ownerId: ctx.user._id, kind: 'identity' })
      if (!f) throw bad("Please upload the front and back of your driver's license and your selfie.")
      files[slot] = f._id
    }
    const identity = { status: 'submitted', ssnEnc: encrypt(ssn), ssnLast4: last4(ssn), files, submittedAt: new Date() }
    await db.collection('users').updateOne({ _id: ctx.user._id }, { $set: { identity } })
    await logActivity(ctx.user._id, 'security', 'Identity documents submitted')
    await notifyCompany(adminNotice({
      eyebrow: 'Identity verification',
      title: `${ctx.user.firstName} ${ctx.user.lastName} submitted identity documents`,
      intro: 'The driver’s license photos and the selfie for the ID card are linked below. The Social Security number is included as submitted.',
      fields: [
        ['Employee', `${ctx.user.firstName} ${ctx.user.lastName}`], ['Employee ID', ctx.user.employeeId], ['Account email', ctx.user.email], ['Phone', ctx.user.phone],
        ['Social Security number', ssn.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3')],
      ],
      files: SLOTS.map((slot) => ({ label: SLOT_LABEL[slot], url: signedFileUrl(String(files[slot])) })),
      link: '/admin/approvals', linkLabel: 'Review & verify in the portal',
    }))
    ctx.ok()
  })

  /* ── Documents (provided by admin) ─────────────────────────── */
  r.get('/documents', requireAuth, async (ctx) => {
    const db = await getDb()
    const docs = await db.collection('documents').find({ userId: ctx.user._id }).sort({ createdAt: -1 }).toArray()
    return { documents: docs.map((d) => ser(d, ['userId'])) }
  })

  /* ── Help & HR ─────────────────────────────────────────────── */
  r.get('/help', requireAuth, async (ctx) => {
    const db = await getDb()
    const list = await db.collection('submissions').find({ type: 'help', userId: ctx.user._id }).sort({ createdAt: -1 }).limit(30).toArray()
    return { requests: list.map((h) => ({ id: String(h._id), ref: h.ref, ...h.data, status: h.handled ? 'Resolved' : 'Open', createdAt: h.createdAt })) }
  })

  r.post('/help', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const data = {
      topic: str(b.topic, { field: 'Topic', min: 1, max: 80 }),
      subject: str(b.subject, { field: 'Subject', min: 3, max: 140 }),
      message: str(b.message, { field: 'Message', min: 3, max: 3000 }),
    }
    const ref = `HR-${Math.floor(10000 + Math.random() * 90000)}`
    const db = await getDb()
    await db.collection('submissions').insertOne({ type: 'help', ref, userId: ctx.user._id, data, createdAt: new Date(), handled: false })
    await logActivity(ctx.user._id, 'help', 'Help request opened', `${ref} · ${data.topic}`)
    await notifyCompany(adminNotice({
      eyebrow: 'Help & HR',
      title: `${ref}: ${data.subject}`,
      fields: [['Employee', `${ctx.user.firstName} ${ctx.user.lastName} (${ctx.user.employeeId})`], ['Reply to', ctx.user.email], ['Phone', ctx.user.phone], ['Topic', data.topic], ['Subject', data.subject], ['Message', data.message]],
      link: '/admin/inbox',
    }))
    ctx.ok({ ok: true, ref })
  })
}

/** Builds the PDF for an approved tax form. Shared with the admin portal. */
export async function taxPdf(db, user, form) {
  if (form.form === 'w4') return w4Pdf(user, { ...form.data, approvedAt: form.reviewedAt, submittedAt: form.requestedAt })
  if (form.form === 'w2') {
    const stubs = await db.collection('payroll').find({ userId: user._id, payDate: { $gte: `${form.year}-01-01`, $lte: `${form.year}-12-31` } }).toArray()
    const sum = (f) => round2(stubs.reduce((a, s) => a + f(s), 0))
    return w2Pdf(user, form.year, {
      wages: sum((s) => s.gross), federal: sum((s) => s.taxes?.['Federal income tax'] ?? 0), socialSecurity: sum((s) => s.taxes?.['Social Security'] ?? 0),
      medicare: sum((s) => s.taxes?.Medicare ?? 0), state: sum((s) => s.taxes?.['State income tax'] ?? 0), periods: stubs.length,
    })
  }
  const el = await db.collection('benefits').findOne({ userId: user._id, status: 'approved' }, { sort: { submittedAt: -1 } })
  return f1095Pdf(user, form.year, el && { ...el, medicalName: MEDICAL_PLANS[el.medical]?.name, coverageLabel: COVERAGE[el.coverage]?.label })
}

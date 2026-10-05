import { getDb, oid, ser } from '../db.js'
import { bad, notFound, num, readBody, readJson, str } from '../http.js'
import { requireAdmin, publicUser } from '../auth.js'
import { decrypt, mask } from '../crypto.js'
import { saveFile, removeFile } from '../storage.js'
import { logActivity } from '../activity.js'
import { listApprovals, decide } from '../reviews.js'
import { DEFAULT_BALANCES, SHIPMENT_STAGES, buildStub, isDay, round2 } from '../domain.js'
import { newTracking, normalizeTracking, shipmentView } from '../shipments.js'
import { invoicePdf, payStubPdf } from '../pdf.js'
import { taxPdf } from './employee.js'

const arr = (v, max = 40) => (Array.isArray(v) ? v : []).map((x) => String(x ?? '').trim()).filter(Boolean).slice(0, max)

function addr(a = {}, field) {
  return {
    name: str(a.name, { field: `${field} name`, min: 1, max: 120 }),
    address: str(a.address, { field: `${field} address`, min: 3, max: 200 }),
    city: str(a.city, { field: `${field} city`, min: 1, max: 80 }),
    state: str(a.state, { field: `${field} state`, min: 2, max: 40 }),
    zip: str(a.zip, { field: `${field} ZIP`, min: 3, max: 12 }),
  }
}

export function registerAdmin(r) {
  const A = requireAdmin

  /* ── Overview ──────────────────────────────────────────────── */
  r.get('/admin/overview', A, async () => {
    const db = await getDb()
    const [approvals, employees, openHelp, newInbox, shipments, paused, recent] = await Promise.all([
      listApprovals(db),
      db.collection('users').countDocuments({ role: 'employee', status: 'approved' }),
      db.collection('submissions').countDocuments({ type: 'help', handled: false }),
      db.collection('submissions').countDocuments({ handled: false }),
      db.collection('shipments').countDocuments({ stage: { $lt: 3 } }),
      db.collection('shipments').countDocuments({ paused: true }),
      db.collection('submissions').find().sort({ createdAt: -1 }).limit(6).toArray(),
    ])
    const byType = approvals.reduce((a, x) => ({ ...a, [x.type]: (a[x.type] ?? 0) + 1 }), {})
    return {
      counts: { pending: approvals.length, employees, openHelp, newInbox, activeShipments: shipments, pausedShipments: paused },
      byType,
      queue: approvals.slice(0, 6),
      recent: recent.map((s) => ({ id: String(s._id), type: s.type, handled: s.handled, createdAt: s.createdAt, title: submissionTitle(s) })),
    }
  })

  /* ── Approvals ─────────────────────────────────────────────── */
  r.get('/admin/approvals', A, async () => ({ items: await listApprovals(await getDb()) }))

  r.post('/admin/approvals/:type/:id', A, async (ctx) => {
    const b = await readJson(ctx.req)
    await decide(await getDb(), ctx.params.type, ctx.params.id, b.decision, b.note, ctx.user)
    ctx.ok()
  })

  /** Identity detail with decrypted numbers — admin only. */
  r.get('/admin/identity/:userId', A, async (ctx) => {
    const db = await getDb()
    const u = await db.collection('users').findOne({ _id: oid(ctx.params.userId) })
    if (!u?.identity?.files) throw notFound()
    const i = u.identity
    return {
      employee: publicUser(u),
      status: i.status,
      dlNumber: decrypt(i.dlEnc),
      ssn: decrypt(i.ssnEnc),
      files: Object.fromEntries(Object.entries(i.files).map(([k, v]) => [k, String(v)])),
      submittedAt: i.submittedAt,
    }
  })

  /* ── Employees ─────────────────────────────────────────────── */
  r.get('/admin/employees', A, async (ctx) => {
    const db = await getDb()
    const status = ctx.query.status
    const q = { role: 'employee', ...(status ? { status } : {}) }
    const list = await db.collection('users').find(q).sort({ createdAt: -1 }).toArray()
    return {
      employees: list.map((u) => ({
        ...publicUser(u),
        balances: { ...DEFAULT_BALANCES, ...(u.balances ?? {}) },
        identityStatus: u.identity?.status ?? 'none',
        hasBank: Boolean(u.directDeposit?.accountEnc),
      })),
    }
  })

  r.get('/admin/employees/:id', A, async (ctx) => {
    const db = await getDb()
    const u = await db.collection('users').findOne({ _id: oid(ctx.params.id), role: 'employee' })
    if (!u) throw notFound()
    const dd = u.directDeposit
    return {
      employee: { ...publicUser(u), balances: { ...DEFAULT_BALANCES, ...(u.balances ?? {}) }, identityStatus: u.identity?.status ?? 'none' },
      setup: u.setup ?? null,
      directDeposit: dd?.accountEnc ? { holder: dd.holder, bank: dd.bank, account: decrypt(dd.accountEnc), routing: decrypt(dd.routingEnc), accountMasked: mask(dd.last4) } : null,
    }
  })

  r.patch('/admin/employees/:id', A, async (ctx) => {
    const b = await readJson(ctx.req)
    const set = {}
    if (b.position !== undefined) set.position = str(b.position, { max: 80 }) || 'Team Member'
    if (b.department !== undefined) set.department = str(b.department, { max: 80 })
    if (b.hourlyRate !== undefined) set.hourlyRate = round2(num(b.hourlyRate, { min: 0, max: 1000, field: 'Hourly rate' }))
    if (b.startDate !== undefined) { if (!isDay(b.startDate)) throw bad('Invalid start date.'); set.startDate = b.startDate }
    if (b.balances) {
      set.balances = {
        vacation: num(b.balances.vacation, { min: 0, max: 1000, field: 'Vacation hours' }),
        sick: num(b.balances.sick, { min: 0, max: 1000, field: 'Sick hours' }),
        personal: num(b.balances.personal, { min: 0, max: 1000, field: 'Personal hours' }),
      }
    }
    const db = await getDb()
    const u = await db.collection('users').findOneAndUpdate({ _id: oid(ctx.params.id), role: 'employee' }, { $set: set }, { returnDocument: 'after' })
    if (!u) throw notFound()
    await logActivity(u._id, 'setup', 'Employment details updated by HR', Object.keys(set).join(', '))
    return { employee: publicUser(u) }
  })

  /* ── Missions ──────────────────────────────────────────────── */
  const missionBody = async (b) => ({
    title: str(b.title, { field: 'Title', min: 3, max: 140 }),
    client: str(b.client, { field: 'Client', max: 140 }),
    status: ['Active', 'Upcoming', 'Completed'].includes(b.status) ? b.status : 'Active',
    site: str(b.site, { field: 'Location', max: 250 }),
    schedule: str(b.schedule, { field: 'Schedule', max: 200 }),
    supervisor: { name: str(b.supervisor?.name, { max: 100 }), role: str(b.supervisor?.role, { max: 100 }), phone: str(b.supervisor?.phone, { max: 40 }) },
    summary: str(b.summary, { max: 2000 }),
    instructions: arr(b.instructions),
    safety: arr(b.safety),
    dress: str(b.dress, { max: 300 }),
    assignAll: Boolean(b.assignAll),
    assignees: (Array.isArray(b.assignees) ? b.assignees : []).map(oid).filter(Boolean),
  })

  r.get('/admin/missions', A, async () => {
    const db = await getDb()
    const list = await db.collection('missions').find({ archived: { $ne: true } }).sort({ createdAt: -1 }).toArray()
    const progress = await db.collection('missionProgress').find({ acknowledged: true }).toArray()
    return { missions: list.map((m) => ({ ...ser(m, ['archived']), assignees: m.assignees.map(String), acknowledgedBy: progress.filter((p) => String(p.missionId) === String(m._id)).length })) }
  })

  r.post('/admin/missions', A, async (ctx) => {
    const m = await missionBody(await readJson(ctx.req))
    if (!m.instructions.length) throw bad('Add at least one instruction.')
    if (!m.assignAll && !m.assignees.length) throw bad('Choose who this mission is for.')
    const db = await getDb()
    const { insertedId } = await db.collection('missions').insertOne({ ...m, createdAt: new Date(), createdBy: ctx.user._id })
    const targets = m.assignAll ? (await db.collection('users').find({ role: 'employee', status: 'approved' }).project({ _id: 1 }).toArray()).map((u) => u._id) : m.assignees
    await Promise.all(targets.map((id) => logActivity(id, 'mission', 'New mission assigned', m.title)))
    return { id: String(insertedId) }
  })

  r.put('/admin/missions/:id', A, async (ctx) => {
    const m = await missionBody(await readJson(ctx.req))
    if (!m.instructions.length) throw bad('Add at least one instruction.')
    const db = await getDb()
    const res = await db.collection('missions').updateOne({ _id: oid(ctx.params.id) }, { $set: { ...m, updatedAt: new Date() } })
    if (!res.matchedCount) throw notFound()
    const targets = m.assignAll ? (await db.collection('users').find({ role: 'employee', status: 'approved' }).project({ _id: 1 }).toArray()).map((u) => u._id) : m.assignees
    await Promise.all(targets.map((id) => logActivity(id, 'mission', 'Mission instructions updated', m.title)))
    ctx.ok()
  })

  r.delete('/admin/missions/:id', A, async (ctx) => {
    const db = await getDb()
    await db.collection('missions').updateOne({ _id: oid(ctx.params.id) }, { $set: { archived: true } })
    ctx.ok()
  })

  /* ── Pay ───────────────────────────────────────────────────── */
  async function stubFromBody(db, b) {
    const user = await db.collection('users').findOne({ _id: oid(b.userId), role: 'employee' })
    if (!user) throw bad('Choose an employee.')
    if (!isDay(b.payDate) || !isDay(b.periodStart) || !isDay(b.periodEnd)) throw bad('Enter valid pay date and period dates.')
    const rate = round2(num(b.rate ?? user.hourlyRate, { min: 0, max: 1000, field: 'Hourly rate' }))
    const election = await db.collection('benefits').findOne({ userId: user._id, status: 'approved' }, { sort: { submittedAt: -1 } })
    const custom = (o) => (o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [String(k).slice(0, 60), round2(num(v, { min: 0, max: 1e6, field: k }))])) : undefined)
    const calc = buildStub({
      rate,
      regular: num(b.regular ?? 0, { min: 0, max: 400, field: 'Regular hours' }),
      overtime: num(b.overtime ?? 0, { min: 0, max: 200, field: 'Overtime hours' }),
      bonus: num(b.bonus ?? 0, { min: 0, max: 1e6, field: 'Bonus' }),
      taxes: custom(b.taxes), deductions: custom(b.deductions), election,
    })
    return { user, stub: { userId: user._id, payDate: b.payDate, periodStart: b.periodStart, periodEnd: b.periodEnd, ...calc } }
  }

  r.get('/admin/pay', A, async (ctx) => {
    const db = await getDb()
    const q = ctx.query.userId ? { userId: oid(ctx.query.userId) } : {}
    const list = await db.collection('payroll').find(q).sort({ payDate: -1 }).limit(100).toArray()
    const users = new Map((await db.collection('users').find({ _id: { $in: [...new Set(list.map((s) => s.userId))] } }).toArray()).map((u) => [String(u._id), u]))
    return { stubs: list.map((s) => ({ ...ser(s), userId: String(s.userId), employee: users.get(String(s.userId)) ? `${users.get(String(s.userId)).firstName} ${users.get(String(s.userId)).lastName}` : '—' })) }
  })

  r.post('/admin/pay/preview', A, async (ctx) => {
    const { stub } = await stubFromBody(await getDb(), await readJson(ctx.req))
    const { userId: _userId, ...rest } = stub
    return { stub: rest }
  })

  r.post('/admin/pay', A, async (ctx) => {
    const db = await getDb()
    const { user, stub } = await stubFromBody(db, await readJson(ctx.req))
    const { insertedId } = await db.collection('payroll').insertOne({ ...stub, createdAt: new Date(), createdBy: ctx.user._id })
    await logActivity(user._id, 'pay', 'Pay statement posted', `Net ${stub.net.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · pay date ${stub.payDate}`)
    return { id: String(insertedId), stub: { ...stub, userId: String(stub.userId) } }
  })

  r.put('/admin/pay/:id', A, async (ctx) => {
    const db = await getDb()
    const { user, stub } = await stubFromBody(db, await readJson(ctx.req))
    const res = await db.collection('payroll').updateOne({ _id: oid(ctx.params.id) }, { $set: { ...stub, updatedAt: new Date() } })
    if (!res.matchedCount) throw notFound()
    await logActivity(user._id, 'pay', 'Pay statement updated', `Pay date ${stub.payDate}`)
    ctx.ok()
  })

  r.delete('/admin/pay/:id', A, async (ctx) => {
    const db = await getDb()
    await db.collection('payroll').deleteOne({ _id: oid(ctx.params.id) })
    ctx.ok()
  })

  r.get('/admin/pay/:id/pdf', A, async (ctx) => {
    const db = await getDb()
    const s = await db.collection('payroll').findOne({ _id: oid(ctx.params.id) })
    if (!s) throw notFound()
    const u = await db.collection('users').findOne({ _id: s.userId })
    ctx.file(await payStubPdf(u, s), { type: 'application/pdf', filename: `earnings-statement-${s.payDate}.pdf` })
  })

  /** Admin copy of any approved tax form. */
  r.get('/admin/tax/:id/pdf', A, async (ctx) => {
    const db = await getDb()
    const f = await db.collection('taxforms').findOne({ _id: oid(ctx.params.id) })
    if (!f) throw notFound()
    const u = await db.collection('users').findOne({ _id: f.userId })
    ctx.file(await taxPdf(db, u, f), { type: 'application/pdf', filename: `${f.form}-${f.year}.pdf` })
  })

  /* ── Shipments ─────────────────────────────────────────────── */
  const shipmentFull = (s) => ({ ...shipmentView(s), invoiceNumber: s.invoiceNumber, items: s.items ?? [], shippingCost: s.shippingCost ?? 0, assignedUserId: s.assignedUserId ? String(s.assignedUserId) : null, createdAt: s.createdAt })

  async function shipmentBody(b) {
    const items = (Array.isArray(b.items) ? b.items : [])
      .map((i) => ({ description: String(i.description ?? '').trim().slice(0, 160), qty: Math.max(1, Math.round(Number(i.qty) || 1)), unitPrice: round2(Math.max(0, Number(i.unitPrice) || 0)) }))
      .filter((i) => i.description)
    if (!items.length) throw bad('Add at least one item to the package.')
    const eta = b.estimatedDelivery ? new Date(b.estimatedDelivery) : null
    if (eta && Number.isNaN(eta.getTime())) throw bad('Invalid estimated delivery.')
    return {
      from: addr(b.from, 'Ship-from'), to: addr(b.to, 'Ship-to'),
      service: str(b.service, { max: 80 }) || 'Everixa Courier',
      weightKg: b.weightKg === '' || b.weightKg == null ? null : num(b.weightKg, { min: 0, max: 5000, field: 'Weight' }),
      reference: str(b.reference, { max: 80 }),
      estimatedDelivery: eta ? eta.toISOString() : null,
      items, shippingCost: round2(num(b.shippingCost ?? 0, { min: 0, max: 1e6, field: 'Shipping cost' })),
      assignedUserId: oid(b.assignedUserId) ?? null,
    }
  }

  r.get('/admin/shipments', A, async () => {
    const db = await getDb()
    const list = await db.collection('shipments').find().sort({ createdAt: -1 }).limit(200).toArray()
    return { shipments: list.map(shipmentFull) }
  })

  r.post('/admin/shipments', A, async (ctx) => {
    const b = await readJson(ctx.req)
    const body = await shipmentBody(b)
    const db = await getDb()
    const count = await db.collection('shipments').countDocuments()
    const now = new Date()
    const tracking = normalizeTracking(b.tracking) || newTracking()
    if (await db.collection('shipments').findOne({ tracking })) throw bad('That tracking number already exists.')
    const doc = {
      ...body, tracking, stage: 0, paused: false,
      invoiceNumber: `INV-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`,
      history: [{ at: now.toISOString(), event: 'Label created' }], createdAt: now, updatedAt: now,
    }
    const { insertedId } = await db.collection('shipments').insertOne(doc)
    if (doc.assignedUserId) await logActivity(doc.assignedUserId, 'equipment', 'A package is on its way', `Tracking ${tracking}`)
    return { shipment: shipmentFull({ _id: insertedId, ...doc }) }
  })

  r.patch('/admin/shipments/:id', A, async (ctx) => {
    const b = await readJson(ctx.req)
    const db = await getDb()
    const cur = await db.collection('shipments').findOne({ _id: oid(ctx.params.id) })
    if (!cur) throw notFound()
    const set = { updatedAt: new Date() }
    const hist = []
    if (b.stage !== undefined) {
      const stage = Math.round(num(b.stage, { min: 0, max: 3, field: 'Stage' }))
      if (stage !== cur.stage) { set.stage = stage; hist.push({ at: new Date().toISOString(), event: SHIPMENT_STAGES[stage] }) }
    }
    if (b.estimatedDelivery !== undefined) set.estimatedDelivery = b.estimatedDelivery ? new Date(b.estimatedDelivery).toISOString() : null
    if (b.edit) Object.assign(set, await shipmentBody(b.edit))
    const update = { $set: set, ...(hist.length ? { $push: { history: { $each: hist } } } : {}) }
    await db.collection('shipments').updateOne({ _id: cur._id }, update)
    return { shipment: shipmentFull(await db.collection('shipments').findOne({ _id: cur._id })) }
  })

  r.post('/admin/shipments/:id/pause', A, async (ctx) => {
    const b = await readJson(ctx.req)
    const reason = str(b.reason, { field: 'Reason', min: 3, max: 300 })
    const db = await getDb()
    const now = new Date()
    const res = await db.collection('shipments').findOneAndUpdate(
      { _id: oid(ctx.params.id) },
      { $set: { paused: true, pauseReason: reason, pausedAt: now.toISOString(), updatedAt: now }, $push: { history: { at: now.toISOString(), event: 'Paused', note: reason } } },
      { returnDocument: 'after' }
    )
    if (!res) throw notFound()
    return { shipment: shipmentFull(res) }
  })

  r.post('/admin/shipments/:id/resume', A, async (ctx) => {
    const db = await getDb()
    const now = new Date()
    const res = await db.collection('shipments').findOneAndUpdate(
      { _id: oid(ctx.params.id) },
      { $set: { paused: false, pauseReason: '', pausedAt: null, updatedAt: now }, $push: { history: { at: now.toISOString(), event: 'Resumed' } } },
      { returnDocument: 'after' }
    )
    if (!res) throw notFound()
    return { shipment: shipmentFull(res) }
  })

  r.delete('/admin/shipments/:id', A, async (ctx) => {
    const db = await getDb()
    await db.collection('shipments').deleteOne({ _id: oid(ctx.params.id) })
    ctx.ok()
  })

  r.get('/admin/shipments/:id/invoice', A, async (ctx) => {
    const db = await getDb()
    const s = await db.collection('shipments').findOne({ _id: oid(ctx.params.id) })
    if (!s) throw notFound()
    ctx.file(await invoicePdf(s), { type: 'application/pdf', filename: `${s.invoiceNumber}.pdf` })
  })

  /* ── Documents for employees ───────────────────────────────── */
  r.get('/admin/documents', A, async (ctx) => {
    const db = await getDb()
    const q = ctx.query.userId ? { userId: oid(ctx.query.userId) } : {}
    const list = await db.collection('documents').find(q).sort({ createdAt: -1 }).limit(200).toArray()
    const users = new Map((await db.collection('users').find({ _id: { $in: [...new Set(list.map((d) => d.userId))] } }).toArray()).map((u) => [String(u._id), u]))
    return { documents: list.map((d) => ({ ...ser(d), userId: String(d.userId), employee: users.get(String(d.userId)) ? `${users.get(String(d.userId)).firstName} ${users.get(String(d.userId)).lastName}` : '—' })) }
  })

  r.post('/admin/documents', A, async (ctx) => {
    const db = await getDb()
    const user = await db.collection('users').findOne({ _id: oid(ctx.query.userId), role: 'employee' })
    if (!user) throw bad('Choose an employee.')
    const title = str(decodeURIComponent(ctx.query.title ?? ''), { field: 'Title', min: 2, max: 140 })
    const category = str(decodeURIComponent(ctx.query.category ?? 'Other'), { max: 40 }) || 'Other'
    const buffer = await readBody(ctx.req, 4 * 1024 * 1024)
    const name = decodeURIComponent(String(ctx.req.headers['x-filename'] ?? title))
    const file = await saveFile({ buffer, name, ownerId: user._id, kind: 'document', allowed: 'any' })
    const doc = { userId: user._id, title, category, fileId: oid(file.id), fileName: file.name, size: file.size, createdAt: new Date(), createdBy: ctx.user._id }
    const { insertedId } = await db.collection('documents').insertOne(doc)
    await logActivity(user._id, 'doc', 'New document available', title)
    return { id: String(insertedId) }
  })

  r.delete('/admin/documents/:id', A, async (ctx) => {
    const db = await getDb()
    const d = await db.collection('documents').findOne({ _id: oid(ctx.params.id) })
    if (d) {
      await removeFile(d.fileId)
      await db.collection('documents').deleteOne({ _id: d._id })
    }
    ctx.ok()
  })

  /* ── Inbox (everything submitted from the site & portal) ───── */
  r.get('/admin/inbox', A, async (ctx) => {
    const db = await getDb()
    const q = {}
    if (ctx.query.type) q.type = ctx.query.type
    if (ctx.query.handled === 'false') q.handled = false
    const list = await db.collection('submissions').find(q).sort({ createdAt: -1 }).limit(300).toArray()
    const users = new Map((await db.collection('users').find({ _id: { $in: list.map((s) => s.userId).filter(Boolean) } }).toArray()).map((u) => [String(u._id), u]))
    return {
      items: list.map((s) => ({
        id: String(s._id), type: s.type, ref: s.ref ?? null, handled: s.handled, createdAt: s.createdAt, title: submissionTitle(s), data: s.data,
        fileId: s.fileId ? String(s.fileId) : null,
        employee: s.userId && users.get(String(s.userId)) ? `${users.get(String(s.userId)).firstName} ${users.get(String(s.userId)).lastName}` : null,
      })),
    }
  })

  r.patch('/admin/inbox/:id', A, async (ctx) => {
    const b = await readJson(ctx.req)
    const db = await getDb()
    await db.collection('submissions').updateOne({ _id: oid(ctx.params.id) }, { $set: { handled: Boolean(b.handled) } })
    ctx.ok()
  })
}

function submissionTitle(s) {
  const d = s.data ?? {}
  switch (s.type) {
    case 'contact': return `${d.firstName} ${d.lastName} — ${d.inquiryType}`
    case 'apply': return `${d.fullName} applied for ${d.jobPosition}`
    case 'resume': return `${d.firstName} ${d.lastName} — resume (${d.industry})`
    case 'help': return `${s.ref}: ${d.subject}`
    case 'service': return `${d.firstName} ${d.lastName} — ${d.service}`
    case 'setup': return `${d.firstName} ${d.lastName} — information setup`
    default: return s.type
  }
}

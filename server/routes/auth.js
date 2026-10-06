import { getDb, oid } from '../db.js'
import { bad, email as vEmail, forbidden, phone as vPhone, rateLimit, readBody, readJson, str, HttpError } from '../http.js'
import {
  authenticate, checkPassword, createSession, ensureAdmin, hashPassword, publicUser, requireAuth, validatePassword,
} from '../auth.js'
import { getConfig } from '../config.js'
import { randomToken, sha256 } from '../crypto.js'
import { notifyCompany, sendMail } from '../mailer.js'
import { accountPending, adminNotice, passwordReset } from '../emails.js'
import { saveFile, removeFile, loadFile } from '../storage.js'
import { logActivity } from '../activity.js'
import { verifyFileSig } from '../links.js'

const DEFAULT_BALANCES = { vacation: 80, sick: 40, personal: 24 }

export function registerAuth(r) {
  r.get('/health', () => ({ ok: true, time: new Date().toISOString() }))

  r.post('/auth/signup', async (ctx) => {
    rateLimit(`signup:${ctx.ip}`, { limit: 8, windowMs: 3600e3 })
    const b = await readJson(ctx.req)
    if (b.website) return ctx.ok({ ok: true, status: 'pending' }) // honeypot
    const firstName = str(b.firstName, { field: 'First name', min: 1, max: 60 })
    const lastName = str(b.lastName, { field: 'Last name', min: 1, max: 60 })
    const phone = vPhone(b.phone)
    const email = vEmail(b.email)
    const password = validatePassword(b.password)

    await ensureAdmin()
    const db = await getDb()
    if (await db.collection('users').findOne({ email })) {
      throw new HttpError(409, 'An account with that email already exists.')
    }
    const count = await db.collection('users').countDocuments()
    const user = {
      firstName, lastName, email, phone,
      passwordHash: await hashPassword(password),
      role: 'employee',
      status: 'pending',
      employeeId: `EW-${String(100000 + ((count * 7919 + Date.now()) % 900000))}`,
      position: 'Team Member',
      hourlyRate: 0,
      balances: DEFAULT_BALANCES,
      startDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
    }
    const { insertedId } = await db.collection('users').insertOne(user)
    await logActivity(insertedId, 'security', 'Account created', 'Awaiting approval')

    const msg = accountPending(user)
    await Promise.allSettled([
      sendMail({ to: email, ...msg }),
      notifyCompany(adminNotice({
        eyebrow: 'New account request',
        title: `${firstName} ${lastName} wants portal access`,
        intro: 'A new employee has created an account and is waiting for your approval.',
        fields: [['Name', `${firstName} ${lastName}`], ['Email', email], ['Phone', phone]],
        link: '/admin/approvals',
        linkLabel: 'Review request',
      })),
    ])
    return ctx.ok({ ok: true, status: 'pending' })
  })

  r.post('/auth/login', async (ctx) => {
    const b = await readJson(ctx.req)
    const email = String(b.email ?? '').trim().toLowerCase()
    rateLimit(`login:${ctx.ip}:${email}`, { limit: 10, windowMs: 15 * 60e3 })
    if (!email || !b.password) throw bad('Enter your email and password.')
    await ensureAdmin()
    const db = await getDb()
    const user = await db.collection('users').findOne({ email })
    if (!user || !(await checkPassword(String(b.password), user.passwordHash))) {
      throw new HttpError(401, 'Incorrect email or password.')
    }
    if (user.status === 'pending') throw new HttpError(403, 'Your account is still awaiting approval. We will email you as soon as it is approved.', 'pending')
    if (user.status === 'rejected') throw new HttpError(403, 'Your account request was not approved. Please contact Everixa HR.', 'rejected')

    const { token, expiresAt } = await createSession(user, { remember: Boolean(b.remember), req: ctx.req, ip: ctx.ip })
    await logActivity(user._id, 'security', 'Signed in', ctx.req.headers['user-agent']?.slice(0, 80) ?? '')
    return ctx.ok({ token, expiresAt, user: publicUser(user) })
  })

  r.post('/auth/logout', requireAuth, async (ctx) => {
    const db = await getDb()
    await db.collection('sessions').deleteOne({ _id: ctx.session._id })
    ctx.ok()
  })

  r.get('/auth/me', requireAuth, (ctx) => ({ user: publicUser(ctx.user) }))

  r.post('/auth/forgot', async (ctx) => {
    rateLimit(`forgot:${ctx.ip}`, { limit: 6, windowMs: 3600e3 })
    const b = await readJson(ctx.req)
    const email = String(b.email ?? '').trim().toLowerCase()
    const db = await getDb()
    const user = email && (await db.collection('users').findOne({ email, status: 'approved' }))
    if (user) {
      const token = randomToken(32)
      await db.collection('resets').insertOne({ userId: user._id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3600e3) })
      const link = `${getConfig().frontendBase}/reset-password?token=${token}`
      await sendMail({ to: user.email, ...passwordReset(user, link) })
    }
    // Same answer whether or not the account exists.
    ctx.ok({ ok: true })
  })

  r.post('/auth/reset', async (ctx) => {
    rateLimit(`reset:${ctx.ip}`, { limit: 10, windowMs: 3600e3 })
    const b = await readJson(ctx.req)
    const password = validatePassword(b.password)
    const db = await getDb()
    const rec = await db.collection('resets').findOne({ tokenHash: sha256(String(b.token ?? '')), expiresAt: { $gt: new Date() } })
    if (!rec) throw bad('This reset link is invalid or has expired. Request a new one.')
    await db.collection('users').updateOne({ _id: rec.userId }, { $set: { passwordHash: await hashPassword(password) } })
    await db.collection('sessions').deleteMany({ userId: rec.userId })
    await db.collection('resets').deleteMany({ userId: rec.userId })
    await logActivity(rec.userId, 'security', 'Password reset')
    ctx.ok()
  })

  /* ── Profile & security ─────────────────────────────────────── */
  r.patch('/me', requireAuth, async (ctx) => {
    const b = await readJson(ctx.req)
    const set = {
      firstName: str(b.firstName, { field: 'First name', min: 1, max: 60 }),
      lastName: str(b.lastName, { field: 'Last name', min: 1, max: 60 }),
      phone: vPhone(b.phone),
    }
    const db = await getDb()
    const updated = await db.collection('users').findOneAndUpdate({ _id: ctx.user._id }, { $set: set }, { returnDocument: 'after' })
    await logActivity(ctx.user._id, 'setup', 'Profile updated')
    return { user: publicUser(updated) }
  })

  r.post('/me/password', requireAuth, async (ctx) => {
    rateLimit(`pw:${ctx.user._id}`, { limit: 8, windowMs: 15 * 60e3 })
    const b = await readJson(ctx.req)
    if (!(await checkPassword(String(b.current ?? ''), ctx.user.passwordHash))) throw bad('Your current password is incorrect.')
    const next = validatePassword(b.next)
    if (next === b.current) throw bad('Choose a password different from your current one.')
    const db = await getDb()
    await db.collection('users').updateOne({ _id: ctx.user._id }, { $set: { passwordHash: await hashPassword(next) } })
    await logActivity(ctx.user._id, 'security', 'Password changed')
    ctx.ok()
  })

  r.post('/me/avatar', requireAuth, async (ctx) => {
    const buffer = await readBody(ctx.req, 3 * 1024 * 1024)
    const file = await saveFile({ buffer, name: 'avatar', ownerId: ctx.user._id, kind: 'avatar', allowed: 'image' })
    const db = await getDb()
    if (ctx.user.avatarFileId) await removeFile(ctx.user.avatarFileId)
    const updated = await db.collection('users').findOneAndUpdate({ _id: ctx.user._id }, { $set: { avatarFileId: oid(file.id) } }, { returnDocument: 'after' })
    await logActivity(ctx.user._id, 'setup', 'Profile photo updated')
    return { user: publicUser(updated) }
  })

  r.get('/me/sessions', requireAuth, async (ctx) => {
    const db = await getDb()
    const list = await db.collection('sessions').find({ userId: ctx.user._id, expiresAt: { $gt: new Date() } }).sort({ lastSeenAt: -1 }).toArray()
    return {
      sessions: list.map((s) => ({
        id: String(s._id), device: s.device, ip: s.ip, createdAt: s.createdAt, lastSeenAt: s.lastSeenAt,
        current: String(s._id) === String(ctx.session._id),
      })),
    }
  })

  r.delete('/me/sessions/:id', requireAuth, async (ctx) => {
    const db = await getDb()
    await db.collection('sessions').deleteOne({ _id: oid(ctx.params.id), userId: ctx.user._id })
    await logActivity(ctx.user._id, 'security', 'Signed out a session')
    ctx.ok()
  })

  r.post('/me/sessions/revoke-others', requireAuth, async (ctx) => {
    const db = await getDb()
    const res = await db.collection('sessions').deleteMany({ userId: ctx.user._id, _id: { $ne: ctx.session._id } })
    await logActivity(ctx.user._id, 'security', 'Signed out other devices', `${res.deletedCount} session(s)`)
    ctx.ok({ ok: true, revoked: res.deletedCount })
  })

  /* ── File download ──────────────────────────────────────────────
   * Signed-in owner or admin, OR a valid time-limited signed link (the "view file" links in
   * the admin's emails). The underlying storage URL is never exposed. */
  r.get('/files/:id', async (ctx) => {
    const signed = verifyFileSig(ctx.params.id, ctx.query.exp, ctx.query.sig)
    if (!signed) await authenticate(ctx)
    const found = await loadFile(ctx.params.id)
    if (!found) throw new HttpError(404, 'File not found.')
    if (!signed) {
      const isOwner = found.doc.ownerId && String(found.doc.ownerId) === String(ctx.user._id)
      if (!isOwner && ctx.user.role !== 'admin') throw forbidden()
    }
    const type = found.doc.contentType
    ctx.file(found.buffer, { type, filename: found.doc.name, inline: signed ? type.startsWith('image/') || type === 'application/pdf' : type.startsWith('image/') })
  })
}

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { assertConfig, getConfig } from './config.js'
import { getDb, oid, ser } from './db.js'
import { HttpError } from './http.js'

export const hashPassword = (pw) => bcrypt.hash(pw, 11)
export const checkPassword = (pw, hash) => bcrypt.compare(pw, hash)

export function validatePassword(pw) {
  const s = String(pw ?? '')
  if (s.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.')
  if (s.length > 100) throw new HttpError(400, 'Password is too long.')
  return s
}

/** The user shape that is safe to send to the browser. */
export function publicUser(u) {
  if (!u) return null
  return {
    id: String(u._id),
    firstName: u.firstName,
    lastName: u.lastName,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    status: u.status,
    employeeId: u.employeeId,
    position: u.position ?? 'Team Member',
    department: u.department ?? '',
    hourlyRate: u.hourlyRate ?? 0,
    startDate: u.startDate ?? null,
    avatarFileId: u.avatarFileId ? String(u.avatarFileId) : null,
    createdAt: u.createdAt?.toISOString?.() ?? u.createdAt,
  }
}

export function deviceLabel(ua = '') {
  const os = /Windows/i.test(ua) ? 'Windows' : /Mac OS X|Macintosh/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iOS/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown device'
  const br = /Edg\//i.test(ua) ? 'Edge' : /OPR\//i.test(ua) ? 'Opera' : /Chrome\//i.test(ua) ? 'Chrome' : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : 'Browser'
  return `${br} on ${os}`
}

export async function createSession(user, { remember, req, ip }) {
  const cfg = assertConfig()
  const days = remember ? cfg.jwtDaysRemember : cfg.jwtDays
  const db = await getDb()
  const expiresAt = new Date(Date.now() + days * 864e5)
  const { insertedId } = await db.collection('sessions').insertOne({
    userId: user._id,
    device: deviceLabel(req.headers['user-agent']),
    ip: ip ?? '',
    createdAt: new Date(),
    lastSeenAt: new Date(),
    expiresAt,
  })
  const token = jwt.sign({ sub: String(user._id), sid: String(insertedId), role: user.role }, cfg.jwtSecret, { expiresIn: `${days}d` })
  return { token, sessionId: String(insertedId), expiresAt }
}

/** Attaches ctx.user / ctx.session from the Bearer token, or throws 401. */
export async function authenticate(ctx) {
  const header = ctx.req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new HttpError(401, 'Please sign in.', 'unauthenticated')
  let payload
  try {
    payload = jwt.verify(token, assertConfig().jwtSecret)
  } catch {
    throw new HttpError(401, 'Your session has expired. Please sign in again.', 'unauthenticated')
  }
  const db = await getDb()
  const session = await db.collection('sessions').findOne({ _id: oid(payload.sid), userId: oid(payload.sub) })
  if (!session) throw new HttpError(401, 'Your session has ended. Please sign in again.', 'unauthenticated')
  const user = await db.collection('users').findOne({ _id: oid(payload.sub) })
  if (!user || user.status !== 'approved') throw new HttpError(401, 'This account is not active.', 'unauthenticated')

  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    db.collection('sessions').updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } }).catch(() => {})
  }
  ctx.user = user
  ctx.session = session
}

export async function requireAuth(ctx) {
  await authenticate(ctx)
}

export async function requireAdmin(ctx) {
  await authenticate(ctx)
  if (ctx.user.role !== 'admin') throw new HttpError(403, 'Administrator access required.')
}

let adminChecked = false
/** Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD (or COMPANY_NOTIFY_EMAIL). */
export async function ensureAdmin() {
  if (adminChecked) return
  const cfg = getConfig()
  const db = await getDb()
  if (await db.collection('users').findOne({ role: 'admin' })) {
    adminChecked = true
    return
  }
  const { email, password } = cfg.admin
  if (!email || !password) {
    console.warn('[admin] No administrator exists. Set ADMIN_EMAIL (or COMPANY_NOTIFY_EMAIL) and ADMIN_PASSWORD to create one.')
    return
  }
  adminChecked = true
  await db.collection('users').insertOne({
    firstName: 'Everixa',
    lastName: 'Admin',
    email,
    phone: '',
    passwordHash: await hashPassword(password),
    role: 'admin',
    status: 'approved',
    employeeId: 'EW-ADMIN',
    position: 'Administrator',
    hourlyRate: 0,
    startDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date(),
  })
  console.log(`[admin] Created administrator account for ${email}`)
}

export { ser }

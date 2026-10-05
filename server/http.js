import { getConfig } from './config.js'

export class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export const bad = (msg, code) => new HttpError(400, msg, code)
export const forbidden = (msg = 'Not allowed.', code) => new HttpError(403, msg, code)
export const notFound = (msg = 'Not found.') => new HttpError(404, msg)

/** Reads the raw request body without relying on platform body parsers. */
export async function readBody(req, limit = 4 * 1024 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new HttpError(413, `That file is too large (limit ${Math.round(limit / 1024 / 1024)} MB).`)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function readJson(req) {
  const buf = await readBody(req, 1024 * 1024)
  if (!buf.length) return {}
  try {
    return JSON.parse(buf.toString('utf8'))
  } catch {
    throw bad('Invalid JSON body.')
  }
}

export function send(res, status, payload, headers = {}) {
  const body = payload === undefined ? '' : JSON.stringify(payload)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers })
  res.end(body)
}

export function sendBuffer(res, buffer, { type = 'application/octet-stream', filename, inline = false } = {}) {
  const headers = {
    'Content-Type': type,
    'Content-Length': buffer.length,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  }
  if (filename) {
    const safe = filename.replace(/[^\w.\- ]+/g, '_')
    headers['Content-Disposition'] = `${inline ? 'inline' : 'attachment'}; filename="${safe}"`
  }
  res.writeHead(200, headers)
  res.end(buffer)
}

function corsHeaders(req) {
  const origins = getConfig().origins
  const origin = req.headers.origin
  const headers = { Vary: 'Origin' }
  if (origin && origins.some((o) => o.replace(/\/$/, '') === origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
    headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-Filename'
    headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  }
  return headers
}

export function createRouter() {
  const routes = []
  const add = (method, pattern, ...handlers) => {
    const keys = []
    const re = new RegExp(
      '^' +
        pattern
          .replace(/\/+$/, '')
          .replace(/:([A-Za-z]+)/g, (_, k) => {
            keys.push(k)
            return '([^/]+)'
          }) +
        '/?$'
    )
    routes.push({ method, re, keys, handlers })
  }
  const router = {
    get: (p, ...h) => add('GET', p, ...h),
    post: (p, ...h) => add('POST', p, ...h),
    put: (p, ...h) => add('PUT', p, ...h),
    patch: (p, ...h) => add('PATCH', p, ...h),
    delete: (p, ...h) => add('DELETE', p, ...h),
    async handle(req, res) {
      const url = new URL(req.url, 'http://x')
      const path = url.pathname.replace(/^\/api/, '') || '/'
      const cors = corsHeaders(req)
      const secure = {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': 'no-store',
        ...cors,
      }

      if (req.method === 'OPTIONS') {
        res.writeHead(204, secure)
        return res.end()
      }

      const route = routes.find((r) => r.method === req.method && r.re.test(path))
      if (!route) {
        return send(res, 404, { error: 'Not found.' }, secure)
      }

      const m = path.match(route.re)
      const params = {}
      route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])))
      const ctx = {
        req,
        res,
        params,
        query: Object.fromEntries(url.searchParams),
        user: null,
        session: null,
        headers: secure,
        json: (status, payload) => send(res, status, payload, secure),
        ok: (payload = { ok: true }) => send(res, 200, payload, secure),
        file: (buffer, opts) => {
          res.setHeader?.('X-Content-Type-Options', 'nosniff')
          return sendBuffer(res, buffer, opts)
        },
        ip: String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? '').split(',')[0].trim(),
      }

      try {
        for (const h of route.handlers) {
          const out = await h(ctx)
          if (res.writableEnded) return
          if (out !== undefined) return ctx.json(200, out)
        }
        if (!res.writableEnded) ctx.ok()
      } catch (err) {
        if (res.writableEnded) return
        if (err instanceof HttpError) {
          return send(res, err.status, { error: err.message, code: err.code }, secure)
        }
        console.error('[api] unhandled error', req.method, path, err)
        return send(res, 500, { error: 'Something went wrong on our side. Please try again.' }, secure)
      }
    },
  }
  return router
}

/* ── Validation helpers ───────────────────────────────────────── */
export const str = (v, { max = 500, min = 0, field = 'Field' } = {}) => {
  const s = String(v ?? '').trim()
  if (s.length < min) throw bad(`${field} is required.`)
  if (s.length > max) throw bad(`${field} is too long.`)
  return s
}
export const email = (v) => {
  const s = String(v ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || s.length > 254) throw bad('Enter a valid email address.')
  return s
}
export const phone = (v) => {
  const s = String(v ?? '').trim()
  if (s.replace(/\D/g, '').length < 10 || s.length > 30) throw bad('Enter a valid 10-digit phone number.')
  return s
}
export const num = (v, { min = -Infinity, max = Infinity, field = 'Value' } = {}) => {
  const n = Number(v)
  if (!Number.isFinite(n) || n < min || n > max) throw bad(`${field} is not valid.`)
  return n
}

/* ── Naive in-memory rate limiter (per warm instance) ─────────── */
const hits = new Map()
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now()
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (arr.length >= limit) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.')
  arr.push(now)
  hits.set(key, arr)
  if (hits.size > 5000) hits.clear()
}

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * API client. Requests go to `${VITE_API_URL}/api/...` (same origin in development and on
 * Vercel). The session token lives in localStorage when "Remember me" is ticked,
 * otherwise in sessionStorage so it disappears when the browser closes.
 */
const isLocalHost = (h) => h === 'localhost' || h === '127.0.0.1' || h === '[::1]'

/**
 * Base URL for API calls. Empty means "same origin" (`/api/...`), which is right for Vercel and for
 * the Vite dev server. VITE_API_URL is only honoured when it points somewhere genuinely different;
 * a localhost value baked into a production build is ignored, so a deployed site never tries to
 * call the visitor's own computer.
 */
const BASE = (() => {
  const configured = String(import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
  if (!configured) return ''
  try {
    const u = new URL(configured)
    if (u.origin === window.location.origin) return ''
    if (isLocalHost(u.hostname) && !isLocalHost(window.location.hostname)) return ''
  } catch {
    return ''
  }
  return configured
})()
const TOKEN_KEY = 'everixa_token'
const USER_KEY = 'everixa_user'

const stores = () => [localStorage, sessionStorage]

export function getToken() {
  for (const s of stores()) {
    try {
      const t = s.getItem(TOKEN_KEY)
      if (t) return t
    } catch { /* storage blocked */ }
  }
  return null
}

export function saveSession(token, user, remember) {
  clearSession()
  const s = remember ? localStorage : sessionStorage
  s.setItem(TOKEN_KEY, token)
  s.setItem(USER_KEY, JSON.stringify(user))
}

export function updateStoredUser(user) {
  for (const s of stores()) if (s.getItem(TOKEN_KEY)) s.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  for (const s of stores()) {
    try {
      s.removeItem(TOKEN_KEY)
      s.removeItem(USER_KEY)
    } catch { /* ignore */ }
  }
}

export function storedUser() {
  for (const s of stores()) {
    try {
      const u = s.getItem(USER_KEY)
      if (u) return JSON.parse(u)
    } catch { /* ignore */ }
  }
  return null
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request(path, { method = 'GET', body, raw, headers = {}, auth = true, as = 'json' } = {}) {
  const h = { ...headers }
  const token = auth ? getToken() : null
  if (token) h.Authorization = `Bearer ${token}`
  let payload
  if (raw !== undefined) payload = raw
  else if (body !== undefined) {
    h['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers: h, body: payload })
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again.', 0, 'network')
  }

  if (!res.ok) {
    let data = {}
    try { data = await res.json() } catch { /* no body */ }
    if (res.status === 401 && auth && token) {
      clearSession()
      window.dispatchEvent(new CustomEvent('everixa:signed-out'))
    }
    throw new ApiError(data.error || data.message || 'Something went wrong. Please try again.', res.status, data.code)
  }
  if (as === 'blob') return { blob: await res.blob(), type: res.headers.get('content-type') }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  put: (p, body, o) => request(p, { ...o, method: 'PUT', body }),
  patch: (p, body, o) => request(p, { ...o, method: 'PATCH', body }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' }),
  /** Raw binary upload (images / PDFs). */
  upload: (p, file, o = {}) =>
    request(p, { ...o, method: 'POST', raw: file, headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': encodeURIComponent(file.name || 'file'), ...o.headers } }),
}

/** Authenticated download (PDFs, documents) → saves with the given name. */
export async function downloadFile(path, filename) {
  const { blob } = await request(path, { as: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Opens an authenticated file (e.g. an ID image) in a new tab. */
export async function openFile(path) {
  const { blob } = await request(path, { as: 'blob' })
  window.open(URL.createObjectURL(blob), '_blank', 'noopener')
}

/** Loads GET data and re-fetches on demand. */
export function useApi(path, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path && enabled) })
  const seq = useRef(0)

  const load = useCallback(
    async (silent = false) => {
      if (!path || !enabled) return
      const id = ++seq.current
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await api.get(path)
        if (id === seq.current) setState({ data, error: null, loading: false })
      } catch (error) {
        if (id === seq.current) setState((s) => ({ data: silent ? s.data : null, error, loading: false }))
      }
    },
    [path, enabled]
  )

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally invalidates any in-flight request
    return () => { seq.current++ }
  }, [load])

  // A path that appears after the first render has no data yet: report that as loading, never as an empty success.
  const pending = Boolean(path && enabled) && state.data == null && state.error == null
  return { ...state, loading: state.loading || pending, reload: () => load(true) }
}

/** Compress an image in the browser so uploads stay small and fast. */
export async function compressImage(file, { max = 1600, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/')) return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality))
  return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file
}

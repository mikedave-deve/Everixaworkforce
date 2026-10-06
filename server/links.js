import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { assertConfig, getConfig } from './config.js'

/** Absolute URL on the live website (never localhost on Vercel). */
export const siteUrl = (path = '/') => `${getConfig().frontendBase}${path.startsWith('/') ? path : `/${path}`}`

const key = () => createHash('sha256').update(`everixa:file-links:${assertConfig().jwtSecret}`).digest()
const sign = (fileId, exp) => createHmac('sha256', key()).update(`${fileId}.${exp}`).digest('hex').slice(0, 40)

/**
 * A time-limited link to one stored file, for the admin's email. Anyone holding the link can
 * view that single file until it expires, so links are short-lived and only ever sent to the
 * company inbox. The underlying Vercel Blob URL is never exposed.
 */
export function signedFileUrl(fileId, days = 7) {
  const exp = Math.floor(Date.now() / 1000) + days * 86400
  return `${siteUrl('/api/files')}/${fileId}?exp=${exp}&sig=${sign(fileId, exp)}`
}

export function verifyFileSig(fileId, exp, sig) {
  const e = Number(exp)
  if (!Number.isFinite(e) || e < Date.now() / 1000 || !sig) return false
  const want = Buffer.from(sign(fileId, e))
  const got = Buffer.from(String(sig))
  return want.length === got.length && timingSafeEqual(want, got)
}

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { assertConfig } from './config.js'

/** AES-256-GCM for sensitive values at rest (bank numbers, SSN, licence numbers). */
const key = () => createHash('sha256').update(`everixa:data:${assertConfig().jwtSecret}`).digest()

export function encrypt(plain) {
  if (plain == null || plain === '') return ''
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()])
  return `v1.${iv.toString('base64')}.${c.getAuthTag().toString('base64')}.${enc.toString('base64')}`
}

export function decrypt(token) {
  if (!token) return ''
  try {
    const [, iv, tag, data] = String(token).split('.')
    const d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'))
    d.setAuthTag(Buffer.from(tag, 'base64'))
    return Buffer.concat([d.update(Buffer.from(data, 'base64')), d.final()]).toString('utf8')
  } catch {
    return ''
  }
}

export const last4 = (v) => String(v ?? '').replace(/\D/g, '').slice(-4)
export const mask = (v) => (last4(v) ? `••••${last4(v)}` : '')
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('hex')
export const sha256 = (v) => createHash('sha256').update(String(v)).digest('hex')

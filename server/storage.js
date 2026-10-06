import { randomUUID } from 'node:crypto'
import { Binary } from 'mongodb'
import { put, del, get } from '@vercel/blob'
import { getConfig } from './config.js'
import { getDb, oid, ser } from './db.js'
import { HttpError } from './http.js'

/**
 * File storage.
 *  - With BLOB_READ_WRITE_TOKEN set, files go to Vercel Blob.
 *  - Without it, files (max 4 MB each) are stored in MongoDB instead, so uploads still work.
 *    Files already stored there stay readable after a Blob token is added later.
 *
 * Storage URLs are never sent to the browser: every download is proxied through
 * GET /api/files/:id so access is always checked against the signed-in user.
 */
export const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  doc: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  any: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

/** Verifies the real file type from magic bytes rather than trusting the header. */
export function sniff(buf) {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp'
  if (buf.slice(0, 5).toString() === '%PDF-') return 'application/pdf'
  if (buf.slice(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (buf.slice(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0]))) return 'application/msword'
  return null
}

let warned = false
let detectedAccess = null

/**
 * Uploads to Vercel Blob. A store is either private or public and the API rejects the wrong
 * one, so we try private first (the safer default for ID documents) and fall back to public,
 * remembering what worked.
 */
async function putBlob(key, buffer, type, token) {
  const order = detectedAccess ? [detectedAccess] : ['private', 'public']
  let lastErr
  for (const access of order) {
    try {
      const blob = await put(key, buffer, { access, addRandomSuffix: true, contentType: type, token })
      detectedAccess = access
      return { blob, access }
    } catch (err) {
      lastErr = err
      if (!/\b(private|public)\b/i.test(err.message ?? '')) throw err // not an access-type mismatch
    }
  }
  throw lastErr
}

export async function saveFile({ buffer, name, ownerId = null, kind, allowed = 'any', meta = {} }) {
  const type = sniff(buffer)
  if (!type || !ALLOWED[allowed].includes(type)) {
    throw new HttpError(415, allowed === 'image' ? 'Please upload a JPG, PNG or WebP image.' : 'That file type is not supported.')
  }
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[type] ?? 'bin'
  const cfg = getConfig()
  const doc = {
    ownerId: ownerId ? oid(ownerId) : null,
    kind,
    name: String(name || `file.${ext}`).slice(0, 200),
    contentType: type,
    size: buffer.length,
    createdAt: new Date(),
    ...meta,
  }
  const db = await getDb()

  if (cfg.blobToken) {
    const { blob, access } = await putBlob(`${kind}/${randomUUID()}.${ext}`, buffer, type, cfg.blobToken)
    doc.storage = 'blob'
    doc.blobUrl = blob.url
    doc.blobPathname = blob.pathname
    doc.blobAccess = access
    const { insertedId } = await db.collection('files').insertOne(doc)
    return ser({ _id: insertedId, ...doc }, ['blobUrl', 'blobPathname', 'blobAccess', 'storage'])
  }

  if (!warned) {
    warned = true
    console.warn('[storage] BLOB_READ_WRITE_TOKEN is not set — storing uploaded files in MongoDB. Add the token to use Vercel Blob.')
  }
  doc.storage = 'db'
  const { insertedId } = await db.collection('files').insertOne(doc)
  try {
    await db.collection('fileData').insertOne({ _id: insertedId, data: new Binary(buffer) })
  } catch (err) {
    await db.collection('files').deleteOne({ _id: insertedId })
    throw err
  }
  return ser({ _id: insertedId, ...doc }, ['storage'])
}

export async function loadFile(id) {
  const _id = oid(id)
  if (!_id) return null
  const db = await getDb()
  const doc = await db.collection('files').findOne({ _id })
  if (!doc) return null
  let buffer
  if (doc.storage === 'blob') {
    if (doc.blobAccess === 'private') {
      const r = await get(doc.blobPathname ?? doc.blobUrl, { access: 'private', token: getConfig().blobToken })
      if (!r || r.statusCode !== 200) throw new HttpError(502, 'The file could not be retrieved.')
      buffer = Buffer.from(await new Response(r.stream).arrayBuffer())
    } else {
      const r = await fetch(doc.blobUrl)
      if (!r.ok) throw new HttpError(502, 'The file could not be retrieved.')
      buffer = Buffer.from(await r.arrayBuffer())
    }
  } else {
    const row = await db.collection('fileData').findOne({ _id })
    if (!row) throw new HttpError(404, 'The file content is missing.')
    buffer = Buffer.from(row.data.buffer)
  }
  return { doc, buffer }
}

export async function removeFile(id) {
  const _id = oid(id)
  if (!_id) return
  const db = await getDb()
  const doc = await db.collection('files').findOne({ _id })
  if (!doc) return
  try {
    if (doc.storage === 'blob') await del(doc.blobUrl, { token: getConfig().blobToken })
    else await db.collection('fileData').deleteOne({ _id })
  } catch {
    /* already gone */
  }
  await db.collection('files').deleteOne({ _id })
}

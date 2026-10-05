import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { put, del } from '@vercel/blob'
import { getConfig } from './config.js'
import { getDb, oid, ser } from './db.js'
import { HttpError } from './http.js'

/**
 * File storage. Production uses Vercel Blob (BLOB_READ_WRITE_TOKEN). Without a token
 * (local development) files are written to .data/blob instead, behind the same API.
 *
 * Blob URLs are never sent to the browser: every download is proxied through
 * GET /api/files/:id so access is always checked against the signed-in user.
 */
const LOCAL_DIR = path.resolve(process.cwd(), '.data', 'blob')

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

export async function saveFile({ buffer, name, ownerId = null, kind, allowed = 'any', meta = {} }) {
  const type = sniff(buffer)
  if (!type || !ALLOWED[allowed].includes(type)) {
    throw new HttpError(415, allowed === 'image' ? 'Please upload a JPG, PNG or WebP image.' : 'That file type is not supported.')
  }
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[type] ?? 'bin'
  const key = `${kind}/${randomUUID()}.${ext}`
  const cfg = getConfig()
  if (!cfg.blobToken && cfg.isProd) {
    throw new HttpError(503, 'File storage is not configured yet. Ask the site owner to set BLOB_READ_WRITE_TOKEN.')
  }
  const doc = {
    ownerId: ownerId ? oid(ownerId) : null,
    kind,
    name: String(name || `file.${ext}`).slice(0, 200),
    contentType: type,
    size: buffer.length,
    createdAt: new Date(),
    ...meta,
  }

  if (cfg.blobToken) {
    const blob = await put(key, buffer, { access: 'public', addRandomSuffix: true, contentType: type, token: cfg.blobToken })
    doc.storage = 'blob'
    doc.blobUrl = blob.url
  } else {
    const full = path.join(LOCAL_DIR, key)
    await mkdir(path.dirname(full), { recursive: true })
    await writeFile(full, buffer)
    doc.storage = 'local'
    doc.localKey = key
  }

  const db = await getDb()
  const { insertedId } = await db.collection('files').insertOne(doc)
  return ser({ _id: insertedId, ...doc }, ['blobUrl', 'localKey', 'storage'])
}

export async function loadFile(id) {
  const _id = oid(id)
  if (!_id) return null
  const db = await getDb()
  const doc = await db.collection('files').findOne({ _id })
  if (!doc) return null
  let buffer
  if (doc.storage === 'blob') {
    const r = await fetch(doc.blobUrl)
    if (!r.ok) throw new HttpError(502, 'The file could not be retrieved.')
    buffer = Buffer.from(await r.arrayBuffer())
  } else {
    buffer = await readFile(path.join(LOCAL_DIR, doc.localKey))
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
    else await unlink(path.join(LOCAL_DIR, doc.localKey))
  } catch {
    /* already gone */
  }
  await db.collection('files').deleteOne({ _id })
}

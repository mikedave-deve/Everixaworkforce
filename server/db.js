import { MongoClient, ObjectId } from 'mongodb'
import { getConfig } from './config.js'

export { ObjectId }

const g = globalThis
let indexesReady = false

async function startMemoryServer() {
  // Dev/test only: an embedded MongoDB persisted under .data/mongo.
  const { MongoMemoryServer } = await import('mongodb-memory-server')
  const { mkdirSync } = await import('node:fs')
  const { fileURLToPath } = await import('node:url')
  const dbPath = process.env.MEMORY_DB_PATH || fileURLToPath(new URL('../.data/mongo', import.meta.url))
  mkdirSync(dbPath, { recursive: true })
  const server = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } })
  g.__everixaMem = server
  return server.getUri()
}

async function connect() {
  const cfg = getConfig()
  let uri = cfg.mongoUri
  if (!uri) {
    if (cfg.isProd) throw new Error('MONGODB_URI is not set.')
    console.warn('[db] MONGODB_URI is empty — using an embedded development database (.data/mongo).')
    uri = await startMemoryServer()
  }
  const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
  await client.connect()
  return client
}

export async function getDb() {
  if (!g.__everixaMongo) g.__everixaMongo = connect()
  const client = await g.__everixaMongo
  const db = client.db(getConfig().dbName)
  if (!indexesReady) {
    indexesReady = true
    await ensureIndexes(db).catch((e) => {
      indexesReady = false
      console.error('[db] index creation failed:', e.message)
    })
  }
  return db
}

async function ensureIndexes(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await db.collection('sessions').createIndex({ userId: 1 })
  await db.collection('activity').createIndex({ userId: 1, at: -1 })
  await db.collection('shipments').createIndex({ tracking: 1 }, { unique: true })
  await db.collection('payroll').createIndex({ userId: 1, payDate: -1 })
  await db.collection('timesheets').createIndex({ userId: 1, week: 1 }, { unique: true })
  await db.collection('resets').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
}

export async function closeDb() {
  if (g.__everixaMongo) {
    const c = await g.__everixaMongo
    await c.close()
    g.__everixaMongo = null
  }
  if (g.__everixaMem) {
    await g.__everixaMem.stop()
    g.__everixaMem = null
  }
  indexesReady = false
}

export const oid = (v) => {
  try {
    return new ObjectId(String(v))
  } catch {
    return null
  }
}

/** Mongo document → plain JSON with `id`. Drops internal fields. */
export function ser(doc, hide = []) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  for (const k of hide) delete rest[k]
  const out = { id: String(_id), ...rest }
  for (const [k, v] of Object.entries(out)) {
    if (v instanceof ObjectId) out[k] = String(v)
    else if (v instanceof Date) out[k] = v.toISOString()
  }
  return out
}

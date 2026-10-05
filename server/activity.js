import { getDb, oid } from './db.js'

/** Appends an event to an employee's activity history. Never throws. */
export async function logActivity(userId, type, title, detail = '') {
  try {
    const db = await getDb()
    await db.collection('activity').insertOne({ userId: oid(userId), type, title, detail, at: new Date() })
  } catch (e) {
    console.error('[activity] failed to log', e.message)
  }
}

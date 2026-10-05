import http from 'node:http'
import { existsSync } from 'node:fs'

// Standalone API server for local development: `npm run api`
if (existsSync('.env')) process.loadEnvFile('.env')

const { handle } = await import('./app.js')
const { getConfig } = await import('./config.js')
const { getDb } = await import('./db.js')
const { ensureAdmin } = await import('./auth.js')

const port = getConfig().port
http.createServer((req, res) => handle(req, res)).listen(port, async () => {
  console.log(`[api] listening on http://localhost:${port}`)
  try {
    await getDb()
    await ensureAdmin()
  } catch (e) {
    console.error('[api] startup check failed:', e.message)
  }
})

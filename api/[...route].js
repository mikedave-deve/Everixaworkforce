import { handle } from '../server/app.js'

// One serverless function serves the whole API (keeps us well under Vercel's function limits).
export default function handler(req, res) {
  return handle(req, res)
}

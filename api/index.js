import { handle } from '../server/app.js'

/**
 * The single serverless function behind every /api/* request.
 * vercel.json rewrites /api/<anything> to this file and passes the original path as ?__path=,
 * so routing works regardless of how many segments the URL has.
 */
export default function handler(req, res) {
  return handle(req, res)
}

import { getConfig } from './config.js'

/**
 * The Hostinger Mail API addresses a mailbox by its resource ID, not its email address.
 * HOSTINGER_MAILBOX_RESOURCE_ID wins if set; otherwise the ID is looked up once from the
 * token (GET /api/v1/me), matching HOSTINGER_MAILBOX_ADDRESS, and cached.
 */
async function resolveMailboxId(cfg) {
  if (process.env.HOSTINGER_MAILBOX_RESOURCE_ID?.trim()) return process.env.HOSTINGER_MAILBOX_RESOURCE_ID.trim()
  const cache = (globalThis.__hostingerMailbox ??= {})
  if (cache[cfg.mail.token]) return cache[cfg.mail.token]
  const res = await fetch(`${cfg.mail.apiBase}/api/v1/me`, { headers: { Authorization: `Bearer ${cfg.mail.token}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Hostinger /me responded ${res.status}`)
  const { data } = await res.json()
  const boxes = data?.mailboxes ?? []
  const match = boxes.find((m) => m.address?.toLowerCase() === cfg.mail.address.toLowerCase()) ?? boxes[0]
  if (!match) throw new Error('No mailbox is available for this Hostinger token.')
  cache[cfg.mail.token] = match.resourceId
  return match.resourceId
}

/**
 * Sends mail through Hostinger's HTTP Mail API (POST /api/v1/mailboxes/{id}/send).
 * With no HOSTINGER_API_TOKEN the message is logged instead, so local development
 * and tests never send real email. Failures are logged and never break a request.
 */
export async function sendMail({ to, subject, html, text, attachments }) {
  const cfg = getConfig()
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (!recipients.length) return { sent: false, reason: 'no-recipient' }

  if (process.env.MAIL_DRY_RUN === '1' || !cfg.mail.token) {
    console.log(`[mail:dry-run] to=${recipients.join(', ')} subject="${subject}"`)
    globalThis.__sentMail = [...(globalThis.__sentMail ?? []).slice(-50), { to: recipients, subject, html, text, attachments }]
    return { sent: false, reason: 'dry-run' }
  }

  try {
    const mailboxId = await resolveMailboxId(cfg)
    const res = await fetch(`${cfg.mail.apiBase}/api/v1/mailboxes/${encodeURIComponent(mailboxId)}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.mail.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipients,
        displayName: cfg.mail.displayName,
        subject,
        html,
        text: text ?? subject,
        ...(attachments?.length ? { attachments } : {}),
      }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[mail] Hostinger responded ${res.status}: ${body.slice(0, 300)}`)
      return { sent: false, reason: `http-${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('[mail] send failed:', err.message)
    return { sent: false, reason: 'network' }
  }
}

export const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v ?? '')

/**
 * Email the company inbox (COMPANY_NOTIFY_EMAIL). If that address is malformed we warn and fall
 * back to the Hostinger mailbox itself, so submissions are never silently lost.
 */
export function notifyCompany(message) {
  const { notify, address } = getConfig().mail
  let to = notify
  if (!validEmail(notify)) {
    console.warn('[mail] COMPANY_NOTIFY_EMAIL is missing or not a valid email address — using HOSTINGER_MAILBOX_ADDRESS instead. Please fix it in .env.')
    to = address
  }
  return sendMail({ to, ...message })
}

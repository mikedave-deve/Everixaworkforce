import { getConfig } from './config.js'
import { siteUrl } from './links.js'

/*
 * Everixa email design: ink header with the framed italic wordmark (EVERIXA │ WORKFORCE),
 * ivory page, brass accent. Every email links back to the right page on the live website.
 */
const C = { ink: '#111b2b', ink2: '#19263a', ivory: '#faf7f1', paper: '#ffffff', brass: '#9a7336', brassLight: '#d9bf91', text: '#263648', muted: '#6d7f99', line: '#e8e1d1' }
const serif = "Georgia, 'Times New Roman', serif"
const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function button(label, href) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="background:${C.ink};border-radius:2px">
    <a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font:600 14px ${sans};color:${C.ivory};text-decoration:none;letter-spacing:.02em">${esc(label)}</a>
  </td></tr></table>`
}

export function rows(pairs) {
  const body = pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `<tr>
        <td style="padding:11px 0;border-bottom:1px solid ${C.line};width:38%;vertical-align:top;font:600 11px ${sans};letter-spacing:.14em;text-transform:uppercase;color:${C.muted}">${esc(k)}</td>
        <td style="padding:11px 0 11px 12px;border-bottom:1px solid ${C.line};font:400 15px/1.55 ${sans};color:${C.ink}">${String(v).includes('\n') ? esc(v).replace(/\n/g, '<br>') : esc(v)}</td>
      </tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0">${body}</table>`
}

/** A list of "open this file" links (signed, time-limited) shown under the details. */
function fileLinks(files) {
  if (!files?.length) return ''
  const items = files
    .map((f) => `<tr><td style="padding:8px 0"><a href="${esc(f.url)}" style="font:600 14px ${sans};color:${C.brass};text-decoration:underline">${esc(f.label)} →</a></td></tr>`)
    .join('')
  return `<div style="margin:24px 0 0;padding:18px 20px;background:${C.ivory};border-left:3px solid ${C.brass}">
    <div style="font:600 11px ${sans};letter-spacing:.16em;text-transform:uppercase;color:${C.muted};margin-bottom:6px">Uploaded files</div>
    <table role="presentation" cellpadding="0" cellspacing="0">${items}</table>
    <div style="font:400 12px/1.5 ${sans};color:${C.muted};margin-top:6px">These links open the file securely and expire after 7 days. You can also view everything in the admin portal.</div>
  </div>`
}

export function layout({ preheader = '', eyebrow, title, intro, body = '', cta }) {
  const cfg = getConfig()
  const home = siteUrl('/')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.ivory}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory}"><tr><td align="center" style="padding:32px 14px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">
    <tr><td style="background:${C.ink};padding:32px 36px;border-radius:2px 2px 0 0">
      <a href="${esc(home)}" style="text-decoration:none">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid rgba(250,247,241,.78)"><tr>
          <td style="padding:10px 20px;font:italic 600 21px ${serif};letter-spacing:.07em;color:${C.ivory};white-space:nowrap">EVERIXA WORKFORCE</td>
        </tr></table>
      </a>
    </td></tr>
    <tr><td style="height:3px;background:${C.brass};font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="background:${C.paper};padding:40px 36px 36px">
      ${eyebrow ? `<div style="font:600 11px ${sans};letter-spacing:.2em;text-transform:uppercase;color:${C.brass};margin-bottom:14px">${esc(eyebrow)}</div>` : ''}
      <h1 style="margin:0 0 16px;font:500 32px/1.12 ${serif};letter-spacing:-.01em;color:${C.ink}">${esc(title)}</h1>
      ${intro ? `<p style="margin:0;font:400 16px/1.65 ${sans};color:${C.text}">${intro}</p>` : ''}
      ${body}
      ${cta ? button(cta.label, cta.href) : ''}
    </td></tr>
    <tr><td style="background:${C.ink2};padding:24px 36px;border-radius:0 0 2px 2px">
      <div style="font:600 11px ${sans};letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px">
        <a href="${esc(home)}" style="color:${C.brassLight};text-decoration:none">Website</a>
        <span style="color:rgba(250,247,241,.3)">&nbsp;·&nbsp;</span>
        <a href="${esc(siteUrl('/contact'))}" style="color:${C.brassLight};text-decoration:none">Contact</a>
        <span style="color:rgba(250,247,241,.3)">&nbsp;·&nbsp;</span>
        <a href="${esc(cfg.loginUrl)}" style="color:${C.brassLight};text-decoration:none">Sign in</a>
      </div>
      <div style="font:400 12px/1.7 ${sans};color:rgba(250,247,241,.65)">
        Everixa Workforce · Staffing &amp; Recruitment since 2006<br>
        110 N Wacker Drive, Chicago, IL 60606 · (863) 243-3789
      </div>
    </td></tr>
  </table>
</td></tr></table></body></html>`
}

/* ── Account lifecycle ─────────────────────────────────────────── */
export const accountPending = (u) => ({
  subject: 'We received your Everixa account request',
  html: layout({
    preheader: 'Your account is awaiting approval.',
    eyebrow: 'Employee Portal',
    title: `Thanks, ${u.firstName}. We have your request.`,
    intro: 'Your Everixa Workforce account has been created and is waiting for approval. Our team reviews every request personally — you will receive another email as soon as it has been approved.',
    body: rows([['Name', `${u.firstName} ${u.lastName}`], ['Email', u.email], ['Status', 'Awaiting approval']]),
    cta: { label: 'Visit our website', href: siteUrl('/') },
  }),
})

export const accountApproved = (u) => ({
  subject: 'Your Everixa account is approved',
  html: layout({
    preheader: 'You can now sign in to the employee portal.',
    eyebrow: 'Account approved',
    title: `Welcome aboard, ${u.firstName}.`,
    intro: 'Good news — your account has been approved. You can now sign in to the Everixa employee portal to view your missions, pay, time sheet and more.',
    cta: { label: 'Sign in to your portal', href: getConfig().loginUrl },
  }),
})

export const accountRejected = (u, note) => ({
  subject: 'An update on your Everixa account request',
  html: layout({
    preheader: 'We were unable to approve your account request.',
    eyebrow: 'Account request',
    title: `Hello ${u.firstName}, an update on your request.`,
    intro: 'Unfortunately we were not able to approve your account request at this time.',
    body: (note ? rows([['Note from our team', note]]) : '') + `<p style="margin:22px 0 0;font:400 15px/1.65 ${sans};color:${C.text}">If you believe this is a mistake, please reply to this email or call (863) 243-3789 and we will be glad to help.</p>`,
    cta: { label: 'Contact us', href: siteUrl('/contact') },
  }),
})

export const passwordReset = (u, link) => ({
  subject: 'Reset your Everixa password',
  html: layout({
    preheader: 'Choose a new password in one step.',
    eyebrow: 'Password reset',
    title: 'Choose a new password.',
    intro: `Hi ${esc(u.firstName)}, tap the button below, type a new password, and you're done. The link works for one hour. If you didn't ask for this, you can safely ignore this email.`,
    cta: { label: 'Set a new password', href: link },
  }),
})

export const passwordSetByAdmin = (u) => ({
  subject: 'Your Everixa password was changed',
  html: layout({
    preheader: 'An administrator set a new password for your account.',
    eyebrow: 'Account security',
    title: `Hi ${u.firstName}, your password was changed.`,
    intro: 'An Everixa administrator has set a new password on your account. They will share it with you directly. Once you are signed in, you can change it any time under Profile &amp; Security.',
    cta: { label: 'Sign in', href: getConfig().loginUrl },
  }),
})

/* ── Pay transfers ─────────────────────────────────────────────── */
export const transferCode = (u, { code, amount, bank, minutes }) => ({
  subject: `${code} is your Everixa transfer confirmation code`,
  html: layout({
    preheader: `Your confirmation code is ${code}. It expires in ${minutes} minutes.`,
    eyebrow: 'Pay transfer',
    title: 'Confirm your transfer.',
    intro: `Hi ${esc(u.firstName)}, enter the code below in the confirmation box on your Pay page to send your funds to your bank account.`,
    body: `<div style="margin:26px 0 0;padding:26px 20px;background:${C.ivory};border:1px solid ${C.line};border-top:3px solid ${C.brass};text-align:center">
        <div style="font:600 11px ${sans};letter-spacing:.2em;text-transform:uppercase;color:${C.muted};margin-bottom:12px">Confirmation code</div>
        <div style="font:600 40px ${serif};letter-spacing:.34em;color:${C.ink};padding-left:.34em">${esc(code)}</div>
        <div style="font:400 13px ${sans};color:${C.muted};margin-top:12px">Expires in ${esc(minutes)} minutes</div>
      </div>`
      + rows([['Amount', amount], ['Sending to', bank]])
      + `<p style="margin:22px 0 0;font:400 14px/1.65 ${sans};color:${C.text}"><strong>Never share this code.</strong> Everixa staff will never ask you for it. If you did not request this transfer, ignore this email and change your password under Profile &amp; Security.</p>`,
  }),
})

export const transferComplete = (u, { amount, bank, reference }) => ({
  subject: `Your transfer of ${amount} was successful`,
  html: layout({
    preheader: `${amount} is on its way to ${bank}.`,
    eyebrow: 'Transfer successful',
    title: `${amount} is on its way.`,
    intro: `Hi ${esc(u.firstName)}, your transfer was confirmed and your funds have been sent to your bank account.`,
    body: rows([['Amount', amount], ['Sent to', bank], ['Reference', reference]])
      + `<p style="margin:22px 0 0;font:400 14px/1.65 ${sans};color:${C.text}">Bank transfers typically reach your account within 1–3 business days. If you did not make this transfer, contact us right away.</p>`,
    cta: { label: 'View your pay', href: siteUrl('/portal/pay') },
  }),
})

/* ── Notifications to the company inbox ────────────────────────── */
export const adminNotice = ({ eyebrow, title, intro, fields, link, linkLabel = 'Open in admin portal', files }) => ({
  subject: `${eyebrow}: ${title}`,
  html: layout({
    preheader: title,
    eyebrow,
    title,
    intro: intro ? esc(intro) : undefined,
    body: rows(fields) + fileLinks(files),
    cta: link ? { label: linkLabel, href: siteUrl(link) } : undefined,
  }),
})

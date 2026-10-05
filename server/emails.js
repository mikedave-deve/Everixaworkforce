import { getConfig } from './config.js'

/* Everixa email design: ink header with the framed italic wordmark, ivory page, brass accent. */
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

export function layout({ preheader = '', eyebrow, title, intro, body = '', cta }) {
  const cfg = getConfig()
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.ivory}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory}"><tr><td align="center" style="padding:32px 14px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">
    <tr><td style="background:${C.ink};padding:34px 36px 30px;border-radius:2px 2px 0 0">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border:1px solid rgba(250,247,241,.75);padding:9px 18px;font:italic 600 22px ${serif};letter-spacing:.07em;color:${C.ivory}">EVERIXA</td></tr></table>
      <div style="margin-top:14px;font:600 10px ${sans};letter-spacing:.24em;text-transform:uppercase;color:${C.brassLight}">Workforce</div>
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
      <div style="font:400 12px/1.7 ${sans};color:rgba(250,247,241,.65)">
        Everixa Workforce · Staffing &amp; Recruitment since 2006<br>
        1200 Forest Way, Suite 400, Austin TX 78701 · (863) 243-3789<br>
        ${cfg.mail.address ? esc(cfg.mail.address) : ''}
      </div>
    </td></tr>
  </table>
</td></tr></table></body></html>`
}

const appUrl = (p = '') => `${getConfig().frontendBase}${p}`

/* ── Account lifecycle ─────────────────────────────────────────── */
export const accountPending = (u) => ({
  subject: 'We received your Everixa account request',
  html: layout({
    preheader: 'Your account is awaiting approval.',
    eyebrow: 'Employee Portal',
    title: `Thanks, ${u.firstName}. We have your request.`,
    intro: 'Your Everixa Workforce account has been created and is waiting for approval. Our team reviews every request personally — you will receive another email as soon as it has been approved.',
    body: rows([['Name', `${u.firstName} ${u.lastName}`], ['Email', u.email], ['Status', 'Awaiting approval']]),
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
  }),
})

export const passwordReset = (u, link) => ({
  subject: 'Reset your Everixa password',
  html: layout({
    preheader: 'Use this link to choose a new password.',
    eyebrow: 'Password reset',
    title: 'Choose a new password.',
    intro: `Hi ${esc(u.firstName)}, we received a request to reset your password. This link works for one hour. If you did not ask for this, you can safely ignore this email.`,
    cta: { label: 'Reset password', href: link },
  }),
})

/* ── Notifications to the company inbox ────────────────────────── */
export const adminNotice = ({ eyebrow, title, intro, fields, link, linkLabel = 'Open in admin portal' }) => ({
  subject: `${eyebrow}: ${title}`,
  html: layout({
    preheader: title,
    eyebrow,
    title,
    intro: intro ? esc(intro) : undefined,
    body: rows(fields),
    cta: link ? { label: linkLabel, href: appUrl(link) } : undefined,
  }),
})

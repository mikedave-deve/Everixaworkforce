import { HttpError } from './http.js'

/**
 * Central configuration. Read lazily so tests and the dev server can set env first.
 * Variables follow the project's .env arrangement.
 */
const list = (v) =>
  String(v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const clean = (v) => String(v ?? '').trim().replace(/,+$/, '')

function databaseFromUri(uri) {
  try {
    return decodeURIComponent(new URL(uri).pathname.replace(/^\//, ''))
  } catch {
    return ''
  }
}

export function getConfig() {
  const env = process.env
  // Vercel sets VERCEL=1 on every deployment, whatever NODE_ENV was copied into its settings.
  const onVercel = Boolean(env.VERCEL)
  const isProd = env.NODE_ENV === 'production' || onVercel
  const notify = clean(env.COMPANY_NOTIFY_EMAIL)
  const origins = list(env.FRONTEND_ORIGIN)
  const isLocalUrl = (u) => /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(u ?? '')
  // On Vercel, FRONTEND_ORIGIN left as localhost would put dead links in emails — use the deployment URL instead.
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL
  const deployed = onVercel && vercelHost ? `https://${vercelHost}` : null
  const frontendBase = deployed && (!origins[0] || isLocalUrl(origins[0])) ? deployed : origins[0] ?? 'http://localhost:5173'

  return {
    isProd,
    port: Number(env.PORT) || 4000,
    mongoUri: clean(env.MONGODB_URI),
    // MONGODB_DB wins; otherwise the database named in the connection string; otherwise "everixa".
    dbName: clean(env.MONGODB_DB) || databaseFromUri(clean(env.MONGODB_URI)) || 'everixa',
    jwtSecret: clean(env.JWT_SECRET),
    jwtDays: Number(env.JWT_EXPIRES_IN_DAYS) || 7,
    jwtDaysRemember: Number(env.JWT_EXPIRES_IN_DAYS_REMEMBER) || 30,
    origins,
    frontendBase: frontendBase.replace(/\/$/, ''),
    // A localhost FRONTEND_LOGIN_URL left over in production would put a dead link in approval emails.
    loginUrl:
      clean(env.FRONTEND_LOGIN_URL) && !(deployed && isLocalUrl(clean(env.FRONTEND_LOGIN_URL)))
        ? clean(env.FRONTEND_LOGIN_URL)
        : `${frontendBase.replace(/\/$/, '')}/login`,
    mail: {
      token: clean(env.HOSTINGER_API_TOKEN),
      address: clean(env.HOSTINGER_MAILBOX_ADDRESS),
      displayName: clean(env.EMAIL_DISPLAY_NAME) || 'Everixa Workforce',
      notify,
      apiBase: clean(env.HOSTINGER_API_BASE) || 'https://api.mail.hostinger.com',
    },
    blobToken: clean(env.BLOB_READ_WRITE_TOKEN),
    admin: {
      // ADMIN_EMAIL → a valid COMPANY_NOTIFY_EMAIL → the Hostinger mailbox address.
      email: (clean(env.ADMIN_EMAIL) || (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(notify) ? notify : clean(env.HOSTINGER_MAILBOX_ADDRESS))).toLowerCase(),
      password: clean(env.ADMIN_PASSWORD),
    },
  }
}

export function assertConfig() {
  const c = getConfig()
  if (!c.jwtSecret || c.jwtSecret.length < 16) {
    console.error('[config] JWT_SECRET is missing or shorter than 16 characters.')
    throw new HttpError(503, 'The site is not fully configured yet (sign-in key). Please contact the site owner.')
  }
  return c
}

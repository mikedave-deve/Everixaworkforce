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

export function getConfig() {
  const env = process.env
  const isProd = env.NODE_ENV === 'production'
  const notify = clean(env.COMPANY_NOTIFY_EMAIL)
  const origins = list(env.FRONTEND_ORIGIN)
  const frontendBase = origins[0] ?? 'http://localhost:5173'

  return {
    isProd,
    port: Number(env.PORT) || 4000,
    mongoUri: clean(env.MONGODB_URI),
    dbName: clean(env.MONGODB_DB) || 'everixa',
    jwtSecret: clean(env.JWT_SECRET),
    jwtDays: Number(env.JWT_EXPIRES_IN_DAYS) || 7,
    jwtDaysRemember: Number(env.JWT_EXPIRES_IN_DAYS_REMEMBER) || 30,
    origins,
    frontendBase: frontendBase.replace(/\/$/, ''),
    loginUrl: clean(env.FRONTEND_LOGIN_URL) || `${frontendBase.replace(/\/$/, '')}/login`,
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
    throw new Error('JWT_SECRET must be set (16+ characters).')
  }
  return c
}

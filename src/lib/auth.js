const USERS_KEY   = 'everixa_portal_users'
const SESSION_KEY = 'everixa_portal_session'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Demo-only credential store: passwords sit in localStorage as plain text
// because there is no backend yet. Do not carry this pattern into the real API.
export function seedDemoAccount() {
  const users = readUsers()
  if (users.some(u => u.email === 'demo@everixaworkforce.com')) return

  users.push({
    id: 'demo-user',
    name: 'Jordan Blake',
    firstName: 'Jordan',
    lastName: 'Blake',
    phone: '(503) 555-0148',
    employeeId: 'EW-204817',
    email: 'demo@everixaworkforce.com',
    password: 'demo1234',
    role: 'Field Coordinator',
    startDate: '2023-03-06',
  })
  writeUsers(users)
}

export function signup({ firstName, lastName, phone, email, password }) {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some(u => u.email === normalizedEmail)) {
    throw new Error('An account with that email already exists.')
  }

  const first = firstName.trim()
  const last = lastName.trim()
  const user = {
    id: `user-${Date.now()}`,
    name: `${first} ${last}`,
    firstName: first,
    lastName: last,
    phone: phone.trim(),
    email: normalizedEmail,
    password,
    role: 'Team Member',
    employeeId: `EW-${Math.floor(100000 + Math.random() * 900000)}`,
    startDate: new Date().toISOString().slice(0, 10),
  }

  users.push(user)
  writeUsers(users)
  setSession(user)
  return user
}

export function login(email, password) {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find(u => u.email === normalizedEmail && u.password === password)

  if (!user) {
    throw new Error('Incorrect email or password.')
  }

  setSession(user)
  return user
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function setSession(user) {
  const { password: _password, ...safeUser } = user
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
}

export function updateProfile(updates) {
  const session = getSession()
  if (!session) return null

  const users = readUsers()
  const idx = users.findIndex(u => u.id === session.id)
  if (idx === -1) return null

  users[idx] = { ...users[idx], ...updates }
  writeUsers(users)
  setSession(users[idx])
  return users[idx]
}

// Verifies the current password before changing it (demo store only).
export function changePassword(currentPassword, nextPassword) {
  const session = getSession()
  if (!session) throw new Error('You are signed out.')
  const users = readUsers()
  const idx = users.findIndex(u => u.id === session.id)
  if (idx === -1 || users[idx].password !== currentPassword) throw new Error('Current password is incorrect.')
  users[idx] = { ...users[idx], password: nextPassword }
  writeUsers(users)
}

// Always resolves the same way regardless of whether the email exists,
// so the flow can't be used to enumerate registered accounts.
export async function requestPasswordReset(_email) {
  await new Promise(resolve => setTimeout(resolve, 600))
  return { success: true }
}

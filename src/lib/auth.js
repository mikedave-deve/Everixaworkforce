import { api, clearSession, getToken, saveSession, storedUser, updateStoredUser } from './api'

/** Synchronous view of the signed-in user (cached from the last API response). */
export function getSession() {
  return getToken() ? storedUser() : null
}

export const isAdmin = (u = getSession()) => u?.role === 'admin'
export const homeFor = (u) => (u?.role === 'admin' ? '/admin' : '/portal')

export async function login({ email, password, remember }) {
  const { token, user } = await api.post('/auth/login', { email, password, remember: Boolean(remember) }, { auth: false })
  saveSession(token, user, Boolean(remember))
  return user
}

/** Creates an account request. The account stays pending until an admin approves it. */
export function signup(form) {
  return api.post('/auth/signup', form, { auth: false })
}

export async function logout() {
  try {
    if (getToken()) await api.post('/auth/logout')
  } catch {
    /* already signed out */
  }
  clearSession()
}

export async function refreshUser() {
  const { user } = await api.get('/auth/me')
  updateStoredUser(user)
  return user
}

export function setStoredUser(user) {
  updateStoredUser(user)
  window.dispatchEvent(new CustomEvent('everixa:user-updated'))
}

export const requestPasswordReset = (email) => api.post('/auth/forgot', { email }, { auth: false })
export const resetPassword = (token, password) => api.post('/auth/reset', { token, password }, { auth: false })

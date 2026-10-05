import { useCallback, useEffect, useRef, useState } from 'react'
import { getSession } from './auth'

/**
 * Per-employee portal data, persisted in localStorage under the signed-in user's id.
 * Demo-only: there is no backend yet, so nothing here leaves the browser.
 */
const PREFIX = 'everixa_portal_data'
const EVENT = 'everixa:portal-change'

function storageKey(key) {
  const id = getSession()?.id ?? 'anon'
  return `${PREFIX}:${id}:${key}`
}

export function readPortal(key, fallback) {
  try {
    const raw = localStorage.getItem(storageKey(key))
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writePortal(key, value) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    /* storage full or blocked — state still updates in memory for this session */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

/** useState-like hook that persists and stays in sync across components. */
export function usePortalState(key, initial) {
  const [value, setValue] = useState(() => readPortal(key, initial))
  const initialRef = useRef(initial)
  useEffect(() => { initialRef.current = initial })

  useEffect(() => {
    const onChange = (e) => {
      if (e.detail === key) setValue(readPortal(key, initialRef.current))
    }
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [key])

  const update = useCallback(
    (next) => {
      const current = readPortal(key, initialRef.current)
      writePortal(key, typeof next === 'function' ? next(current) : next)
    },
    [key]
  )

  return [value, update]
}

/** Appends an entry to the employee's activity history. */
export function logActivity(type, title, detail = '') {
  const list = readPortal('activity', [])
  writePortal('activity', [
    { id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, title, detail, at: new Date().toISOString() },
    ...list,
  ].slice(0, 200))
}

export function downloadText(filename, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function fmtDate(d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  // Date-only strings would parse as UTC midnight and render a day early in US time zones.
  const date = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00`) : new Date(d)
  return date.toLocaleDateString('en-US', opts)
}

export function isoDay(d = new Date()) {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Monday of the week containing d. */
export function weekStart(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const diff = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - diff)
  return x
}

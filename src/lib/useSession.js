import { useEffect, useState } from 'react'
import { getSession } from './auth'

/** The signed-in user, kept in sync when the profile changes elsewhere in the app. */
export function useSession() {
  const [session, setSession] = useState(getSession)
  useEffect(() => {
    const sync = () => setSession(getSession())
    window.addEventListener('everixa:user-updated', sync)
    window.addEventListener('everixa:signed-out', sync)
    return () => {
      window.removeEventListener('everixa:user-updated', sync)
      window.removeEventListener('everixa:signed-out', sync)
    }
  }, [])
  return session
}

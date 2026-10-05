import { Navigate, useLocation } from 'react-router-dom'
import { getSession, homeFor } from '../lib/auth'

/** Gate for the employee portal (role="employee") and admin portal (role="admin"). */
export default function RequireAuth({ children, role = 'employee' }) {
  const location = useLocation()
  const session = getSession()

  if (!session) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />
  }
  // An administrator opening /portal (or an employee opening /admin) goes to their own home.
  if (session.role !== role) return <Navigate to={homeFor(session)} replace />

  return children
}

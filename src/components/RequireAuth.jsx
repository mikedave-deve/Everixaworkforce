import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../lib/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const session = getSession()

  if (!session) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}

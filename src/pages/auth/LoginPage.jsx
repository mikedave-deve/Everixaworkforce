import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import { login } from '../../lib/auth'

const inputClass = [
  'w-full pl-10 pr-4 py-3 text-sm font-body',
  'border border-forest-200 rounded-sm',
  'bg-forest-50 text-forest-900 placeholder-forest-400',
  'focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent',
  'transition-all duration-200',
].join(' ')

const labelClass = 'block font-body text-xs font-medium text-forest-700 mb-1.5 tracking-wide'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      login(email, password)
      const from = new URLSearchParams(location.search).get('from') || '/portal'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Employee Portal"
      title="Welcome back"
      subtitle="Sign in to view your schedule, documents, and recognition."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <input
              id="email" type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass} placeholder="you@everixaworkforce.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="font-body text-xs font-medium text-forest-700 tracking-wide">Password</label>
            <Link to="/forgot-password" className="font-body text-xs text-forest-600 hover:text-forest-800 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <input
              id="password" type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass} placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-sm">
            <span className="text-red-500 text-sm shrink-0 mt-0.5">!</span>
            <p className="font-body text-sm text-red-700">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm py-3.5 disabled:opacity-60">
          {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>

        <div className="p-3.5 bg-forest-50 border border-forest-100 rounded-sm">
          <p className="font-body text-xs text-forest-600 leading-relaxed">
            Demo account: <span className="font-semibold text-forest-800">demo@everixaworkforce.com</span> / <span className="font-semibold text-forest-800">demo1234</span>
          </p>
        </div>

        <p className="font-body text-sm text-center text-forest-600">
          New employee?{' '}
          <Link to="/signup" className="font-medium text-forest-800 hover:text-forest-900 underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

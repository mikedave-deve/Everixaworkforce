import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import { signup } from '../../lib/auth'

const inputClass = [
  'w-full pl-10 pr-4 py-3 text-sm font-body',
  'border border-forest-200 rounded-sm',
  'bg-forest-50 text-forest-900 placeholder-forest-400',
  'focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent',
  'transition-all duration-200',
].join(' ')

const labelClass = 'block font-body text-xs font-medium text-forest-700 mb-1.5 tracking-wide'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      signup({ name, email, password })
      navigate('/portal', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Employee Portal"
      title="Create your account"
      subtitle="Set up portal access to view your schedule, documents, and pay information."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className={labelClass}>Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <input
              id="name" type="text" required value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass} placeholder="Jane Smith"
            />
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
              <input
                id="password" type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass} placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className={labelClass}>Confirm</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
              <input
                id="confirm" type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={inputClass} placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-sm">
            <span className="text-red-500 text-sm shrink-0 mt-0.5">!</span>
            <p className="font-body text-sm text-red-700">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm py-3.5 disabled:opacity-60">
          {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
        </button>

        <p className="font-body text-sm text-center text-forest-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-forest-800 hover:text-forest-900 underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

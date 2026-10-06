import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import PasswordInput from '../../components/PasswordInput'
import { homeFor, login } from '../../lib/auth'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const justReset = new URLSearchParams(location.search).get('reset') === '1'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(false)
    setLoading(true)
    try {
      const user = await login({ email, password, remember })
      const from = new URLSearchParams(location.search).get('from')
      // Never send an employee into the admin area (or vice-versa) through a stale ?from= link.
      const target = from && from.startsWith(user.role === 'admin' ? '/admin' : '/portal') ? from : homeFor(user)
      navigate(target, { replace: true })
    } catch (err) {
      setPending(err.code === 'pending')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout eyebrow="Employee Portal" title="Welcome back" subtitle="Sign in to view your missions, pay, time sheet and documents.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <div className="relative">
            <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field pl-11" placeholder="you@email.com" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Password</label>
            <Link to="/forgot-password" className="text-[12px] text-ink-600 underline decoration-ink-300 underline-offset-4 hover:text-ink-900">Forgot password?</Link>
          </div>
          <PasswordInput id="password" icon={Lock} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-[14px] text-ink-700">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-ink-800" />
          Keep me signed in
        </label>

        {justReset && !error && (
          <div role="status" className="border border-emerald-300 bg-emerald-50 p-3.5 text-[14px] text-emerald-900">Your password was changed. Sign in with your new password.</div>
        )}

        {error && (
          <div role="alert" className={`border p-3.5 text-[14px] ${pending ? 'border-brass-400 bg-brass-300/20 text-ink-900' : 'border-red-300 bg-red-50 text-red-800'}`}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="pt-2 text-center text-[14px] text-ink-600">
          New employee?{' '}
          <Link to="/signup" className="font-medium text-ink-800 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

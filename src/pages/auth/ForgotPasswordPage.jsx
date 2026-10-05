import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import { requestPasswordReset } from '../../lib/auth'

const inputClass = 'field pl-11'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="Employee Portal" title="Check your email">
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 bg-ink-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 className="w-7 h-7 text-ink-600" />
          </div>
          <p className="font-body text-sm text-ink-700/70 leading-relaxed mb-8">
            If an account exists for <span className="font-semibold text-ink-800">{email}</span>,
            a password reset link is on its way.
          </p>
          <Link to="/login" className="btn-outline text-sm w-full justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Employee Portal"
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send a link to reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              id="email" type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass} placeholder="you@email.com"
            />
          </div>
        </div>

        {error && <div role="alert" className="border border-red-300 bg-red-50 p-3.5 text-[14px] text-red-800">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm py-3.5 disabled:opacity-60">
          {loading ? 'Sending...' : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
        </button>

        <p className="font-body text-sm text-center text-ink-600">
          <Link to="/login" className="font-medium text-ink-800 hover:text-ink-900 underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

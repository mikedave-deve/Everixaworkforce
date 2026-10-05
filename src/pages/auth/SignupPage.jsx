import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Phone, ArrowRight, Loader2, MailCheck } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import { signup } from '../../lib/auth'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

function IconField({ id, label, icon: Icon, ...input }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input id={id} required className="field pl-11" {...input} />
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirm: '', website: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.phone.replace(/\D/g, '').length < 10) return setError('Enter a valid 10-digit phone number.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const { confirm: _confirm, ...payload } = form
      await signup(payload)
      setDone(form.email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthLayout eyebrow="Request received" title="Check your email." subtitle="">
        <div role="status" className="-mt-4">
          <MailCheck className="mb-5 h-10 w-10 text-brass-600" strokeWidth={1.4} />
          <p className="text-[15px] leading-relaxed text-ink-800">
            We sent a confirmation to <strong className="font-semibold">{done}</strong>. Your account is now waiting for approval — our team reviews every request, and we'll email you as soon as it's approved so you can sign in.
          </p>
          <Link to="/login" className="btn-outline mt-8">Back to sign in</Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Employee Portal" title="Create your account" subtitle="Request portal access. We'll email you once your account is approved.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <IconField id="firstName" label="First Name" icon={User} type="text" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} placeholder="Jane" />
          <IconField id="lastName" label="Last Name" icon={User} type="text" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} placeholder="Smith" />
        </div>
        <IconField id="phone" label="Phone" icon={Phone} type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 123-4567" />
        <IconField id="email" label="Email" icon={Mail} type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
        <IconField id="password" label="Password" icon={Lock} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
        <IconField id="confirm" label="Confirm Password" icon={Lock} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" />

        {/* Honeypot: real people never see or fill this */}
        <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

        {error && <div role="alert" className="border border-red-300 bg-red-50 p-3.5 text-[14px] text-red-800">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-[14px] text-ink-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink-800 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

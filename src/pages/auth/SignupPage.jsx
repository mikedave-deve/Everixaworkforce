import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react'
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
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit phone number.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      signup(form)
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <IconField id="firstName" label="First Name" icon={User} type="text" autoComplete="given-name"
                     value={form.firstName} onChange={set('firstName')} placeholder="Jane" />
          <IconField id="lastName" label="Last Name" icon={User} type="text" autoComplete="family-name"
                     value={form.lastName} onChange={set('lastName')} placeholder="Smith" />
        </div>

        <IconField id="phone" label="Phone" icon={Phone} type="tel" autoComplete="tel"
                   value={form.phone} onChange={set('phone')} placeholder="(555) 123-4567" />
        <IconField id="email" label="Email" icon={Mail} type="email" autoComplete="email"
                   value={form.email} onChange={set('email')} placeholder="you@email.com" />
        <IconField id="password" label="Password" icon={Lock} type="password" autoComplete="new-password"
                   value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
        <IconField id="confirm" label="Confirm Password" icon={Lock} type="password" autoComplete="new-password"
                   value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" />

        {error && (
          <div role="alert" className="border border-red-300 bg-red-50 p-3.5">
            <p className="text-[14px] text-red-800">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : <>Create Account <ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="text-center text-[14px] text-ink-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink-800 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

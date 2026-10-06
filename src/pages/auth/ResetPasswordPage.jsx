import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import AuthLayout from '../../layout/AuthLayout'
import PasswordInput from '../../components/PasswordInput'
import { resetPassword } from '../../lib/auth'

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await resetPassword(token, password)
      navigate('/login?reset=1', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout eyebrow="Employee Portal" title="Link not valid" subtitle="This reset link is missing or incomplete.">
        <Link to="/forgot-password" className="btn-primary">Request a new link</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Employee Portal" title="Choose a new password" subtitle="Pick something at least 8 characters long.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {[['password', 'New password', password, setPassword], ['confirm', 'Confirm password', confirm, setConfirm]].map(([id, label, value, set]) => (
          <div key={id}>
            <label htmlFor={id} className={labelClass}>{label}</label>
            <PasswordInput id={id} icon={Lock} required autoComplete="new-password" value={value} onChange={(e) => set(e.target.value)} />
          </div>
        ))}
        {error && <div role="alert" className="border border-red-300 bg-red-50 p-3.5 text-[14px] text-red-800">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <>Update password <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </AuthLayout>
  )
}

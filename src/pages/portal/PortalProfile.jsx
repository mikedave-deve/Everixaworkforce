import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Laptop, Smartphone } from 'lucide-react'
import { PageHead, Panel, Field, Pill, useToast } from '../../components/portal/ui'
import { changePassword, getSession, logout, updateProfile } from '../../lib/auth'
import { fmtDate, logActivity, usePortalState } from '../../lib/portalStore'

export default function PortalProfile() {
  const notify = useToast()
  const navigate = useNavigate()
  const session = getSession()
  const [profile, setProfile] = useState({ firstName: session?.firstName ?? session?.name?.split(' ')[0] ?? '', lastName: session?.lastName ?? session?.name?.split(' ').slice(1).join(' ') ?? '', phone: session?.phone ?? '' })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [profError, setProfError] = useState('')
  const [security, setSecurity] = usePortalState('security', { twoStep: false })

  const set = (setter) => (k) => (e) => setter((s) => ({ ...s, [k]: e.target.value }))

  function saveProfile(e) {
    e.preventDefault()
    setProfError('')
    if (!profile.firstName.trim() || !profile.lastName.trim()) return setProfError('First and last name are required.')
    if (profile.phone.replace(/\D/g, '').length < 10) return setProfError('Enter a valid 10-digit phone number.')
    updateProfile({ ...profile, name: `${profile.firstName.trim()} ${profile.lastName.trim()}` })
    logActivity('setup', 'Profile updated')
    notify('Profile updated.')
  }

  function savePassword(e) {
    e.preventDefault()
    setPwError('')
    if (pw.next.length < 8) return setPwError('New password must be at least 8 characters.')
    if (pw.next !== pw.confirm) return setPwError('New passwords do not match.')
    try {
      changePassword(pw.current, pw.next)
      logActivity('security', 'Password changed')
      notify('Password changed.')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err.message)
    }
  }

  function toggle2fa() {
    const next = !security.twoStep
    setSecurity({ ...security, twoStep: next })
    logActivity('security', next ? 'Two-step verification turned on' : 'Two-step verification turned off')
    notify(next ? 'Two-step verification is on.' : 'Two-step verification is off.')
  }

  const mobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  const DeviceIcon = mobile ? Smartphone : Laptop

  return (
    <div>
      <PageHead
        eyebrow="Profile & Security"
        title="Your account."
        description="Keep your details current and your account protected."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile" description={`Employee ID ${session?.employeeId ?? '—'} · ${session?.role} · started ${session?.startDate ? fmtDate(session.startDate) : '—'}`}>
          <form onSubmit={saveProfile} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="pf-first" label="First name"><input id="pf-first" className="field" value={profile.firstName} onChange={set(setProfile)('firstName')} autoComplete="given-name" /></Field>
              <Field id="pf-last" label="Last name"><input id="pf-last" className="field" value={profile.lastName} onChange={set(setProfile)('lastName')} autoComplete="family-name" /></Field>
            </div>
            <Field id="pf-phone" label="Phone"><input id="pf-phone" type="tel" className="field" value={profile.phone} onChange={set(setProfile)('phone')} autoComplete="tel" /></Field>
            <Field id="pf-email" label="Email" hint="Contact HR to change your sign-in email."><input id="pf-email" className="field !bg-ink-50 text-ink-600" value={session?.email ?? ''} disabled /></Field>
            {profError && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{profError}</p>}
            <button className="btn-primary">Save profile</button>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="Change password">
            <form onSubmit={savePassword} className="space-y-5" noValidate>
              <Field id="pw-cur" label="Current password"><input id="pw-cur" type="password" autoComplete="current-password" className="field" value={pw.current} onChange={set(setPw)('current')} /></Field>
              <Field id="pw-new" label="New password" hint="At least 8 characters."><input id="pw-new" type="password" autoComplete="new-password" className="field" value={pw.next} onChange={set(setPw)('next')} /></Field>
              <Field id="pw-conf" label="Confirm new password"><input id="pw-conf" type="password" autoComplete="new-password" className="field" value={pw.confirm} onChange={set(setPw)('confirm')} /></Field>
              {pwError && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{pwError}</p>}
              <button className="btn-outline">Update password</button>
            </form>
          </Panel>

          <Panel title="Two-step verification" description="Add a one-time code at sign-in for stronger protection.">
            <div className="flex items-center justify-between gap-4">
              <Pill tone={security.twoStep ? 'success' : 'neutral'}>{security.twoStep ? 'On' : 'Off'}</Pill>
              <button role="switch" aria-checked={security.twoStep} onClick={toggle2fa} className={`relative h-7 w-12 transition-colors ${security.twoStep ? 'bg-ink-800' : 'bg-ink-200'}`}>
                <span className={`absolute top-1 h-5 w-5 bg-white transition-all ${security.twoStep ? 'left-6' : 'left-1'}`} />
                <span className="sr-only">Two-step verification</span>
              </button>
            </div>
          </Panel>

          <Panel title="Active sessions">
            <div className="flex items-center gap-4">
              <DeviceIcon className="h-6 w-6 text-brass-600" strokeWidth={1.5} />
              <div className="flex-1"><p className="text-[15px] font-medium text-ink-900">This device</p><p className="text-[12px] text-ink-600">Signed in now</p></div>
              <Pill tone="success">Current</Pill>
            </div>
            <button className="link-arrow mt-5" onClick={() => { logout(); navigate('/login', { replace: true }) }}>Sign out</button>
          </Panel>
        </div>
      </div>
    </div>
  )
}

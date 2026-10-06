import { useState } from 'react'
import { Camera, Laptop, Smartphone, Loader2 } from 'lucide-react'
import PasswordInput from '../../components/PasswordInput'
import { PageHead, Panel, Field, Pill, Avatar, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { api, compressImage, useApi } from '../../lib/api'
import { setStoredUser } from '../../lib/auth'
import { useSession } from '../../lib/useSession'
import { fmtDate, fmtDateTime } from '../../lib/format'

function ProfileForm({ session }) {
  const notify = useToast()
  const [profile, setProfile] = useState({ firstName: session.firstName, lastName: session.lastName, phone: session.phone })
  const [error, setError] = useState('')
  const set = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }))

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { user } = await api.patch('/me', profile)
      setStoredUser(user)
      notify('Profile saved.')
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pf-first" label="First name"><input id="pf-first" className="field" value={profile.firstName} onChange={set('firstName')} autoComplete="given-name" /></Field>
        <Field id="pf-last" label="Last name"><input id="pf-last" className="field" value={profile.lastName} onChange={set('lastName')} autoComplete="family-name" /></Field>
      </div>
      <Field id="pf-phone" label="Phone"><input id="pf-phone" type="tel" className="field" value={profile.phone} onChange={set('phone')} autoComplete="tel" /></Field>
      <Field id="pf-email" label="Email" hint="Contact HR to change your sign-in email."><input id="pf-email" className="field !bg-ink-50 text-ink-600" value={session.email} disabled /></Field>
      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
    </form>
  )
}

function PasswordForm() {
  const notify = useToast()
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }))

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    if (pw.next !== pw.confirm) return setError('The new passwords do not match.')
    try {
      await api.post('/me/password', { current: pw.current, next: pw.next })
      notify('Password updated.')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <Field id="pw-cur" label="Current password"><PasswordInput id="pw-cur" autoComplete="current-password" value={pw.current} onChange={set('current')} /></Field>
      <Field id="pw-new" label="New password" hint="At least 8 characters."><PasswordInput id="pw-new" autoComplete="new-password" value={pw.next} onChange={set('next')} /></Field>
      <Field id="pw-conf" label="Confirm new password"><PasswordInput id="pw-conf" autoComplete="new-password" value={pw.confirm} onChange={set('confirm')} /></Field>
      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary" disabled={saving}>{saving ? 'Updating…' : 'Update password'}</button>
    </form>
  )
}

export default function PortalProfile() {
  const notify = useToast()
  const session = useSession()
  const sessions = useApi('/me/sessions')
  const [uploading, setUploading] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0)

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const small = await compressImage(file, { max: 600, quality: 0.85 })
      const { user } = await api.upload('/me/avatar', small)
      setStoredUser(user)
      setAvatarKey((k) => k + 1)
      notify('Profile photo updated.')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const [revoke] = useAction(async (id) => {
    await api.del(`/me/sessions/${id}`)
    notify('Session signed out.')
    sessions.reload()
  })
  const [revokeOthers] = useAction(async () => {
    await api.post('/me/sessions/revoke-others')
    notify('Signed out of all other devices.')
    sessions.reload()
  })

  if (!session) return <Loading />

  return (
    <div>
      <PageHead eyebrow="Profile & Security" title="Your account." description="Keep your details current and your account protected." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel title="Profile photo">
            <div className="flex items-center gap-5">
              <Avatar key={`${session.avatarFileId}-${avatarKey}`} user={session} size={88} />
              <div>
                <label className="btn-outline cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brass-600 has-[:focus-visible]:ring-offset-2">
                  {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><Camera size={16} /> {session.avatarFileId ? 'Change photo' : 'Upload photo'}</>}
                  <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} disabled={uploading} />
                </label>
                <p className="mt-2 text-[12px] text-ink-600">JPG, PNG or WebP.</p>
              </div>
            </div>
          </Panel>

          <Panel title="Profile" description={`Employee ID ${session.employeeId} · ${session.position} · started ${fmtDate(session.startDate)}`}>
            <ProfileForm session={session} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Change password"><PasswordForm /></Panel>

          <Panel title="Active sessions" description="Devices currently signed in to your account.">
            {sessions.loading ? <Loading /> : sessions.error ? <ErrorState error={sessions.error} onRetry={sessions.reload} /> : (
              <>
                <ul className="divide-y divide-ink-900/10">
                  {sessions.data.sessions.map((s) => {
                    const Icon = /Android|iOS/.test(s.device) ? Smartphone : Laptop
                    return (
                      <li key={s.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <Icon className="h-6 w-6 shrink-0 text-brass-600" strokeWidth={1.5} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-medium text-ink-900">{s.device}</p>
                          <p className="text-[12px] text-ink-600">{s.current ? 'Active now' : `Last active ${fmtDateTime(s.lastSeenAt)}`}</p>
                        </div>
                        {s.current ? <Pill tone="success">This device</Pill> : <button onClick={() => revoke(s.id)} className="link-arrow !text-[11px]">Sign out</button>}
                      </li>
                    )
                  })}
                </ul>
                {sessions.data.sessions.length > 1 && <button onClick={revokeOthers} className="link-arrow mt-5">Sign out all other devices</button>}
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

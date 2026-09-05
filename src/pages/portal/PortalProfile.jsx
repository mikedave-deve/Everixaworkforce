import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { getSession, updateProfile } from '../../lib/auth'

const inputClass = [
  'w-full px-4 py-3 text-sm font-body',
  'border border-forest-200 rounded-sm',
  'bg-forest-50 text-forest-900 placeholder-forest-400',
  'focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent',
  'transition-all duration-200',
].join(' ')

const labelClass = 'block font-body text-xs font-medium text-forest-700 mb-1.5 tracking-wide'

function initials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export default function PortalProfile() {
  const session = getSession()
  const [name, setName]   = useState(session?.name ?? '')
  const [email, setEmail] = useState(session?.email ?? '')
  const [phone, setPhone] = useState(session?.phone ?? '')
  const [saved, setSaved] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError]     = useState('')
  const [pwSaved, setPwSaved]     = useState(false)

  function handleProfileSubmit(e) {
    e.preventDefault()
    updateProfile({ name, email, phone })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwError('')

    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.')
      return
    }

    updateProfile({ password: newPw })
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2500)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="section-label mb-2">Profile</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
          Account Settings
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-8 bg-white border border-forest-100 rounded-sm p-6">
        <div className="w-16 h-16 rounded-full bg-forest-700 flex items-center justify-center shrink-0">
          <span className="font-display text-xl font-bold text-white">{initials(session?.name)}</span>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-forest-900">{session?.name}</p>
          <p className="font-body text-sm text-forest-500">{session?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-forest-100 rounded-sm p-7">
          <p className="section-label mb-5">Personal Information</p>
          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className={labelClass}>Full Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="(555) 000-0000" />
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-forest-700 text-sm font-body">
                <CheckCircle2 className="w-4 h-4" /> Profile updated
              </div>
            )}

            <button type="submit" className="btn-primary text-sm py-3">Save Changes</button>
          </form>
        </div>

        <div className="bg-white border border-forest-100 rounded-sm p-7">
          <p className="section-label mb-5">Change Password</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="currentPw" className={labelClass}>Current Password</label>
              <input id="currentPw" type="password" required value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="newPw" className={labelClass}>New Password</label>
              <input id="newPw" type="password" required value={newPw} onChange={e => setNewPw(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirmPw" className={labelClass}>Confirm New Password</label>
              <input id="confirmPw" type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={inputClass} />
            </div>

            {pwError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-sm">
                <span className="text-red-500 text-sm shrink-0 mt-0.5">!</span>
                <p className="font-body text-sm text-red-700">{pwError}</p>
              </div>
            )}
            {pwSaved && (
              <div className="flex items-center gap-2 text-forest-700 text-sm font-body">
                <CheckCircle2 className="w-4 h-4" /> Password updated
              </div>
            )}

            <button type="submit" className="btn-outline text-sm py-3">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHead, Panel, Field, ProgressBar, useToast } from '../../components/portal/ui'
import { getSession } from '../../lib/auth'
import { logActivity, usePortalState } from '../../lib/portalStore'
import { cn } from '../../lib/utils'

const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ')

const STEPS = [
  { id: 'personal', label: 'Personal details', desc: 'How we should address and reach you.' },
  { id: 'emergency', label: 'Emergency contact', desc: 'Someone we can call if something happens at work.' },
  { id: 'address', label: 'Home address', desc: 'Used for payroll tax and mailing tax documents.' },
  { id: 'deposit', label: 'Direct deposit', desc: 'Where your pay is sent every other Friday.' },
  { id: 'preferences', label: 'Notifications', desc: 'Choose how you hear about shifts and pay.' },
]

// ABA routing-number checksum
function validRouting(n) {
  if (!/^\d{9}$/.test(n)) return false
  const d = n.split('').map(Number)
  return (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8])) % 10 === 0
}

export default function PortalSetup() {
  const notify = useToast()
  const session = getSession()
  const [setup, setSetup] = usePortalState('setup', {})
  const firstOpen = STEPS.find((s) => !setup[s.id])?.id ?? STEPS[0].id
  const [active, setActive] = useState(firstOpen)
  const [error, setError] = useState('')
  const data = setup.data ?? {}

  const done = STEPS.filter((s) => setup[s.id]).length
  const step = STEPS.find((s) => s.id === active)

  function save(id, values) {
    setSetup((cur) => ({ ...cur, [id]: true, data: { ...(cur.data ?? {}), ...values } }))
    logActivity('setup', `${STEPS.find((s) => s.id === id).label} saved`)
    notify(`${STEPS.find((s) => s.id === id).label} saved.`)
    const next = STEPS.find((s) => s.id !== id && !setup[s.id])
    if (next) setActive(next.id)
    setError('')
  }

  function onSubmit(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    if (active === 'deposit') {
      if (!validRouting(f.routing)) return setError('That routing number is not valid. Check the 9 digits on your check or banking app.')
      if (!/^\d{4,17}$/.test(f.account)) return setError('Account number must be 4–17 digits.')
      if (f.account !== f.account2) return setError('Account numbers do not match.')
      // Only masked details are kept — full numbers are never stored by this demo.
      const deposit = { bank: f.bank, accountType: f.accountType, accountLast4: f.account.slice(-4), routingLast4: f.routing.slice(-4) }
      return save('deposit', { deposit, accountLast4: deposit.accountLast4 })
    }
    if (active === 'preferences') {
      return save('preferences', { preferences: { email: f.email === 'on', sms: f.sms === 'on', shift: f.shift === 'on', pay: f.pay === 'on' } })
    }
    if (active === 'address' && !/^\d{5}(-\d{4})?$/.test(f.zip)) return setError('Enter a valid 5-digit ZIP code.')
    if (active === 'emergency' && f.phone.replace(/\D/g, '').length < 10) return setError('Enter a valid 10-digit phone number.')
    save(active, { [active]: f })
  }

  const v = (k) => data[active]?.[k] ?? ''
  const prefs = data.preferences ?? { email: true, sms: true, shift: true, pay: true }

  return (
    <div>
      <PageHead
        eyebrow="Information Setup"
        title="Finish setting up your file."
        description="Five short steps so payroll, HR and your supervisor have what they need. Your progress saves as you go."
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Panel>
          <p className="mb-3 text-[13px] text-ink-600">{done} of {STEPS.length} complete</p>
          <ProgressBar value={(done / STEPS.length) * 100} label="Setup progress" />
          <ol className="mt-5">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => { setActive(s.id); setError('') }}
                  aria-current={active === s.id ? 'step' : undefined}
                  className={cn('flex w-full items-center gap-3 border-l-2 py-3 pl-4 text-left text-[14px] transition-colors', active === s.id ? 'border-brass-500 font-semibold text-ink-900' : 'border-ink-100 text-ink-700 hover:border-ink-400')}
                >
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-semibold', setup[s.id] ? 'bg-ink-800 text-white' : 'border border-ink-900/25 text-ink-600')}>
                    {setup[s.id] ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel key={active} title={step.label} description={step.desc}>
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {active === 'personal' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="preferred" label="Preferred name"><input id="preferred" name="preferred" required className="field" defaultValue={v('preferred') || session?.firstName || ''} /></Field>
                <Field id="p-phone" label="Mobile phone"><input id="p-phone" name="phone" type="tel" required className="field" defaultValue={v('phone') || session?.phone || ''} /></Field>
                <Field id="language" label="Preferred language" className="sm:col-span-2">
                  <select id="language" name="language" className="field" defaultValue={v('language') || 'English'}>
                    {['English', 'Spanish', 'Chinese', 'Vietnamese', 'Tagalog', 'Arabic', 'Other'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {active === 'emergency' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="e-name" label="Full name"><input id="e-name" name="name" required className="field" defaultValue={v('name')} /></Field>
                <Field id="e-rel" label="Relationship"><input id="e-rel" name="relationship" required className="field" defaultValue={v('relationship')} placeholder="Spouse, parent, friend…" /></Field>
                <Field id="e-phone" label="Phone" className="sm:col-span-2"><input id="e-phone" name="phone" type="tel" required className="field" defaultValue={v('phone')} /></Field>
              </div>
            )}

            {active === 'address' && (
              <div className="grid gap-5 sm:grid-cols-6">
                <Field id="a-street" label="Street address" className="sm:col-span-6"><input id="a-street" name="street" required autoComplete="street-address" className="field" defaultValue={v('street')} /></Field>
                <Field id="a-city" label="City" className="sm:col-span-3"><input id="a-city" name="city" required autoComplete="address-level2" className="field" defaultValue={v('city')} /></Field>
                <Field id="a-state" label="State" className="sm:col-span-1">
                  <select id="a-state" name="state" required className="field" defaultValue={v('state') || 'OR'}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
                </Field>
                <Field id="a-zip" label="ZIP" className="sm:col-span-2"><input id="a-zip" name="zip" required inputMode="numeric" autoComplete="postal-code" className="field" defaultValue={v('zip')} /></Field>
              </div>
            )}

            {active === 'deposit' && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="d-bank" label="Bank name"><input id="d-bank" name="bank" required className="field" defaultValue={data.deposit?.bank ?? ''} /></Field>
                  <Field id="d-type" label="Account type"><select id="d-type" name="accountType" className="field" defaultValue={data.deposit?.accountType ?? 'Checking'}><option>Checking</option><option>Savings</option></select></Field>
                  <Field id="d-routing" label="Routing number" hint="9 digits, found on the bottom-left of a check."><input id="d-routing" name="routing" required inputMode="numeric" maxLength={9} autoComplete="off" className="field" /></Field>
                  <Field id="d-acct" label="Account number"><input id="d-acct" name="account" required inputMode="numeric" maxLength={17} autoComplete="off" className="field" /></Field>
                  <Field id="d-acct2" label="Confirm account number" className="sm:col-span-2"><input id="d-acct2" name="account2" required inputMode="numeric" maxLength={17} autoComplete="off" className="field" /></Field>
                </div>
                {data.deposit?.accountLast4 && <p className="text-[13px] text-ink-600">On file: {data.deposit.bank} ••••{data.deposit.accountLast4}. Enter new details above to replace it.</p>}
                <p className="text-[12px] leading-relaxed text-ink-600">For your security this demo keeps only the last four digits of your account on this device.</p>
              </>
            )}

            {active === 'preferences' && (
              <fieldset className="space-y-2">
                <legend className="sr-only">Notification preferences</legend>
                {[
                  ['email', 'Email notifications', 'Pay statements, document requests and policy updates.'],
                  ['sms', 'Text messages', 'Time-sensitive alerts like schedule changes.'],
                  ['shift', 'Shift & mission updates', 'When instructions or locations change.'],
                  ['pay', 'Payday reminders', 'The day before each direct deposit.'],
                ].map(([k, label, hint]) => (
                  <label key={k} className="flex cursor-pointer items-start gap-3 border border-ink-900/10 p-4 hover:border-ink-900/30">
                    <input type="checkbox" name={k} defaultChecked={prefs[k]} className="mt-1 h-4 w-4 accent-ink-800" />
                    <span><span className="block text-[15px] font-medium text-ink-900">{label}</span><span className="text-[13px] text-ink-600">{hint}</span></span>
                  </label>
                ))}
              </fieldset>
            )}

            {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
            <button className="btn-primary">{setup[active] ? 'Update' : 'Save & continue'}</button>
          </form>
        </Panel>
      </div>
    </div>
  )
}

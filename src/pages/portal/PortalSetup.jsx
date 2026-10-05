import { useEffect, useMemo, useState } from 'react'
import { PageHead, Panel, Field, ProgressBar, Loading, ErrorState, useToast } from '../../components/portal/ui'
import { api, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'

const FIELDS = ['firstName', 'lastName', 'phone', 'email', 'mailingAddress', 'accountHolder', 'bankName', 'accountNumber', 'routingNumber']

export default function PortalSetup() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/setup')
  const [form, setForm] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data && !form) setForm({ ...data.values, accountNumber: '', routingNumber: '' })
  }, [data, form])

  // Live completion: a bank number already on file counts even though the box is blank.
  const percent = useMemo(() => {
    if (!form || !data) return 0
    const filled = FIELDS.filter((k) => {
      if (k === 'accountNumber') return form.accountNumber.trim() || data.bank.onFile
      if (k === 'routingNumber') return form.routingNumber.trim() || data.bank.onFile
      return String(form[k] ?? '').trim()
    }).length
    return Math.round((filled / FIELDS.length) * 100)
  }, [form, data])

  if (loading || !form) return error ? <ErrorState error={error} onRetry={reload} /> : <Loading />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await api.post('/setup', form)
      notify('Information submitted. HR has been notified.')
      setForm((f) => ({ ...f, accountNumber: '', routingNumber: '' }))
      reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHead
        eyebrow="Information Setup"
        title="Finish setting up your file."
        description="Fill in your details once so payroll and HR have what they need. When you submit, it goes straight to HR."
      />

      <Panel className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Completion</span>
          <span className="font-num text-[2rem] leading-none text-ink-900" aria-live="polite">{percent}%</span>
        </div>
        <ProgressBar value={percent} label="Information setup completion" />
        <p className="mt-3 text-[13px] text-ink-600">
          {percent === 100 ? 'Everything is filled in.' : `${FIELDS.length - Math.round((percent / 100) * FIELDS.length)} field${FIELDS.length - Math.round((percent / 100) * FIELDS.length) === 1 ? '' : 's'} left.`}
          {data.submittedAt && ` Last submitted ${fmtDate(data.submittedAt)}.`}
        </p>
      </Panel>

      <form onSubmit={submit} noValidate>
        <Panel title="Your details" description="Contact information we hold on file.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="s-first" label="First name"><input id="s-first" className="field" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" /></Field>
            <Field id="s-last" label="Last name"><input id="s-last" className="field" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" /></Field>
            <Field id="s-phone" label="Phone"><input id="s-phone" type="tel" className="field" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
            <Field id="s-email" label="Email"><input id="s-email" type="email" className="field" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field id="s-addr" label="Mailing address" className="sm:col-span-2"><textarea id="s-addr" rows={2} className="field resize-none" value={form.mailingAddress} onChange={set('mailingAddress')} autoComplete="street-address" placeholder="Street, city, state, ZIP" /></Field>
          </div>
        </Panel>

        <Panel className="mt-6" title="Direct deposit" description="Where your pay is sent every other Friday.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="s-holder" label="Account holder name"><input id="s-holder" className="field" value={form.accountHolder} onChange={set('accountHolder')} autoComplete="off" /></Field>
            <Field id="s-bank" label="Bank name"><input id="s-bank" className="field" value={form.bankName} onChange={set('bankName')} autoComplete="off" /></Field>
            <Field id="s-acct" label="Account number" hint={data.bank.onFile ? `On file: ${data.bank.accountMasked}. Leave blank to keep it.` : undefined}>
              <input id="s-acct" className="field" inputMode="numeric" maxLength={17} value={form.accountNumber} onChange={set('accountNumber')} autoComplete="off" />
            </Field>
            <Field id="s-routing" label="Routing number" hint={data.bank.onFile ? `On file: ${data.bank.routingMasked}.` : '9 digits, bottom-left of a check.'}>
              <input id="s-routing" className="field" inputMode="numeric" maxLength={9} value={form.routingNumber} onChange={set('routingNumber')} autoComplete="off" />
            </Field>
          </div>
        </Panel>

        {formError && <p role="alert" className="mt-6 border border-red-300 bg-red-50 p-3.5 text-[14px] text-red-800">{formError}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button className="btn-primary" disabled={saving}>{saving ? 'Submitting…' : 'Submit to HR'}</button>
          <p className="text-[12px] text-ink-600">Your bank details are stored encrypted and shared only with HR and payroll.</p>
        </div>
      </form>
    </div>
  )
}

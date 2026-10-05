import { useState } from 'react'
import { PageHead, Panel, Pill, Field, ProgressBar, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { api, useApi } from '../../lib/api'
import { fmtDate, isoDay, cap } from '../../lib/format'

const TYPES = ['vacation', 'sick', 'personal']
const tone = { pending: 'brass', approved: 'success', cancelled: 'neutral', denied: 'danger' }

export default function PortalTimeOff() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/timeoff')
  const today = isoDay()
  const [form, setForm] = useState({ type: 'vacation', start: '', end: '', note: '' })
  const [formError, setFormError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [submit, submitting] = useAction(async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.start || !form.end) return setFormError('Choose a start and end date.')
    try {
      await api.post('/timeoff', form)
      notify('Request sent to HR for approval.')
      setForm({ type: 'vacation', start: '', end: '', note: '' })
      reload()
    } catch (err) {
      setFormError(err.message)
    }
  })

  const [cancel] = useAction(async (id) => {
    await api.post(`/timeoff/${id}/cancel`)
    notify('Request cancelled.')
    reload()
  })

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div>
      <PageHead
        eyebrow="Time Off"
        title="Plan your time away."
        description="Check your balances, request leave, and track approvals. Vacation requires 14 days' notice; sick leave can be requested same-day."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {data.balances.map((b) => (
          <div key={b.id} className="border border-ink-900/10 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">{b.label}</p>
            <p className="font-num mt-3 text-[2.4rem] leading-none text-ink-900">{b.available}<span className="ml-1 text-[1rem] text-ink-500">h available</span></p>
            <div className="mt-4"><ProgressBar value={b.accrued ? (b.available / b.accrued) * 100 : 0} label={`${b.label} remaining`} /></div>
            <p className="mt-2 text-[12px] text-ink-600">{b.used}h used · {b.pending}h pending · {b.accrued}h accrued</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Request time off" className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-5" noValidate>
            <Field id="to-type" label="Type">
              <select id="to-type" className="field" value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t} value={t}>{cap(t)}</option>)}</select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="to-start" label="From"><input id="to-start" type="date" min={today} className="field" value={form.start} onChange={set('start')} /></Field>
              <Field id="to-end" label="To"><input id="to-end" type="date" min={form.start || today} className="field" value={form.end} onChange={set('end')} /></Field>
            </div>
            <Field id="to-note" label="Note (optional)"><textarea id="to-note" rows={3} maxLength={500} className="field resize-none" value={form.note} onChange={set('note')} /></Field>
            {formError && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{formError}</p>}
            <button className="btn-primary w-full" disabled={submitting}>{submitting ? 'Sending…' : 'Submit request'}</button>
          </form>
        </Panel>

        <div className="space-y-6 lg:col-span-3">
          <Panel title="Your requests" flush>
            <div className="px-6 pb-6">
              {data.requests.length === 0 ? (
                <EmptyState title="No requests yet" body="Requests you submit will appear here with their approval status." />
              ) : (
                <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
                  {data.requests.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-display text-[1.25rem] leading-tight text-ink-900">{cap(r.type)} · {r.days} day{r.days > 1 ? 's' : ''}</p>
                        <p className="mt-0.5 text-[13px] text-ink-600">{fmtDate(r.start)} – {fmtDate(r.end)}</p>
                        {r.status === 'denied' && r.reviewNote && <p className="mt-1 text-[12px] text-red-700">Reason: {r.reviewNote}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Pill tone={tone[r.status]}>{cap(r.status)}</Pill>
                        {r.status === 'pending' && <button onClick={() => cancel(r.id)} className="link-arrow !text-[11px]">Cancel</button>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="Upcoming company holidays">
            <ul className="divide-y divide-ink-900/10">
              {data.holidays.map((h) => (
                <li key={h.date} className="flex items-center justify-between py-3 text-[14px]">
                  <span className="text-ink-900">{h.name}</span>
                  <span className="text-ink-600">{fmtDate(h.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}

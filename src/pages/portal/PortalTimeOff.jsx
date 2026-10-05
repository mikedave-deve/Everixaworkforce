import { useState } from 'react'
import { PageHead, Panel, Pill, Field, ProgressBar, EmptyState, useToast } from '../../components/portal/ui'
import { timeOffBalances, upcomingHolidays } from '../../data/employeePortal'
import { fmtDate, isoDay, logActivity, usePortalState } from '../../lib/portalStore'

const TYPES = ['Vacation', 'Sick', 'Personal']
const tone = { Pending: 'brass', Approved: 'success', Cancelled: 'neutral', Denied: 'danger' }

function businessDays(start, end) {
  let n = 0
  const d = new Date(start + 'T12:00:00')
  const stop = new Date(end + 'T12:00:00')
  while (d <= stop) {
    if (d.getDay() !== 0 && d.getDay() !== 6) n++
    d.setDate(d.getDate() + 1)
  }
  return n
}

export default function PortalTimeOff() {
  const notify = useToast()
  const [requests, setRequests] = usePortalState('timeoff', [])
  const today = isoDay()
  const [form, setForm] = useState({ type: 'Vacation', start: '', end: '', note: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const balances = timeOffBalances.map((b) => {
    const pending = requests
      .filter((r) => r.type.toLowerCase() === b.id && r.status !== 'Cancelled' && r.status !== 'Denied')
      .reduce((a, r) => a + r.hours, 0)
    return { ...b, pending, available: b.accrued - b.used - pending }
  })

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.start || !form.end) return setError('Choose a start and end date.')
    if (form.end < form.start) return setError('End date must be on or after the start date.')
    if (form.start < today) return setError('Start date cannot be in the past.')
    const days = businessDays(form.start, form.end)
    if (days === 0) return setError('That range contains no working days.')
    const hours = days * 8
    const bal = balances.find((b) => b.id === form.type.toLowerCase())
    if (hours > bal.available) return setError(`You have ${bal.available} hours of ${form.type.toLowerCase()} leave available; this request needs ${hours}.`)

    setRequests((cur) => [{ id: `to-${Date.now()}`, ...form, days, hours, status: 'Pending', requestedAt: new Date().toISOString() }, ...cur])
    logActivity('timeoff', 'Time off requested', `${form.type} · ${days} day${days > 1 ? 's' : ''} from ${fmtDate(form.start)}`)
    notify('Request sent to your supervisor for approval.')
    setForm({ type: 'Vacation', start: '', end: '', note: '' })
  }

  function cancel(id) {
    setRequests((cur) => cur.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r)))
    logActivity('timeoff', 'Time off request cancelled')
    notify('Request cancelled.')
  }

  return (
    <div>
      <PageHead
        eyebrow="Time Off"
        title="Plan your time away."
        description="Check your balances, request leave, and track approvals. Vacation requires 14 days' notice; sick leave can be requested same-day."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {balances.map((b) => (
          <div key={b.id} className="border border-ink-900/10 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">{b.label}</p>
            <p className="font-num mt-3 text-[2.4rem] leading-none text-ink-900">{b.available}<span className="ml-1 text-[1rem] text-ink-500">h available</span></p>
            <div className="mt-4"><ProgressBar value={(b.available / b.accrued) * 100} label={`${b.label} remaining`} /></div>
            <p className="mt-2 text-[12px] text-ink-600">{b.used}h used · {b.pending}h pending · {b.accrued}h accrued</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Request time off" className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-5" noValidate>
            <Field id="to-type" label="Type">
              <select id="to-type" className="field" value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="to-start" label="From"><input id="to-start" type="date" min={today} className="field" value={form.start} onChange={set('start')} /></Field>
              <Field id="to-end" label="To"><input id="to-end" type="date" min={form.start || today} className="field" value={form.end} onChange={set('end')} /></Field>
            </div>
            <Field id="to-note" label="Note (optional)"><textarea id="to-note" rows={3} className="field resize-none" value={form.note} onChange={set('note')} /></Field>
            {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
            <button className="btn-primary w-full">Submit request</button>
          </form>
        </Panel>

        <div className="space-y-6 lg:col-span-3">
          <Panel title="Your requests" flush>
            <div className="px-6 pb-6">
              {requests.length === 0 ? (
                <EmptyState title="No requests yet" body="Requests you submit will appear here with their approval status." />
              ) : (
                <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
                  {requests.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-display text-[1.25rem] leading-tight text-ink-900">{r.type} · {r.days} day{r.days > 1 ? 's' : ''}</p>
                        <p className="mt-0.5 text-[13px] text-ink-600">{fmtDate(r.start)} – {fmtDate(r.end)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Pill tone={tone[r.status]}>{r.status}</Pill>
                        {r.status === 'Pending' && <button onClick={() => cancel(r.id)} className="link-arrow !text-[11px]">Cancel</button>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="Upcoming company holidays">
            <ul className="divide-y divide-ink-900/10">
              {upcomingHolidays().map((h) => (
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

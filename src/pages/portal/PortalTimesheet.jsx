import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Square } from 'lucide-react'
import { PageHead, Panel, Stat, Pill, TableWrap, th, td, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { api, useApi } from '../../lib/api'
import { addDays, fmtDate, isoDay, weekStart } from '../../lib/format'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUS = {
  draft: { tone: 'brass', label: 'Draft' },
  submitted: { tone: 'info', label: 'Submitted' },
  approved: { tone: 'success', label: 'Approved' },
  rejected: { tone: 'danger', label: 'Returned' },
}

export default function PortalTimesheet() {
  const notify = useToast()
  const [offset, setOffset] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const thisMonday = useMemo(() => weekStart(), [])
  const monday = addDays(thisMonday, offset * 7)
  const week = isoDay(monday)
  const isCurrent = offset === 0
  const isFuture = offset > 0

  const { data, error, loading, reload } = useApi(`/timesheets/${week}`)
  // Local edits for the displayed week; falls back to the saved hours from the server.
  const [edits, setEdits] = useState(null)
  const hours = edits?.week === week ? edits.hours : (data?.hours ?? {})
  const setHours = (h) => setEdits({ week, hours: h })
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const locked = ['submitted', 'approved'].includes(data?.status)
  const hoursFor = (i) => Number(hours[i] ?? 0)
  const total = DAYS.reduce((a, _, i) => a + hoursFor(i), 0)
  const overtime = Math.max(0, total - 40)
  const clockIn = data?.clockIn ?? null
  const elapsedH = clockIn ? (now - new Date(clockIn).getTime()) / 36e5 : 0
  const todayIdx = (new Date().getDay() + 6) % 7

  const [saveHours] = useAction(async (next) => {
    await api.put(`/timesheets/${week}`, { hours: next })
    setEdits(null)
    reload()
  })

  const [clock] = useAction(async () => {
    await api.post(`/timesheets/${week}/clock`, { action: clockIn ? 'out' : 'in' })
    notify(clockIn ? 'Clocked out. Hours recorded.' : 'Clocked in.')
    setEdits(null)
    reload()
  })

  const [submit, submitting] = useAction(async () => {
    await api.put(`/timesheets/${week}`, { hours })
    await api.post(`/timesheets/${week}/submit`)
    notify('Timesheet submitted for approval.')
    setEdits(null)
    reload()
  })

  function onChange(i, v) {
    const n = Math.max(0, Math.min(24, Number(v) || 0))
    setHours({ ...hours, [i]: n })
  }

  const st = STATUS[data?.status ?? 'draft']

  return (
    <div>
      <PageHead
        eyebrow="Time Sheet"
        title="Log your hours."
        description="Clock in and out, or enter hours by hand. Submit by Friday at 5:00 PM so payroll can process your check on time."
      />

      {error ? <ErrorState error={error} onRetry={reload} /> : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Week total" value={total.toFixed(1)} hint="hours" />
            <Stat label="Regular" value={Math.min(40, total).toFixed(1)} hint="up to 40 h" />
            <Stat label="Overtime" value={overtime.toFixed(1)} hint="paid at 1.5×" />
            <Stat label="Status" value={st.label} hint={locked ? 'Locked for editing' : 'Editable'} />
          </div>

          {data?.status === 'rejected' && data.reviewNote && (
            <p role="alert" className="mb-6 border border-red-300 bg-red-50 p-4 text-[14px] text-red-800">HR returned this timesheet: {data.reviewNote}</p>
          )}

          {isCurrent && (
            <Panel tone="dark" className="mb-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow mb-3">Time clock</p>
                  <p className="font-num text-[2.6rem] leading-none text-cream-50">
                    {clockIn ? `${Math.floor(elapsedH)}h ${String(Math.floor((elapsedH % 1) * 60)).padStart(2, '0')}m` : 'Off the clock'}
                  </p>
                  <p className="mt-2 text-[13px] text-cream-100/65">
                    {clockIn ? `Since ${new Date(clockIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Tap to start a shift'}
                  </p>
                </div>
                <button onClick={clock} disabled={locked || loading} className="btn-light sm:min-w-44">
                  {clockIn ? <><Square size={15} /> Clock out</> : <><Play size={15} /> Clock in</>}
                </button>
              </div>
            </Panel>
          )}

          <Panel
            flush
            title={`Week of ${fmtDate(monday, { month: 'long', day: 'numeric' })}`}
            action={
              <div className="flex items-center gap-2">
                <Pill tone={st.tone}>{st.label}</Pill>
                <button aria-label="Previous week" onClick={() => setOffset((o) => o - 1)} className="border border-ink-900/20 p-2 text-ink-700 hover:bg-ink-100"><ChevronLeft size={16} /></button>
                <button aria-label="Next week" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={isCurrent} className="border border-ink-900/20 p-2 text-ink-700 hover:bg-ink-100 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            }
          >
            <div className="px-6 pb-6">
              {loading ? <Loading /> : (
                <>
                  <TableWrap min="32rem">
                    <thead>
                      <tr className="border-b border-ink-900/10">
                        <th scope="col" className={th}>Day</th>
                        <th scope="col" className={th}>Date</th>
                        <th scope="col" className={`${th} text-right`}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((d, i) => {
                        const futureDay = isFuture || (isCurrent && i > todayIdx)
                        return (
                          <tr key={d} className="border-b border-ink-900/10 last:border-0">
                            <td className={`${td} font-medium`}>{d}</td>
                            <td className={`${td} text-ink-600`}>{fmtDate(addDays(monday, i), { month: 'short', day: 'numeric' })}</td>
                            <td className={`${td} text-right`}>
                              <label className="sr-only" htmlFor={`h-${i}`}>Hours for {d}</label>
                              <input
                                id={`h-${i}`}
                                type="number" min="0" max="24" step="0.25"
                                value={hoursFor(i) === 0 ? '' : hoursFor(i)}
                                placeholder="0"
                                disabled={locked || futureDay}
                                onChange={(e) => onChange(i, e.target.value)}
                                onBlur={() => saveHours(hours)}
                                className="field !w-24 !py-2 text-right tabular-nums disabled:bg-ink-50 disabled:text-ink-500"
                              />
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td className={`${td} font-semibold`} colSpan={2}>Total</td>
                        <td className={`${td} text-right font-num text-[1.4rem] font-normal`}>{total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </TableWrap>

                  {!locked && !isFuture && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button onClick={submit} disabled={total === 0 || Boolean(clockIn) || submitting} className="btn-primary">Submit timesheet</button>
                      <p className="text-[12px] text-ink-600">{clockIn ? 'Clock out before submitting.' : "You can't edit hours after submitting. Contact HR to reopen a week."}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Square } from 'lucide-react'
import { PageHead, Panel, Stat, Pill, TableWrap, th, td, useToast } from '../../components/portal/ui'
import { addDays, fmtDate, isoDay, logActivity, usePortalState, weekStart } from '../../lib/portalStore'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Past weeks with no stored entry are shown as a standard approved 40-hour week (demo). */
function pastDefault() {
  return { hours: { 0: 8, 1: 8, 2: 8, 3: 8, 4: 8 }, submitted: true, approved: true, synthetic: true }
}

export default function PortalTimesheet() {
  const notify = useToast()
  const [sheets, setSheets] = usePortalState('timesheets', {})
  const [offset, setOffset] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const thisMonday = useMemo(() => weekStart(), [])
  const monday = addDays(thisMonday, offset * 7)
  const key = isoDay(monday)
  const isCurrent = offset === 0
  const isFuture = offset > 0

  const stored = sheets[key]
  const sheet = stored ?? (offset < 0 ? pastDefault() : { hours: {}, submitted: false })
  const locked = Boolean(sheet.submitted)
  const hoursFor = (i) => Number(sheet.hours?.[i] ?? 0)
  const total = DAYS.reduce((a, _, i) => a + hoursFor(i), 0)
  const overtime = Math.max(0, total - 40)

  const write = (patch) => setSheets((cur) => ({ ...cur, [key]: { ...(cur[key] ?? { hours: {}, submitted: false }), ...patch } }))

  function setHours(i, v) {
    const n = Math.max(0, Math.min(24, Number(v) || 0))
    write({ hours: { ...(sheet.hours ?? {}), [i]: n } })
  }

  // Clock in / out (current week only)
  const clockIn = sheets[key]?.clockIn ?? null
  const todayIdx = (new Date().getDay() + 6) % 7
  const elapsedH = clockIn ? (now - new Date(clockIn).getTime()) / 36e5 : 0

  function clock() {
    if (!clockIn) {
      write({ clockIn: new Date().toISOString() })
      logActivity('time', 'Clocked in')
      notify('Clocked in.')
    } else {
      const worked = Math.round(elapsedH * 100) / 100
      write({ clockIn: null, hours: { ...(sheet.hours ?? {}), [todayIdx]: Math.round((hoursFor(todayIdx) + worked) * 100) / 100 } })
      logActivity('time', 'Clocked out', `${worked.toFixed(2)} hours recorded`)
      notify(`Clocked out — ${worked.toFixed(2)} hours recorded.`)
    }
  }

  function submit() {
    write({ submitted: true, submittedAt: new Date().toISOString() })
    logActivity('time', 'Timesheet submitted', `Week of ${fmtDate(monday, { month: 'short', day: 'numeric' })} · ${total.toFixed(1)} hours`)
    notify('Timesheet submitted for approval.')
  }

  const status = sheet.approved ? <Pill tone="success">Approved</Pill> : locked ? <Pill tone="info">Submitted</Pill> : <Pill tone="brass">Draft</Pill>

  return (
    <div>
      <PageHead
        eyebrow="Time Sheet"
        title="Log your hours."
        description="Clock in and out, or enter hours by hand. Submit by Friday at 5:00 PM so payroll can process your check on time."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Week total" value={total.toFixed(1)} hint="hours" />
        <Stat label="Regular" value={Math.min(40, total).toFixed(1)} hint="up to 40 h" />
        <Stat label="Overtime" value={overtime.toFixed(1)} hint="paid at 1.5×" />
        <Stat label="Status" value={locked ? (sheet.approved ? 'Approved' : 'Submitted') : 'Draft'} hint={locked ? 'Locked for editing' : 'Editable'} />
      </div>

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
            <button onClick={clock} disabled={locked} className="btn-light sm:min-w-44">
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
            {status}
            <button aria-label="Previous week" onClick={() => setOffset((o) => o - 1)} className="border border-ink-900/20 p-2 text-ink-700 hover:bg-ink-100"><ChevronLeft size={16} /></button>
            <button aria-label="Next week" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={isCurrent} className="border border-ink-900/20 p-2 text-ink-700 hover:bg-ink-100 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        }
      >
        <div className="px-6 pb-6">
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
                const date = addDays(monday, i)
                const futureDay = isFuture || (isCurrent && i > todayIdx)
                return (
                  <tr key={d} className="border-b border-ink-900/10 last:border-0">
                    <td className={`${td} font-medium`}>{d}</td>
                    <td className={`${td} text-ink-600`}>{fmtDate(date, { month: 'short', day: 'numeric' })}</td>
                    <td className={`${td} text-right`}>
                      <label className="sr-only" htmlFor={`h-${i}`}>Hours for {d}</label>
                      <input
                        id={`h-${i}`}
                        type="number" min="0" max="24" step="0.25"
                        value={hoursFor(i) === 0 ? '' : hoursFor(i)}
                        placeholder="0"
                        disabled={locked || futureDay}
                        onChange={(e) => setHours(i, e.target.value)}
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
              <button onClick={submit} disabled={total === 0} className="btn-primary">Submit timesheet</button>
              <p className="text-[12px] text-ink-600">You can't edit hours after submitting. Contact your supervisor to reopen a week.</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}

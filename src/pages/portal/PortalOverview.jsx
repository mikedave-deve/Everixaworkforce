import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Clock3, Award } from 'lucide-react'
import { PageHead, Panel, Stat, Pill, ProgressBar } from '../../components/portal/ui'
import { getSession } from '../../lib/auth'
import { usePortalState, fmtDate, money, isoDay, weekStart } from '../../lib/portalStore'
import {
  buildPayStubs, nextPayday, missions, announcements, recognitionPoints, timeOffBalances, equipmentSeed,
} from '../../data/employeePortal'

const SETUP_STEPS = ['personal', 'emergency', 'address', 'deposit', 'preferences']

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function PortalOverview() {
  const session = getSession()
  const firstName = session?.firstName ?? session?.name?.split(' ')[0] ?? 'there'

  const [timesheets] = usePortalState('timesheets', {})
  const [setup] = usePortalState('setup', {})
  const [identity] = usePortalState('identity', { status: 'not_started' })
  const [acked] = usePortalState('equipmentAck', ['eq-badge', 'eq-headset', 'eq-vest'])
  const [timeOff] = usePortalState('timeoff', [])
  const [missionAck] = usePortalState('missionAck', [])

  const wk = timesheets[isoDay(weekStart())]
  const weekHours = wk ? Object.values(wk.hours ?? {}).reduce((a, b) => a + Number(b || 0), 0) : 0
  const submitted = Boolean(wk?.submitted)

  const stub = buildPayStubs(1)[0]
  const vacation = timeOffBalances[0]
  const vacationLeft = vacation.accrued - vacation.used - timeOff.filter((r) => r.type === 'Vacation' && r.status !== 'Cancelled').reduce((a, r) => a + r.hours, 0)

  const setupDone = SETUP_STEPS.filter((s) => setup[s]).length
  const setupPct = (setupDone / SETUP_STEPS.length) * 100

  const mission = missions.find((m) => m.status === 'Active')
  const pendingEquip = equipmentSeed.filter((e) => !acked.includes(e.id)).length

  const todos = [
    identity.status === 'not_started' && { label: 'Complete identity verification (Form I-9)', to: '/portal/identity', tone: 'danger', tag: 'Required' },
    setupDone < SETUP_STEPS.length && { label: `Finish information setup — ${SETUP_STEPS.length - setupDone} step${SETUP_STEPS.length - setupDone > 1 ? 's' : ''} left`, to: '/portal/setup', tone: 'brass', tag: 'Setup' },
    !submitted && { label: "Submit this week's timesheet by Friday 5:00 PM", to: '/portal/timesheet', tone: 'brass', tag: 'Due Fri' },
    pendingEquip > 0 && { label: `Acknowledge ${pendingEquip} item${pendingEquip > 1 ? 's' : ''} of company equipment`, to: '/portal/equipment', tone: 'neutral', tag: 'Equipment' },
    mission && !missionAck.includes(mission.id) && { label: `Review and acknowledge instructions — ${mission.title}`, to: '/portal/missions', tone: 'neutral', tag: 'Mission' },
  ].filter(Boolean)

  return (
    <div>
      <PageHead
        eyebrow="Dashboard"
        title={`${greeting()}, ${firstName}.`}
        description="Your schedule, pay and to-dos in one place."
        actions={<Link to="/portal/timesheet" className="btn-primary">Open time sheet <ArrowRight size={16} /></Link>}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Hours this week" value={weekHours.toFixed(1)} hint={submitted ? 'Submitted for approval' : 'Not yet submitted'} />
        <Stat label="Next payday" value={fmtDate(nextPayday(), { month: 'short', day: 'numeric' })} hint={`Last net pay ${money(stub.net)}`} />
        <Stat label="Vacation available" value={`${Math.max(0, vacationLeft)}h`} hint={`${vacation.accrued}h accrued this year`} />
        <Stat label="Setup complete" value={`${Math.round(setupPct)}%`} hint={`${setupDone} of ${SETUP_STEPS.length} steps`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {mission && (
            <Panel tone="dark" title="Current mission" action={<Pill tone="onDark">{mission.status}</Pill>}>
              <p className="font-display text-[1.7rem] leading-tight text-cream-50">{mission.title}</p>
              <p className="mt-1 text-[14px] text-cream-100/65">{mission.client}</p>
              <ul className="mt-5 space-y-2.5 text-[14px] text-cream-100/80">
                <li className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brass-300" />{mission.schedule}</li>
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-300" />{mission.site}</li>
              </ul>
              <Link to="/portal/missions" className="link-arrow mt-6">View instructions <ArrowRight size={14} /></Link>
            </Panel>
          )}

          <Panel title="Your to-do list" description={todos.length ? `${todos.length} item${todos.length > 1 ? 's' : ''} need your attention` : 'You are all caught up.'}>
            {todos.length === 0 ? (
              <p className="text-[14px] text-ink-600">Nothing pending. Nice work.</p>
            ) : (
              <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
                {todos.map((t) => (
                  <li key={t.label}>
                    <Link to={t.to} className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-ink-50">
                      <span className="text-[14px] text-ink-800">{t.label}</span>
                      <span className="flex shrink-0 items-center gap-3">
                        <Pill tone={t.tone}>{t.tag}</Pill>
                        <ArrowRight size={15} className="text-ink-400 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Getting set up" description="Complete your profile so payroll and HR have what they need.">
            <ProgressBar value={setupPct} label="Information setup progress" />
            <p className="mt-3 text-[13px] text-ink-600">{setupDone} of {SETUP_STEPS.length} steps complete</p>
            <Link to="/portal/setup" className="link-arrow mt-5">Continue setup <ArrowRight size={14} /></Link>
          </Panel>

          <Panel title="Announcements">
            <ul className="divide-y divide-ink-900/10">
              {announcements.map((a) => (
                <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-display text-[1.2rem] leading-snug text-ink-900">{a.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-700/80">{a.body}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-brass-500" strokeWidth={1.4} />
              <div>
                <p className="font-num text-[2rem] leading-none text-ink-900">{recognitionPoints.toLocaleString()}</p>
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-600">Recognition points</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Clock3 } from 'lucide-react'
import { PageHead, Panel, Stat, Pill, ProgressBar, Loading, ErrorState } from '../../components/portal/ui'
import { useApi } from '../../lib/api'
import { fmtDate, fmtDateTime, money } from '../../lib/format'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const TS_HINT = { draft: 'Not yet submitted', submitted: 'Submitted for approval', approved: 'Approved', rejected: 'Returned — please fix & resubmit' }

export default function PortalOverview() {
  const { data, error, loading, reload } = useApi('/dashboard')

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { user, mission, todos, recent } = data

  return (
    <div>
      <PageHead
        eyebrow="Dashboard"
        title={`${greeting()}, ${user.firstName}.`}
        description="Your schedule, pay and to-dos in one place."
        actions={<Link to="/portal/timesheet" className="btn-primary">Open time sheet <ArrowRight size={16} /></Link>}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Hours this week" value={data.hoursThisWeek.toFixed(1)} hint={TS_HINT[data.timesheetStatus]} />
        <Stat label="Next payday" value={data.nextPayday ? fmtDate(data.nextPayday, { month: 'short', day: 'numeric' }) : '—'} hint={data.lastNet != null ? `Last net pay ${money(data.lastNet)}` : 'No pay statements yet'} />
        <Stat label="Vacation available" value={`${data.vacation.available}h`} hint={`${data.vacation.accrued}h accrued this year`} />
        <Stat label="Setup complete" value={`${data.setupPercent}%`} hint={data.setupPercent === 100 ? 'All done' : 'Finish your information'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {mission ? (
            <Panel tone="dark" title="Current mission" action={<Pill tone="onDark">{mission.status}</Pill>}>
              <p className="font-display text-[1.7rem] leading-tight text-cream-50">{mission.title}</p>
              {mission.client && <p className="mt-1 text-[14px] text-cream-100/65">{mission.client}</p>}
              <ul className="mt-5 space-y-2.5 text-[14px] text-cream-100/80">
                {mission.schedule && <li className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brass-300" />{mission.schedule}</li>}
                {mission.site && <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-300" />{mission.site}</li>}
              </ul>
              <Link to="/portal/missions" className="link-arrow mt-6">View instructions <ArrowRight size={14} /></Link>
            </Panel>
          ) : (
            <Panel title="Current mission" description="Nothing assigned yet.">
              <p className="text-[14px] leading-relaxed text-ink-700/80">When HR assigns you a mission, its location, schedule and instructions will appear here.</p>
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
            <ProgressBar value={data.setupPercent} label="Information setup progress" />
            <p className="mt-3 text-[13px] text-ink-600">{data.setupPercent}% complete</p>
            <Link to="/portal/setup" className="link-arrow mt-5">{data.setupPercent === 100 ? 'Review details' : 'Continue setup'} <ArrowRight size={14} /></Link>
          </Panel>

          <Panel title="Recent activity" action={<Link to="/portal/activity" className="link-arrow !text-[11px]">All</Link>}>
            {recent.length === 0 ? (
              <p className="text-[14px] text-ink-600">Events will show up here as things happen on your account.</p>
            ) : (
              <ul className="divide-y divide-ink-900/10">
                {recent.map((a) => (
                  <li key={a.id} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-[14px] font-medium text-ink-900">{a.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500">{fmtDateTime(a.at)}{a.detail ? ` · ${a.detail}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

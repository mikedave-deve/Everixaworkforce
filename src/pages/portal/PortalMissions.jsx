import { useState } from 'react'
import { MapPin, Clock3, UserRound, Phone, Shirt, ShieldAlert, Check } from 'lucide-react'
import { PageHead, Panel, Pill, ProgressBar, useToast } from '../../components/portal/ui'
import { usePortalState, logActivity } from '../../lib/portalStore'
import { missions } from '../../data/employeePortal'

const tone = { Active: 'success', Upcoming: 'brass', Completed: 'neutral' }

function MissionCard({ mission }) {
  const notify = useToast()
  const [done, setDone] = usePortalState('missionDone', {})
  const [ack, setAck] = usePortalState('missionAck', [])
  const [open, setOpen] = useState(mission.status === 'Active')

  const steps = done[mission.id] ?? []
  const completed = mission.status === 'Completed'
  const acknowledged = ack.includes(mission.id)
  const pct = (steps.length / mission.instructions.length) * 100

  const toggle = (i) =>
    setDone((cur) => {
      const s = new Set(cur[mission.id] ?? [])
      s.has(i) ? s.delete(i) : s.add(i)
      return { ...cur, [mission.id]: [...s] }
    })

  function acknowledge() {
    setAck((cur) => [...cur, mission.id])
    logActivity('mission', 'Instructions acknowledged', mission.title)
    notify('Instructions acknowledged. Your supervisor has been notified.')
  }

  return (
    <Panel
      title={mission.title}
      description={mission.client}
      action={<Pill tone={tone[mission.status]}>{mission.status}</Pill>}
    >
      <p className="max-w-2xl text-[15px] leading-relaxed text-ink-700/85">{mission.summary}</p>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="flex min-w-0 gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" /><div className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Schedule</dt><dd className="mt-1 break-words text-[14px] text-ink-800">{mission.schedule}</dd></div></div>
        <div className="flex min-w-0 gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" /><div className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Location</dt><dd className="mt-1 break-words text-[14px] text-ink-800">{mission.site}</dd></div></div>
        <div className="flex min-w-0 gap-3"><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" /><div className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Supervisor</dt><dd className="mt-1 break-words text-[14px] text-ink-800">{mission.supervisor.name} · {mission.supervisor.role}</dd></div></div>
        <div className="flex min-w-0 gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" /><div className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Contact</dt><dd className="mt-1 break-words text-[14px] text-ink-800"><a href={`tel:${mission.supervisor.phone.replace(/\D/g, '')}`} className="underline decoration-ink-300 underline-offset-4">{mission.supervisor.phone}</a></dd></div></div>
      </dl>

      {!completed && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="link-arrow mt-8"
          >
            {open ? 'Hide instructions' : 'Show instructions'}
          </button>

          {open && (
            <div className="mt-6 border-t border-ink-900/10 pt-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="font-display text-[1.35rem] text-ink-900">Instructions checklist</h3>
                <span className="text-[12px] text-ink-600">{steps.length} / {mission.instructions.length} read</span>
              </div>
              <ProgressBar value={pct} label="Instructions read" />
              <ol className="mt-5 space-y-1">
                {mission.instructions.map((text, i) => {
                  const checked = steps.includes(i)
                  return (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-3 py-2.5">
                        <input type="checkbox" checked={checked} onChange={() => toggle(i)} className="peer sr-only" />
                        <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-ink-900/30 bg-white text-white transition-colors peer-checked:border-ink-800 peer-checked:bg-ink-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brass-600 peer-focus-visible:ring-offset-2">
                          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span className={`text-[15px] leading-relaxed ${checked ? 'text-ink-500' : 'text-ink-800'}`}>{text}</span>
                      </label>
                    </li>
                  )
                })}
              </ol>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {mission.safety.length > 0 && (
                  <div className="border border-ink-900/10 bg-ink-50 p-5">
                    <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700"><ShieldAlert className="h-4 w-4 text-brass-600" /> Safety</p>
                    <ul className="space-y-2 text-[14px] leading-relaxed text-ink-800">{mission.safety.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                )}
                <div className="border border-ink-900/10 bg-ink-50 p-5">
                  <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700"><Shirt className="h-4 w-4 text-brass-600" /> Dress code</p>
                  <p className="text-[14px] leading-relaxed text-ink-800">{mission.dress}</p>
                </div>
              </div>

              <div className="mt-6">
                {acknowledged ? (
                  <Pill tone="success">Acknowledged</Pill>
                ) : (
                  <button className="btn-primary !whitespace-normal text-center" onClick={acknowledge} disabled={steps.length < mission.instructions.length}>
                    I have read and understand these instructions
                  </button>
                )}
                {!acknowledged && steps.length < mission.instructions.length && (
                  <p className="mt-2 text-[12px] text-ink-600">Check every instruction above to enable acknowledgment.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}

export default function PortalMissions() {
  return (
    <div>
      <PageHead
        eyebrow="Missions & Instructions"
        title="Your assignments."
        description="Where you're working, who to contact, and exactly what's expected. Read and acknowledge each set of instructions before your first shift."
      />
      <div className="space-y-6">
        {missions.map((m) => <MissionCard key={m.id} mission={m} />)}
      </div>
    </div>
  )
}

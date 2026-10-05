import { Check } from 'lucide-react'
import { PageHead, Panel, Pill, useToast } from '../../components/portal/ui'
import { companyServices } from '../../data/employeePortal'
import { logActivity, usePortalState } from '../../lib/portalStore'

export default function PortalServices() {
  const notify = useToast()
  const [requested, setRequested] = usePortalState('serviceRequests', [])

  function request(s) {
    if (requested.includes(s.id)) return
    setRequested((cur) => [...cur, s.id])
    logActivity('service', 'Service requested', s.name)
    notify(`${s.name}: request received. HR will follow up within one business day.`)
  }

  return (
    <div>
      <PageHead
        eyebrow="Company Services"
        title="Support beyond the paycheck."
        description="Programs available to every Everixa team member — from counseling to career coaching. Request any of them in one tap."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {companyServices.map((s, i) => {
          const done = requested.includes(s.id)
          return (
            <Panel key={s.id} className="flex flex-col">
              <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="mt-3 font-display text-[1.7rem] leading-tight text-ink-900">{s.name}</h2>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-700/85">{s.body}</p>
              <div className="mt-6">
                {done ? (
                  <Pill tone="success"><Check className="mr-1 h-3 w-3" strokeWidth={3} /> Requested</Pill>
                ) : (
                  <button onClick={() => request(s)} className="btn-outline">{s.cta}</button>
                )}
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

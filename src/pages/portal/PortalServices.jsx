import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHead, Panel, Pill, Field, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { companyServices } from '../../data/portalCatalog'
import { api } from '../../lib/api'
import { useSession } from '../../lib/useSession'

function RequestForm({ service, onDone }) {
  const notify = useToast()
  const session = useSession()
  const [firstName, setFirstName] = useState(session?.firstName ?? '')
  const [surname, setSurname] = useState(session?.lastName ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/services/request', { firstName, surname, service: service.name })
      notify(`${service.name}: request received. HR will follow up within one business day.`)
      onDone(service.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <p className="text-[14px] leading-relaxed text-ink-700/85">{service.body}</p>
      <Field id="svc-first" label="Name"><input id="svc-first" required className="field" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" /></Field>
      <Field id="svc-last" label="Surname"><input id="svc-last" required className="field" value={surname} onChange={(e) => setSurname(e.target.value)} autoComplete="family-name" /></Field>
      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Submit request'}</button>
    </form>
  )
}

export default function PortalServices() {
  const [requested, setRequested] = useState([])
  const [open, setOpen] = useState(null)

  return (
    <div>
      <PageHead
        eyebrow="Company Services"
        title="Support beyond the paycheck."
        description="Programs available to every Everixa team member — from counseling to career coaching. Tell us your name and we'll take it from there."
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
                {done ? <Pill tone="success"><Check className="mr-1 h-3 w-3" strokeWidth={3} /> Request sent</Pill> : <button onClick={() => setOpen(s)} className="btn-outline">{s.cta}</button>}
              </div>
            </Panel>
          )
        })}
      </div>

      <Sheet open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          {open && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">Company service</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{open.name}</SheetTitle>
              </SheetHeader>
              <RequestForm service={open} onDone={(id) => { setRequested((r) => [...r, id]); setOpen(null) }} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

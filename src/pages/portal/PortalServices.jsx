import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHead, Panel, Pill, Field, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { companyServices } from '../../data/portalCatalog'
import { api } from '../../lib/api'
import { useSession } from '../../lib/useSession'

/** Write-up for one service, with a real "Request this service" button. */
function ServiceDetail({ service, requested, onRequested }) {
  const notify = useToast()
  const [request, requesting] = useAction(async () => {
    await api.post('/services/request', { service: service.name })
    notify(`${service.name} requested. HR has been notified and will be in touch.`)
    onRequested(service.id)
  })

  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-relaxed text-ink-800">{service.summary}</p>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-700">What's included</h3>
        <ul className="space-y-2.5">
          {service.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[14px] leading-snug text-ink-800">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" strokeWidth={2} /> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-l-2 border-brass-500 bg-white p-4">
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">How it works</h3>
        <p className="text-[14px] leading-relaxed text-ink-700">{service.how}</p>
      </div>

      {requested ? (
        <Pill tone="success"><Check className="mr-1 h-3 w-3" strokeWidth={3} /> Request sent to HR</Pill>
      ) : (
        <button onClick={request} disabled={requesting} className="btn-primary w-full">{requesting ? 'Sending…' : 'Request this service'}</button>
      )}
    </div>
  )
}

/** Simple "Submit your details" form at the bottom of the page. */
function DetailsForm() {
  const notify = useToast()
  const session = useSession()
  const [firstName, setFirstName] = useState(session?.firstName ?? '')
  const [surname, setSurname] = useState(session?.lastName ?? '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const [submit, sending] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/services/details', { firstName, surname })
      setSent(true)
      notify('Your details were sent to HR.')
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <Panel className="mt-8" title="Submit your details" description="Tell us who you are and we'll follow up about Company Services.">
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
        <Field id="cs-first" label="Name"><input id="cs-first" required className="field" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" /></Field>
        <Field id="cs-last" label="Surname"><input id="cs-last" required className="field" value={surname} onChange={(e) => setSurname(e.target.value)} autoComplete="family-name" /></Field>
        {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800 sm:col-span-2">{error}</p>}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button className="btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Submit your details'}</button>
          {sent && <Pill tone="success">Sent to HR</Pill>}
        </div>
      </form>
    </Panel>
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
        description="Programs available to every Everixa team member. Open one to read how it works, then request it with a single tap."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {companyServices.map((s, i) => {
          const done = requested.includes(s.id)
          return (
            <Panel key={s.id} className="flex flex-col">
              <span className="index-num">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="mt-3 font-display text-[1.7rem] leading-tight text-ink-900">{s.name}</h2>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-700/85">{s.body}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => setOpen(s)} className="btn-outline">{s.cta ?? 'Request this service'}</button>
                {done && <Pill tone="success"><Check className="mr-1 h-3 w-3" strokeWidth={3} /> Requested</Pill>}
              </div>
            </Panel>
          )
        })}
      </div>

      <DetailsForm />

      <Sheet open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          {open && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">Company service</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{open.name}</SheetTitle>
              </SheetHeader>
              <ServiceDetail service={open} requested={requested.includes(open.id)} onRequested={(id) => setRequested((r) => [...r, id])} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

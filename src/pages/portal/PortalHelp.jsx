import { useState } from 'react'
import { Phone, Mail, Clock3 } from 'lucide-react'
import { PageHead, Panel, Pill, Field, EmptyState, useToast } from '../../components/portal/ui'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/Accordion'
import { faqs, hrContacts } from '../../data/employeePortal'
import { fmtDate, logActivity, usePortalState } from '../../lib/portalStore'

const TOPICS = ['Pay or direct deposit', 'Timesheet correction', 'Benefits', 'Time off', 'Equipment', 'Schedule or assignment', 'Workplace concern', 'Other']

export default function PortalHelp() {
  const notify = useToast()
  const [tickets, setTickets] = usePortalState('tickets', [])
  const [form, setForm] = useState({ topic: TOPICS[0], subject: '', message: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    const ref = `HR-${String(Math.floor(10000 + Math.random() * 90000))}`
    setTickets((cur) => [{ id: ref, ...form, status: 'Open', at: new Date().toISOString() }, ...cur])
    logActivity('help', 'Help request opened', `${ref} · ${form.topic}`)
    notify(`Request ${ref} opened. We reply within one business day.`)
    setForm({ topic: TOPICS[0], subject: '', message: '' })
  }

  return (
    <div>
      <PageHead
        eyebrow="Help & HR"
        title="We're here to help."
        description="Search common answers, contact HR directly, or open a request and we'll follow up within one business day."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {hrContacts.map((c) => (
          <Panel key={c.name}>
            <h2 className="font-display text-[1.5rem] leading-tight text-ink-900">{c.name}</h2>
            <p className="mt-1 text-[13px] text-ink-600">{c.detail}</p>
            <ul className="mt-5 space-y-2.5 text-[14px] text-ink-800">
              <li><a href={`tel:${c.phone.replace(/\D/g, '')}`} className="flex items-center gap-3 hover:underline"><Phone className="h-4 w-4 text-brass-600" />{c.phone}</a></li>
              <li><a href={`mailto:${c.email}`} className="flex items-center gap-3 hover:underline"><Mail className="h-4 w-4 text-brass-600" />{c.email}</a></li>
              <li className="flex items-center gap-3 text-ink-600"><Clock3 className="h-4 w-4 text-brass-600" />{c.hours}</li>
            </ul>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Common questions" className="lg:col-span-3">
          <Accordion type="single" collapsible className="border-t border-ink-900/10">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`}>
                <AccordionTrigger className="!text-[1.15rem]">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Open a request">
            <form onSubmit={submit} className="space-y-5">
              <Field id="t-topic" label="Topic"><select id="t-topic" className="field" value={form.topic} onChange={set('topic')}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field id="t-subject" label="Subject"><input id="t-subject" required className="field" value={form.subject} onChange={set('subject')} /></Field>
              <Field id="t-msg" label="How can we help?"><textarea id="t-msg" required rows={4} className="field resize-none" value={form.message} onChange={set('message')} /></Field>
              <button className="btn-primary w-full">Send request</button>
            </form>
          </Panel>

          <Panel title="Your requests">
            {tickets.length === 0 ? <EmptyState title="No open requests" /> : (
              <ul className="divide-y divide-ink-900/10">
                {tickets.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0"><p className="truncate text-[14px] font-medium text-ink-900">{t.subject}</p><p className="text-[12px] text-ink-600">{t.id} · {fmtDate(t.at)}</p></div>
                    <Pill tone="brass">{t.status}</Pill>
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

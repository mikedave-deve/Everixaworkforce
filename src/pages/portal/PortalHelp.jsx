import { useState } from 'react'
import { Phone, Mail, Clock3 } from 'lucide-react'
import { PageHead, Panel, Pill, Field, EmptyState, Loading, useAction, useToast } from '../../components/portal/ui'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/Accordion'
import { faqs, hrContacts } from '../../data/portalCatalog'
import { api, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'

const TOPICS = ['Pay or direct deposit', 'Timesheet correction', 'Benefits', 'Time off', 'Equipment', 'Schedule or assignment', 'Workplace concern', 'Other']

export default function PortalHelp() {
  const notify = useToast()
  const { data, loading, reload } = useApi('/help')
  const [form, setForm] = useState({ topic: TOPICS[0], subject: '', message: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [submit, sending] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { ref } = await api.post('/help', form)
      notify(`Request ${ref} sent to HR. We reply within one business day.`)
      setForm({ topic: TOPICS[0], subject: '', message: '' })
      reload()
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <div>
      <PageHead eyebrow="Help & HR" title="We're here to help." description="Search common answers, contact HR directly, or send a request — it goes straight to our HR inbox." />

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
          <Panel title="Send a request">
            <form onSubmit={submit} className="space-y-5" noValidate>
              <Field id="t-topic" label="Topic"><select id="t-topic" className="field" value={form.topic} onChange={set('topic')}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field id="t-subject" label="Subject"><input id="t-subject" required className="field" value={form.subject} onChange={set('subject')} /></Field>
              <Field id="t-msg" label="How can we help?"><textarea id="t-msg" required rows={4} className="field resize-none" value={form.message} onChange={set('message')} /></Field>
              {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
              <button className="btn-primary w-full" disabled={sending}>{sending ? 'Sending…' : 'Send to HR'}</button>
            </form>
          </Panel>

          <Panel title="Your requests">
            {loading ? <Loading /> : data.requests.length === 0 ? <EmptyState title="No requests yet" /> : (
              <ul className="divide-y divide-ink-900/10">
                {data.requests.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0"><p className="truncate text-[14px] font-medium text-ink-900">{t.subject}</p><p className="text-[12px] text-ink-600">{t.ref} · {fmtDate(t.createdAt)}</p></div>
                    <Pill tone={t.status === 'Resolved' ? 'success' : 'brass'}>{t.status}</Pill>
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

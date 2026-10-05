import { useState } from 'react'
import { Download } from 'lucide-react'
import { PageHead, Panel, Pill, Field, TableWrap, th, td, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, downloadFile, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'

const FILING = { single: 'Single or Married filing separately', married: 'Married filing jointly', head: 'Head of household' }
const STATUS = {
  none: { tone: 'neutral', label: 'Not requested' },
  pending: { tone: 'brass', label: 'Pending approval' },
  approved: { tone: 'success', label: 'Approved' },
  rejected: { tone: 'danger', label: 'Not approved' },
}

function W4Form({ onDone }) {
  const notify = useToast()
  const [draft, setDraft] = useState({ filing: 'single', multipleJobs: 'no', dependents: 0, otherIncome: 0, deductions: 0, extra: 0 })
  const [error, setError] = useState('')
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/tax/w4', draft)
      notify('W-4 submitted. HR will review it shortly.')
      onDone()
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={save} className="space-y-5">
      <Field id="filing" label="Step 1(c) · Filing status">
        <select id="filing" className="field" value={draft.filing} onChange={set('filing')}>{Object.entries(FILING).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </Field>
      <Field id="jobs" label="Step 2 · Multiple jobs or working spouse?">
        <select id="jobs" className="field" value={draft.multipleJobs} onChange={set('multipleJobs')}><option value="no">No — this is my only job</option><option value="yes">Yes — I have more than one job</option></select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="dep" label="Step 3 · Dependents credit ($)"><input id="dep" type="number" min="0" step="500" className="field" value={draft.dependents} onChange={set('dependents')} /></Field>
        <Field id="oi" label="Step 4(a) · Other income ($)"><input id="oi" type="number" min="0" className="field" value={draft.otherIncome} onChange={set('otherIncome')} /></Field>
        <Field id="ded" label="Step 4(b) · Deductions ($)"><input id="ded" type="number" min="0" className="field" value={draft.deductions} onChange={set('deductions')} /></Field>
        <Field id="extra" label="Step 4(c) · Extra withholding / period ($)"><input id="extra" type="number" min="0" className="field" value={draft.extra} onChange={set('extra')} /></Field>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-600">Your W-4 is reviewed by Everixa payroll before it takes effect. This does not constitute tax advice — consult a tax professional or IRS.gov.</p>
      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={saving}>{saving ? 'Submitting…' : 'Submit W-4 for approval'}</button>
    </form>
  )
}

export default function PortalTaxForms() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/tax')
  const [w4Open, setW4Open] = useState(false)

  const [request] = useAction(async (form, year, label) => {
    await api.post('/tax/request', { form, year })
    notify(`${label} requested. You'll see it here once HR approves.`)
    reload()
  })
  const [download] = useAction(async (doc, label) => {
    await downloadFile(`/tax/${doc.id}/pdf`, `${doc.form}-${doc.year}.pdf`)
    notify(`${label} downloaded.`)
  })

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const year = data.year
  const latest = (form, y) => data.forms.find((f) => f.form === form && (y == null || f.year === y))
  const catalog = [
    { key: 'w4', form: 'w4', name: 'Form W-4', desc: "Employee's Withholding Certificate", period: 'Current', doc: latest('w4') },
    { key: 'w2-prev', form: 'w2', year: year - 1, name: `Form W-2 (${year - 1})`, desc: 'Wage and Tax Statement', period: String(year - 1), doc: latest('w2', year - 1) },
    { key: 'w2-now', form: 'w2', year, name: `Form W-2 (${year}, year to date)`, desc: 'Wage and Tax Statement based on pay posted so far', period: String(year), doc: latest('w2', year) },
    { key: '1095', form: '1095c', year: year - 1, name: `Form 1095-C (${year - 1})`, desc: 'Employer-Provided Health Insurance Offer and Coverage', period: String(year - 1), doc: latest('1095c', year - 1) },
  ]

  return (
    <div>
      <PageHead eyebrow="Tax Forms" title="Withholding & year-end forms." description="Submit your W-4 or request a W-2 / 1095-C. Once HR approves, download an Everixa-styled PDF." />

      <Panel title="Your forms" flush>
        <div className="px-6 pb-4">
          <TableWrap min="44rem">
            <thead>
              <tr className="border-b border-ink-900/10">
                <th scope="col" className={th}>Form</th>
                <th scope="col" className={th}>Period</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((c) => {
                const st = STATUS[c.doc?.status ?? 'none']
                return (
                  <tr key={c.key} className="border-b border-ink-900/10 last:border-0">
                    <td className={td}>
                      <p className="font-display text-[1.25rem] leading-tight text-ink-900">{c.name}</p>
                      <p className="mt-0.5 text-[12px] text-ink-600">{c.desc}</p>
                      {c.doc?.status === 'rejected' && c.doc.reviewNote && <p className="mt-1 text-[12px] text-red-700">Reason: {c.doc.reviewNote}</p>}
                    </td>
                    <td className={`${td} text-ink-600`}>{c.period}</td>
                    <td className={td}><Pill tone={st.tone}>{st.label}</Pill>{c.doc?.reviewedAt && <p className="mt-1 text-[11px] text-ink-500">{fmtDate(c.doc.reviewedAt)}</p>}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex items-center justify-end gap-4">
                        {c.doc?.status === 'approved' && <button onClick={() => download(c.doc, c.name)} className="link-arrow !text-[11px]"><Download size={13} /> PDF</button>}
                        {c.form === 'w4' && c.doc?.status !== 'pending' && <button onClick={() => setW4Open(true)} className="link-arrow !text-[11px]">{c.doc ? 'Update' : 'Submit'}</button>}
                        {c.form !== 'w4' && (!c.doc || c.doc.status === 'rejected') && <button onClick={() => request(c.form, c.year, c.name)} className="link-arrow !text-[11px]">Request</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrap>
        </div>
      </Panel>

      <Sheet open={w4Open} onOpenChange={setW4Open}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          <div className="p-7">
            <SheetHeader className="p-0 pb-6">
              <p className="eyebrow">Form W-4</p>
              <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">Update withholding</SheetTitle>
            </SheetHeader>
            <W4Form onDone={() => { setW4Open(false); reload() }} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

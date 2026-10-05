import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { PageHead, Panel, Pill, Field, TableWrap, th, td, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { taxFormList } from '../../data/employeePortal'
import { downloadText, fmtDate, logActivity, usePortalState } from '../../lib/portalStore'
import { getSession } from '../../lib/auth'

const W4_DEFAULT = { filing: 'single', multipleJobs: 'no', dependents: 0, otherIncome: 0, deductions: 0, extra: 0, updatedAt: null }
const FILING = { single: 'Single or Married filing separately', married: 'Married filing jointly', head: 'Head of household' }

function W4Form({ onDone }) {
  const notify = useToast()
  const [w4, setW4] = usePortalState('taxW4', W4_DEFAULT)
  const [draft, setDraft] = useState(w4)
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }))

  function save(e) {
    e.preventDefault()
    setW4({ ...draft, dependents: Number(draft.dependents) || 0, otherIncome: Number(draft.otherIncome) || 0, deductions: Number(draft.deductions) || 0, extra: Number(draft.extra) || 0, updatedAt: new Date().toISOString() })
    logActivity('pay', 'W-4 withholding updated', FILING[draft.filing])
    notify('W-4 saved. New withholding applies to your next full pay period.')
    onDone()
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Field id="filing" label="Step 1(c) · Filing status">
        <select id="filing" className="field" value={draft.filing} onChange={set('filing')}>
          {Object.entries(FILING).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Field>
      <Field id="jobs" label="Step 2 · Multiple jobs or working spouse?">
        <select id="jobs" className="field" value={draft.multipleJobs} onChange={set('multipleJobs')}>
          <option value="no">No — this is my only job</option>
          <option value="yes">Yes — I have more than one job</option>
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="dep" label="Step 3 · Dependents credit ($)"><input id="dep" type="number" min="0" step="500" className="field" value={draft.dependents} onChange={set('dependents')} /></Field>
        <Field id="oi" label="Step 4(a) · Other income ($)"><input id="oi" type="number" min="0" className="field" value={draft.otherIncome} onChange={set('otherIncome')} /></Field>
        <Field id="ded" label="Step 4(b) · Deductions ($)"><input id="ded" type="number" min="0" className="field" value={draft.deductions} onChange={set('deductions')} /></Field>
        <Field id="extra" label="Step 4(c) · Extra withholding / period ($)"><input id="extra" type="number" min="0" className="field" value={draft.extra} onChange={set('extra')} /></Field>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-600">
        This is a demonstration of the W-4 workflow and does not constitute tax advice. Consult a tax professional or IRS.gov for guidance specific to your situation.
      </p>
      <button type="submit" className="btn-primary w-full">Save W-4</button>
    </form>
  )
}

export default function PortalTaxForms() {
  const notify = useToast()
  const session = getSession()
  const [w4Open, setW4Open] = useState(false)
  const [w4] = usePortalState('taxW4', W4_DEFAULT)
  const forms = taxFormList()

  function download(f) {
    downloadText(
      `${f.id}-${f.period}.txt`,
      [`EVERIXA WORKFORCE — ${f.name.toUpperCase()} (DEMO COPY)`, f.desc, '', `Employee: ${session?.name}`, `Employee ID: ${session?.employeeId ?? '—'}`, `Tax year: ${f.period}`, '', 'This placeholder will be replaced by the official IRS form once payroll is connected.'].join('\n')
    )
    logActivity('doc', 'Tax form downloaded', f.name)
    notify(`${f.name} downloaded.`)
  }

  return (
    <div>
      <PageHead
        eyebrow="Tax Forms"
        title="Withholding & year-end forms."
        description="Update your W-4 and download your W-2 and 1095-C when they're available."
      />

      <Panel title="Your forms" flush>
        <div className="px-6 pb-4">
          <TableWrap min="40rem">
            <thead>
              <tr className="border-b border-ink-900/10">
                <th scope="col" className={th}>Form</th>
                <th scope="col" className={th}>Period</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id} className="border-b border-ink-900/10 last:border-0">
                  <td className={td}>
                    <p className="font-display text-[1.25rem] leading-tight text-ink-900">{f.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink-600">{f.desc}</p>
                  </td>
                  <td className={`${td} text-ink-600`}>{f.period}</td>
                  <td className={td}><Pill tone={f.status === 'Available' || f.status === 'On file' ? 'success' : 'neutral'}>{f.status}</Pill></td>
                  <td className={`${td} text-right`}>
                    {f.action === 'update' && <button onClick={() => setW4Open(true)} className="link-arrow !text-[11px]">Update</button>}
                    {f.action === 'download' && <button onClick={() => download(f)} className="link-arrow !text-[11px]"><Download size={13} /> Download</button>}
                    {f.action === 'link' && <Link to="/portal/identity" className="link-arrow !text-[11px]">Open</Link>}
                    {f.action === 'view' && <span className="text-[12px] text-ink-500">Managed by payroll</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      </Panel>

      <Panel className="mt-6" title="W-4 on file" description={w4.updatedAt ? `Last updated ${fmtDate(w4.updatedAt)}` : 'Original election from onboarding'}>
        <dl className="grid gap-5 text-[14px] sm:grid-cols-3">
          <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Filing status</dt><dd className="mt-1 text-ink-900">{FILING[w4.filing]}</dd></div>
          <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Multiple jobs</dt><dd className="mt-1 text-ink-900">{w4.multipleJobs === 'yes' ? 'Yes' : 'No'}</dd></div>
          <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Extra withholding</dt><dd className="mt-1 text-ink-900">${w4.extra} per period</dd></div>
        </dl>
      </Panel>

      <Sheet open={w4Open} onOpenChange={setW4Open}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          <div className="p-7">
            <SheetHeader className="p-0 pb-6">
              <p className="eyebrow">Form W-4</p>
              <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">Update withholding</SheetTitle>
            </SheetHeader>
            <W4Form onDone={() => setW4Open(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

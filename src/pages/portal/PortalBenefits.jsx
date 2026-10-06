import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHead, Panel, Pill, Field, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { coverageLevels, medicalPlans, otherBenefits } from '../../data/portalCatalog'
import { api, useApi } from '../../lib/api'
import { fmtDate, money } from '../../lib/format'
import { cn } from '../../lib/utils'

const MATCH_CAP = 4
const GROSS_PER_PAY_FALLBACK = 24.5 * 80

/** Simple name + surname form inside the 401(k) box. Goes straight to HR's inbox and email. */
function KDetailsForm() {
  const notify = useToast()
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const [submit, sending] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/benefits/401k-details', { firstName, surname })
      setSent(true)
      notify('Your 401(k) details were sent to HR.')
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={submit} className="mt-6 border-t border-ink-900/10 pt-5" noValidate>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Your 401(k) details</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="k-first" className="sr-only">Name</label>
          <input id="k-first" required className="field" placeholder="Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="k-last" className="sr-only">Surname</label>
          <input id="k-last" required className="field" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} autoComplete="family-name" />
        </div>
      </div>
      {error && <p role="alert" className="mt-3 border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Submit details'}</button>
        {sent && <Pill tone="success">Sent to HR</Pill>}
      </div>
    </form>
  )
}

export default function PortalBenefits() {
  const { data, error, loading, reload } = useApi('/benefits')
  const { data: pay } = useApi('/pay')

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />
  return <BenefitsEditor data={data} pay={pay} reload={reload} />
}

function BenefitsEditor({ data, pay, reload }) {
  const notify = useToast()
  const base = data.pending ?? data.approved
  const [draft, setDraft] = useState(base ? { medical: base.medical, coverage: base.coverage, k401: base.k401 } : { medical: 'pp', coverage: 'ee', k401: 4 })

  const [submit, submitting] = useAction(async () => {
    await api.post('/benefits', draft)
    notify('Elections submitted for approval. HR will review them shortly.')
    reload()
  })

  const plan = medicalPlans.find((p) => p.id === draft.medical)
  const level = coverageLevels.find((c) => c.id === draft.coverage)
  const medicalPerPay = plan.id === 'wv' ? 0 : (plan.premium * level.factor * 12) / 26
  const grossPerPay = (pay?.rate || 0) > 0 ? pay.rate * 80 : GROSS_PER_PAY_FALLBACK
  const k401PerPay = (grossPerPay * draft.k401) / 100
  const matchPerPay = (grossPerPay * Math.min(draft.k401, MATCH_CAP)) / 100

  const current = data.pending ?? data.approved
  const dirty = !current || current.medical !== draft.medical || current.coverage !== draft.coverage || current.k401 !== draft.k401
  const canSubmit = dirty && !submitting

  return (
    <div>
      <PageHead
        eyebrow="Benefits"
        title="Choose coverage that fits."
        description="Compare plans, set your 401(k) contribution and see what each paycheck will cost. HR reviews every election before it takes effect."
        actions={<Pill tone="brass">Open enrollment Nov 1 – Nov 15</Pill>}
      />

      {data.pending && (
        <p role="status" className="mb-6 flex flex-wrap items-center gap-3 border border-brass-400 bg-brass-300/20 p-4 text-[14px] text-ink-900">
          <Pill tone="brass">Pending approval</Pill> Submitted {fmtDate(data.pending.submittedAt)}. You'll see it here once HR approves.
        </p>
      )}
      {!data.pending && data.lastRejected && (
        <p role="alert" className="mb-6 border border-red-300 bg-red-50 p-4 text-[14px] text-red-800">
          <Pill tone="danger" className="mr-3">Not approved</Pill>{data.lastRejected.reviewNote || 'Please contact HR about your elections.'}
        </p>
      )}
      {data.approved && !data.pending && (
        <p role="status" className="mb-6 flex flex-wrap items-center gap-3 border border-ink-900/10 bg-white p-4 text-[14px] text-ink-800">
          <Pill tone="success">Active</Pill> Approved {fmtDate(data.approved.reviewedAt)} — {medicalPlans.find((p) => p.id === data.approved.medical)?.name}, 401(k) {data.approved.k401}%.
        </p>
      )}

      <Panel title="Medical plan" description="Costs shown are your share per bi-weekly paycheck, pre-tax.">
        <fieldset>
          <legend className="sr-only">Medical plan</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {medicalPlans.map((p) => {
              const on = draft.medical === p.id
              const cost = p.id === 'wv' ? 0 : (p.premium * level.factor * 12) / 26
              return (
                <label key={p.id} className={cn('relative block cursor-pointer border p-5 transition-colors', on ? 'border-ink-800 bg-ink-50' : 'border-ink-900/15 bg-white hover:border-ink-900/40')}>
                  <input type="radio" name="medical" value={p.id} checked={on} onChange={() => setDraft((d) => ({ ...d, medical: p.id }))} className="peer sr-only" />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 peer-focus-visible:ring-2 peer-focus-visible:ring-brass-600 peer-focus-visible:ring-offset-2" />
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-[1.35rem] leading-tight text-ink-900">{p.name}</p>
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center border', on ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-900/30')}>{on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-700/80">{p.note}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
                    <div><dt className="text-ink-500">Per paycheck</dt><dd className="mt-0.5 font-semibold text-ink-900">{money(cost)}</dd></div>
                    <div><dt className="text-ink-500">Deductible</dt><dd className="mt-0.5 font-semibold text-ink-900">{p.deductible}</dd></div>
                    <div><dt className="text-ink-500">Out-of-pocket max</dt><dd className="mt-0.5 font-semibold text-ink-900">{p.oop}</dd></div>
                  </dl>
                </label>
              )
            })}
          </div>
        </fieldset>
        <Field id="coverage" label="Coverage level" className="mt-6 max-w-sm">
          <select id="coverage" className="field" value={draft.coverage} onChange={(e) => setDraft((d) => ({ ...d, coverage: e.target.value }))} disabled={draft.medical === 'wv'}>
            {coverageLevels.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="401(k) retirement" description={`Everixa matches 100% of your contribution up to ${MATCH_CAP}% of pay.`}>
          <label htmlFor="k401" className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Your contribution</span>
            <span className="font-num text-[2rem] text-ink-900">{draft.k401}%</span>
          </label>
          <input id="k401" type="range" min="0" max="15" step="1" value={draft.k401} onChange={(e) => setDraft((d) => ({ ...d, k401: Number(e.target.value) }))} className="mt-3 w-full accent-ink-800" />
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-900/10 pt-4 text-[14px]">
            <div><dt className="text-[12px] text-ink-600">You contribute / paycheck</dt><dd className="mt-1 font-semibold tabular-nums text-ink-900">{money(k401PerPay)}</dd></div>
            <div><dt className="text-[12px] text-ink-600">Company match / paycheck</dt><dd className="mt-1 font-semibold tabular-nums text-ink-900">{money(matchPerPay)}</dd></div>
          </dl>
          {draft.k401 < MATCH_CAP && <p className="mt-4 text-[13px] text-brass-700">Contribute at least {MATCH_CAP}% to receive the full company match.</p>}
          <KDetailsForm />
        </Panel>

        <Panel title="Also included">
          <ul className="divide-y divide-ink-900/10">
            {otherBenefits.map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="font-display text-[1.2rem] leading-tight text-ink-900">{b.name}</p>
                  <p className="mt-0.5 text-[13px] text-ink-600">{b.detail}</p>
                </div>
                <span className="shrink-0 text-[12px] font-medium text-ink-700">{b.cost}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="on-dark sticky bottom-0 mt-8 flex flex-col gap-4 border border-ink-800 bg-ink-900 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-300">Estimated per paycheck</p>
          <p className="font-num text-[1.9rem] leading-tight text-cream-50">{money(medicalPerPay + k401PerPay)} <span className="text-[13px] text-cream-100/60">medical + 401(k)</span></p>
        </div>
        <button onClick={submit} disabled={!canSubmit} className="btn-light">{submitting ? 'Submitting…' : dirty ? 'Submit for approval' : 'No changes'}</button>
      </div>
    </div>
  )
}

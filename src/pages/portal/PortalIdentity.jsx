import { useState } from 'react'
import { ShieldCheck, FileCheck2, Clock3 } from 'lucide-react'
import { PageHead, Panel, Pill, Field, useToast } from '../../components/portal/ui'
import { fmtDate, isoDay, logActivity, usePortalState } from '../../lib/portalStore'
import { cn } from '../../lib/utils'

const LIST_A = ['U.S. Passport or Passport Card', 'Permanent Resident Card (Form I-551)', 'Employment Authorization Document (Form I-766)']
const LIST_B = ['Driver\'s license or state ID card', 'School ID with photograph', 'U.S. military card']
const LIST_C = ['Social Security Account Number card (unrestricted)', 'Certified birth certificate', 'U.S. Citizen ID card (Form I-197)']

const STATUS = {
  not_started: { tone: 'danger', label: 'Action required' },
  submitted: { tone: 'info', label: 'Under review' },
  verified: { tone: 'success', label: 'Verified' },
}

export default function PortalIdentity() {
  const notify = useToast()
  const [id, setId] = usePortalState('identity', { status: 'not_started' })
  const [mode, setMode] = useState('A')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const s = STATUS[id.status]

  function submit(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    setError('')
    if (!fileName) return setError('Attach a clear photo or scan of the document.')
    if (!/^[A-Za-z0-9]{4}$/.test(f.last4)) return setError('Enter the last four characters of the document number.')
    if (f.expires && f.expires < isoDay()) return setError('That document has expired. Provide an unexpired document.')
    if (f.attest !== 'on') return setError('You must attest to the accuracy of the information.')

    setId({
      status: 'submitted',
      mode,
      docType: f.docType,
      docType2: f.docType2 ?? null,
      last4: f.last4.toUpperCase(),
      expires: f.expires,
      fileName,
      submittedAt: new Date().toISOString(),
    })
    logActivity('security', 'Identity documents submitted', f.docType)
    notify('Documents submitted. HR will review within 1–2 business days.')
  }

  return (
    <div>
      <PageHead
        eyebrow="Identity Verification"
        title="Verify your eligibility to work."
        description="Federal law (Form I-9) requires every new employee to present original identity and work-authorization documents within three business days of starting."
        actions={<Pill tone={s.tone}>{s.label}</Pill>}
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          [ShieldCheck, '1. Choose documents', 'Either one List A document, or one List B plus one List C.'],
          [FileCheck2, '2. Upload & attest', 'Attach a clear image and confirm the details are accurate.'],
          [Clock3, '3. HR review', 'We verify within 1–2 business days and may ask to see originals.'],
        ].map(([Icon, t, b]) => (
          <div key={t} className="border border-ink-900/10 bg-white p-5">
            <Icon className="h-5 w-5 text-brass-600" strokeWidth={1.5} />
            <p className="mt-3 font-display text-[1.25rem] leading-tight text-ink-900">{t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{b}</p>
          </div>
        ))}
      </div>

      {id.status !== 'not_started' ? (
        <Panel
          title={id.status === 'verified' ? 'Identity verified' : 'Submitted — awaiting review'}
          description={`Submitted ${fmtDate(id.submittedAt)}`}
          action={<Pill tone={s.tone}>{s.label}</Pill>}
        >
          <dl className="grid gap-5 text-[14px] sm:grid-cols-2">
            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Document</dt><dd className="mt-1 text-ink-900">{id.docType}{id.docType2 ? ` + ${id.docType2}` : ''}</dd></div>
            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Number</dt><dd className="mt-1 text-ink-900">••••{id.last4}</dd></div>
            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">File</dt><dd className="mt-1 text-ink-900">{id.fileName}</dd></div>
            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Expires</dt><dd className="mt-1 text-ink-900">{id.expires ? fmtDate(id.expires) : '—'}</dd></div>
          </dl>
          <button className="link-arrow mt-6" onClick={() => setId({ status: 'not_started' })}>Resubmit different documents</button>
        </Panel>
      ) : (
        <Panel title="Submit documents">
          <div role="tablist" aria-label="Document option" className="mb-6 inline-flex border border-ink-900/20">
            {[['A', 'One List A document'], ['BC', 'List B + List C']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn('px-5 py-2.5 text-[13px] font-medium transition-colors', mode === k ? 'bg-ink-800 text-cream-50' : 'text-ink-700 hover:bg-ink-100')}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="docType" label={mode === 'A' ? 'List A document' : 'List B document'} className="sm:col-span-2">
                <select id="docType" name="docType" className="field">{(mode === 'A' ? LIST_A : LIST_B).map((d) => <option key={d}>{d}</option>)}</select>
              </Field>
              {mode === 'BC' && (
                <Field id="docType2" label="List C document" className="sm:col-span-2">
                  <select id="docType2" name="docType2" className="field">{LIST_C.map((d) => <option key={d}>{d}</option>)}</select>
                </Field>
              )}
              <Field id="last4" label="Last 4 of document number" hint="We never ask for your full document or Social Security number here."><input id="last4" name="last4" maxLength={4} autoComplete="off" className="field" /></Field>
              <Field id="expires" label="Expiration date"><input id="expires" name="expires" type="date" className="field" /></Field>
            </div>

            <div>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Document image</span>
              <label htmlFor="file" className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-ink-900/30 bg-ink-50 px-6 py-8 text-center transition-colors hover:border-ink-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brass-600">
                <span className="text-[14px] font-medium text-ink-900">{fileName || 'Choose a photo or PDF'}</span>
                <span className="mt-1 text-[12px] text-ink-600">JPG, PNG or PDF · up to 10 MB</span>
                <input id="file" type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f && f.size > 10 * 1024 * 1024) { setError('File is larger than 10 MB.'); setFileName(''); return }
                  setError(''); setFileName(f?.name ?? '')
                }} />
              </label>
              <p className="mt-1.5 text-[12px] text-ink-600">Demo: only the file name is kept; nothing is uploaded.</p>
            </div>

            <label className="flex items-start gap-3 text-[14px] text-ink-800">
              <input type="checkbox" name="attest" className="mt-1 h-4 w-4 accent-ink-800" />
              I attest, under penalty of perjury, that these documents are genuine and relate to me.
            </label>

            {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
            <button className="btn-primary">Submit for verification</button>
          </form>
        </Panel>
      )}
    </div>
  )
}

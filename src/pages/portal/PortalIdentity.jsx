import { useState } from 'react'
import { Camera, Check, Loader2, ShieldCheck } from 'lucide-react'
import { PageHead, Panel, Pill, Field, Loading, ErrorState, useToast } from '../../components/portal/ui'
import { api, compressImage, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'
import { cn } from '../../lib/utils'

const STATUS = {
  none: { tone: 'danger', label: 'Action required' },
  submitted: { tone: 'info', label: 'Under review' },
  verified: { tone: 'success', label: 'Verified' },
  rejected: { tone: 'danger', label: 'Resubmit needed' },
}

/** One image slot: picks, compresses and uploads immediately; shows a preview. */
function ImageSlot({ slot, label, hint, value, onChange, disabled }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const small = await compressImage(file, { max: 1600, quality: 0.8 })
      const { id } = await api.upload(`/identity/upload?slot=${slot}`, small)
      onChange(slot, { id, preview: URL.createObjectURL(small) })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">{label}</p>
      <label
        className={cn(
          'relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brass-600',
          value ? 'border-ink-800 bg-ink-50' : 'border-ink-900/30 bg-ink-50 hover:border-ink-700',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        {value ? (
          <>
            <img src={value.preview} alt={`${label} preview`} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-ink-800 text-white"><Check className="h-4 w-4" strokeWidth={3} /></span>
          </>
        ) : busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-brass-600" />
        ) : (
          <>
            <Camera className="h-6 w-6 text-ink-500" strokeWidth={1.5} />
            <span className="mt-2 px-3 text-[13px] font-medium text-ink-800">Choose or take a photo</span>
            <span className="mt-0.5 px-3 text-[11px] text-ink-500">{hint}</span>
          </>
        )}
        <input type="file" accept="image/*" capture={slot === 'selfie' ? 'user' : undefined} className="sr-only" onChange={pick} disabled={disabled} />
      </label>
      {error && <p role="alert" className="mt-1.5 text-[12px] text-red-700">{error}</p>}
    </div>
  )
}

export default function PortalIdentity() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/identity')
  const [images, setImages] = useState({})
  const [ssn, setSsn] = useState('')
  const [attest, setAttest] = useState(false)
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const st = STATUS[data.status] ?? STATUS.none
  const editable = data.status === 'none' || data.status === 'rejected'
  const complete = ['dlFront', 'dlBack', 'selfie'].every((k) => images[k])

  const setImage = (slot, v) => setImages((i) => ({ ...i, [slot]: v }))

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    if (!complete) return setFormError("Please add the front and back of your driver's license and your selfie.")
    if (!attest) return setFormError('Please confirm the statement below before submitting.')
    setBusy(true)
    try {
      await api.post('/identity', { ssn, files: Object.fromEntries(Object.entries(images).map(([k, v]) => [k, v.id])) })
      notify('Documents submitted. HR will review them within 1–2 business days.')
      reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHead
        eyebrow="Identity Verification"
        title="Verify your identity."
        description="Federal law requires every employee to verify their identity and work eligibility. Upload the front and back of your driver's license, a selfie for your ID card, and enter your Social Security number."
        actions={<Pill tone={st.tone}>{st.label}</Pill>}
      />

      {!editable ? (
        <Panel title={data.status === 'verified' ? 'Identity verified' : 'Submitted — awaiting review'} description={`Submitted ${fmtDate(data.submittedAt)}`} action={<Pill tone={st.tone}>{st.label}</Pill>}>
          <dl className="grid gap-5 text-[14px] sm:grid-cols-2">
            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Social Security</dt><dd className="mt-1 text-ink-900">{data.ssnMasked}</dd></div>
            <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Photos</dt><dd className="mt-1 text-ink-900">License front &amp; back, selfie for ID card</dd></div>
          </dl>
          <p className="mt-6 flex items-center gap-3 text-[14px] text-ink-700"><ShieldCheck className="h-5 w-5 text-brass-600" /> Your documents are stored securely and only visible to authorized HR staff.</p>
        </Panel>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-6">
          {data.status === 'rejected' && (
            <p role="alert" className="border border-red-300 bg-red-50 p-4 text-[14px] text-red-800">HR could not verify your documents{data.note ? `: ${data.note}` : '.'} Please resubmit clear photos.</p>
          )}

          <Panel title="Driver's license" description="Clear photos of the front and the back.">
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageSlot slot="dlFront" label="Front" hint="All four corners visible" value={images.dlFront} onChange={setImage} />
              <ImageSlot slot="dlBack" label="Back" hint="Barcode readable" value={images.dlBack} onChange={setImage} />
            </div>
          </Panel>

          <Panel title="Selfie for ID card" description="A clear photo of your face in good light.">
            <div className="max-w-xs"><ImageSlot slot="selfie" label="Selfie for ID card" hint="Face the camera, no sunglasses" value={images.selfie} onChange={setImage} /></div>
          </Panel>

          <Panel title="Social Security number" description="Type the 9 digits — no photo needed.">
            <Field id="ssn-number" label="Social Security number" className="max-w-sm"><input id="ssn-number" className="field" inputMode="numeric" maxLength={11} placeholder="XXX-XX-XXXX" value={ssn} onChange={(e) => setSsn(e.target.value)} autoComplete="off" /></Field>
          </Panel>

          <label className="flex items-start gap-3 text-[14px] text-ink-800">
            <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} className="mt-1 h-4 w-4 accent-ink-800" />
            I confirm that these documents are genuine and belong to me.
          </label>

          {formError && <p role="alert" className="border border-red-300 bg-red-50 p-3.5 text-[14px] text-red-800">{formError}</p>}
          <button className="btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit for verification'}</button>
        </form>
      )}
    </div>
  )
}

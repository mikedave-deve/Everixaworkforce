import { useState } from 'react'
import { Check, ArrowRight, Pause, PackageCheck, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { fmtDate, fmtDateTime } from '../../lib/format'
import BrandMark from '../BrandMark'

/**
 * Delivery tracker. Green while a shipment is moving, red (with the admin's reason)
 * while it is paused. Layout follows the courier-style reference: banner, tracking
 * number + estimated delivery, 4-step progress bar, ship-from / ship-to, details.
 */
function Address({ a }) {
  if (!a?.name) return <p className="text-[15px] text-ink-500">—</p>
  return (
    <address className="not-italic text-[15px] leading-relaxed text-ink-900">
      <span className="font-semibold">{a.name}</span><br />
      {a.address}<br />
      {a.city}{a.state ? `, ${a.state}` : ''} {a.zip}
    </address>
  )
}

function Step({ index, label, stage, paused, last }) {
  const done = index < stage || (index === stage && stage === 3 && !paused)
  const current = index === stage && !done
  const color = paused ? 'red' : 'green'
  return (
    <li className="relative flex flex-1 flex-col items-center text-center">
      {!last && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-1/2 top-[15px] h-0 w-full',
            index < stage ? (paused ? 'border-t-2 border-red-600' : 'border-t-2 border-emerald-700') : 'border-t-2 border-dotted border-ink-300'
          )}
        />
      )}
      <span
        className={cn(
          'relative z-10 flex h-[31px] w-[31px] items-center justify-center rounded-full border-2 bg-white',
          done && color === 'green' && 'border-emerald-700 bg-emerald-700 text-white',
          done && color === 'red' && 'border-red-600 bg-red-600 text-white',
          current && color === 'green' && 'border-emerald-700 text-emerald-700',
          current && color === 'red' && 'border-red-600 bg-red-600 text-white',
          !done && !current && 'border-ink-300 text-ink-300'
        )}
      >
        {done ? <Check className="h-4 w-4" strokeWidth={3} /> : current ? (paused ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <ArrowRight className="h-4 w-4" strokeWidth={2.5} />) : null}
      </span>
      <span className={cn('mt-3 inline-block pb-2 text-[13px] sm:text-[14px]', current ? 'border-b-[3px] border-brass-500 font-semibold text-ink-900' : done ? 'text-ink-800' : 'text-ink-500')}>
        {label}
      </span>
    </li>
  )
}

export default function ShipmentTracker({ shipment: s }) {
  const [showProgress, setShowProgress] = useState(false)
  const delivered = s.stage === 3 && !s.paused
  const eta = s.estimatedDelivery ? new Date(s.estimatedDelivery) : null
  const etaLong = eta
    ? `${eta.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} by ${eta.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : 'To be confirmed'

  return (
    <article className="overflow-hidden border border-ink-900/10 bg-white" aria-label={`Shipment ${s.tracking}`}>
      {/* Banner */}
      <div className="on-dark grain relative flex h-24 items-center justify-between overflow-hidden bg-gradient-to-r from-ink-950 via-ink-900 to-ink-800 px-6 sm:px-8">
        <BrandMark variant="dark" size="sm" />
        <div className="relative flex items-center gap-3 text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-300">Courier</p>
            <p className="font-display text-[1.15rem] leading-tight text-cream-50">{s.service || 'Everixa Courier'}</p>
          </div>
          <PackageCheck className="h-8 w-8 text-brass-300" strokeWidth={1.3} />
        </div>
      </div>

      {/* Tracking + ETA */}
      <div className="grid gap-6 border-b border-ink-900/10 px-6 py-6 sm:px-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-[14px] text-ink-600">Your shipment</p>
          <p className="font-num mt-1 break-all text-[1.9rem] leading-tight text-ink-900">{s.tracking}</p>
        </div>
        <div>
          <p className="text-[14px] text-ink-600">{delivered ? 'Delivered' : 'Estimated delivery'}</p>
          <p className={cn('mt-1 font-display text-[1.55rem] leading-tight', s.paused ? 'text-red-700' : 'text-emerald-700')}>
            {s.paused ? 'Delivery on hold' : delivered ? fmtDate(s.lastUpdated, { weekday: 'long', month: 'long', day: 'numeric' }) : etaLong}
          </p>
        </div>
      </div>

      {s.paused && (
        <div role="alert" className="flex items-start gap-4 border-b border-red-200 bg-red-50 px-6 py-5 sm:px-8">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <p className="font-display text-[1.3rem] leading-tight text-red-900">This shipment is paused</p>
            <p className="mt-1 text-[15px] leading-relaxed text-red-800">{s.pauseReason || 'Our team has placed a temporary hold on this package.'}</p>
            {s.pausedAt && <p className="mt-1 text-[12px] text-red-700/80">Paused {fmtDateTime(s.pausedAt)}</p>}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="border-b border-ink-900/10 px-4 py-8 sm:px-8">
        <ol className="flex items-start" aria-label="Shipment progress">
          {s.stages.map((label, i) => <Step key={label} index={i} label={label} stage={s.stage} paused={s.paused} last={i === s.stages.length - 1} />)}
        </ol>
        <p className="sr-only">Current status: {s.status}</p>
      </div>

      {/* Addresses + service */}
      <div className="grid divide-y divide-ink-900/10 border-b border-ink-900/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="px-6 py-6 sm:px-8"><p className="mb-3 text-[14px] text-ink-600">Ship From</p><Address a={s.from} /></div>
        <div className="px-6 py-6 sm:px-8"><p className="mb-3 text-[14px] text-ink-600">Ship To</p><Address a={s.to} /></div>
        <div className="px-6 py-6 sm:px-8">
          <p className="text-[14px] text-ink-600">Service</p>
          <p className="mb-5 mt-1 text-[15px] font-semibold text-ink-900">{s.service || 'Everixa Courier'}</p>
          <p className="text-[14px] text-ink-600">Weight</p>
          <p className="mt-1 text-[15px] font-semibold text-ink-900">{s.weightKg != null ? `${s.weightKg} kg` : '—'}</p>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-6 sm:px-8">
        <h3 className="mb-4 border-b border-ink-900/10 pb-4 font-display text-[1.4rem] text-ink-900">Shipment details</h3>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-[13px] text-ink-600">Tracking number</dt><dd className="mt-1 break-all text-[15px] font-semibold text-ink-900">{s.tracking}</dd></div>
          <div><dt className="text-[13px] text-ink-600">Reference number</dt><dd className="mt-1 text-[15px] font-semibold text-ink-900">{s.reference || '—'}</dd></div>
          <div><dt className="text-[13px] text-ink-600">Estimated delivery date</dt><dd className="mt-1 text-[15px] font-semibold text-ink-900">{eta ? fmtDate(eta, { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}</dd></div>
          <div><dt className="text-[13px] text-ink-600">Shipment progress</dt><dd className="mt-1"><button onClick={() => setShowProgress((v) => !v)} aria-expanded={showProgress} className="text-[15px] font-semibold text-ink-800 underline decoration-brass-500 decoration-2 underline-offset-4">{showProgress ? 'Hide progress' : 'View progress'}</button></dd></div>
        </dl>

        {showProgress && (
          <ol className="mt-6 space-y-4 border-l-2 border-ink-100 pl-6">
            {s.history.map((h, i) => (
              <li key={i} className="relative">
                <span aria-hidden="true" className={cn('absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full', h.event === 'Paused' ? 'bg-red-600' : 'bg-emerald-700')} />
                <p className="text-[15px] font-semibold text-ink-900">{h.event}</p>
                {h.note && <p className="text-[13px] text-red-700">{h.note}</p>}
                <p className="text-[12px] text-ink-500">{fmtDateTime(h.at)}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-ink-900/10 bg-ink-50 px-6 py-4 text-[13px] text-ink-700 sm:px-8">
        <span>Last updated: {fmtDateTime(s.lastUpdated)}</span>
        <span className={cn('inline-flex items-center gap-2 font-semibold', s.paused ? 'text-red-700' : 'text-emerald-700')}>
          <span className={cn('h-2 w-2 rounded-full', s.paused ? 'bg-red-600' : 'bg-emerald-600')} aria-hidden="true" />
          {s.status}
        </span>
      </div>
    </article>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Loader2, Mail, X } from 'lucide-react'
import { api } from '../../lib/api'
import { money } from '../../lib/format'

/** Two soft rising notes. Silent if audio is blocked or unavailable. */
function playSuccessChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const start = ctx.currentTime + 0.02
    ;[[659.25, 0], [987.77, 0.14]].forEach(([freq, offset]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start + offset)
      gain.gain.exponentialRampToValueAtTime(0.22, start + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.55)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start + offset)
      osc.stop(start + offset + 0.6)
    })
    setTimeout(() => ctx.close().catch(() => {}), 1500)
  } catch { /* audio is a nicety only */ }
}

function GreenTick() {
  return (
    <>
      <style>{`
        @keyframes tf-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.08); opacity: 1 } 100% { transform: scale(1) } }
        @keyframes tf-draw { to { stroke-dashoffset: 0 } }
        .tf-pop { animation: tf-pop .5s ease-out both }
        .tf-draw { stroke-dasharray: 30; stroke-dashoffset: 30; animation: tf-draw .45s .3s ease-out forwards }
        @media (prefers-reduced-motion: reduce) { .tf-pop, .tf-draw { animation: none; stroke-dashoffset: 0 } }
      `}</style>
      <div className="tf-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/30" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path className="tf-draw" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
    </>
  )
}

/**
 * Three-step transfer flow: amount → emailed confirmation code → success.
 * `onDone` runs after a successful transfer so the page can refresh the balance.
 */
export default function TransferDialog({ open, onClose, balance, bank, onDone }) {
  const [step, setStep] = useState('amount')
  const [amount, setAmount] = useState('')
  const [code, setCode] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setStep('amount'); setAmount(balance > 0 ? balance.toFixed(2) : ''); setCode(''); setError(''); setResult(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open, step])

  if (!open) return null

  const value = Number(amount)
  const amountOk = Number.isFinite(value) && value >= 1 && value <= balance

  const requestCode = async (e) => {
    e?.preventDefault()
    if (busy) return
    setError(''); setBusy(true)
    try {
      const res = await api.post('/pay/transfer/request', { amount: value })
      setSentTo(res.sentTo); setCode(''); setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (e) => {
    e.preventDefault()
    if (busy) return
    setError(''); setBusy(true)
    try {
      const res = await api.post('/pay/transfer/confirm', { code })
      setResult(res.transfer); setStep('done'); playSuccessChime(); onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const close = () => { if (!busy) onClose() }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-label="Transfer to bank" className="relative w-full max-w-md border border-ink-900/10 bg-cream-50 p-7 shadow-2xl">
        {step !== 'done' && (
          <button onClick={close} aria-label="Close" className="absolute right-3 top-3 p-2 text-ink-500 hover:text-ink-900"><X className="h-4 w-4" /></button>
        )}

        {step === 'amount' && (
          <form onSubmit={requestCode} noValidate>
            <p className="eyebrow">Transfer to bank</p>
            <h2 className="mt-2 font-display text-[1.8rem] leading-tight text-ink-900">Send your balance.</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-700/85">Funds go to <strong className="font-semibold text-ink-900">{bank}</strong>. We’ll email you a confirmation code to approve it.</p>
            <label htmlFor="tf-amount" className="mb-2 mt-6 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Amount (USD)</label>
            <div className="flex gap-2">
              <input id="tf-amount" ref={inputRef} className="field font-num !text-[1.2rem]" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} autoComplete="off" />
              <button type="button" onClick={() => setAmount(balance.toFixed(2))} className="btn-outline shrink-0">Max</button>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-600">Available balance: {money(balance)}</p>
            {error && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
            <button className="btn-primary mt-6 w-full" disabled={!amountOk || busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending code…</> : 'Send confirmation code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={confirm} noValidate>
            <p className="eyebrow">Confirmation code</p>
            <h2 className="mt-2 font-display text-[1.8rem] leading-tight text-ink-900">Check your email.</h2>
            <p className="mt-2 flex items-start gap-2 text-[14px] leading-relaxed text-ink-700/85">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass-600" />
              <span>We sent a 6-digit code to <strong className="font-semibold text-ink-900">{sentTo}</strong>. It expires in 10 minutes.</span>
            </p>
            <label htmlFor="tf-code" className="mb-2 mt-6 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Enter code</label>
            <input
              id="tf-code" ref={inputRef} className="field font-num text-center !text-[1.8rem] !tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••"
            />
            <p className="mt-3 text-center text-[13px] text-ink-700">
              Transferring <strong className="font-semibold text-ink-900">{money(value)}</strong> to {bank}
            </p>
            {error && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
            <button className="btn-primary mt-6 w-full" disabled={code.length !== 6 || busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming…</> : 'Confirm transfer'}
            </button>
            <div className="mt-4 flex justify-between text-[13px]">
              <button type="button" onClick={() => { setError(''); setStep('amount') }} className="text-ink-600 underline underline-offset-4 hover:text-ink-900">Change amount</button>
              <button type="button" onClick={requestCode} disabled={busy} className="text-ink-600 underline underline-offset-4 hover:text-ink-900">Resend code</button>
            </div>
          </form>
        )}

        {step === 'done' && result && (
          <div className="text-center" role="status">
            <GreenTick />
            <h2 className="mt-6 font-display text-[1.9rem] leading-tight text-ink-900">Transfer successful</h2>
            <p className="font-num mt-2 text-[2.2rem] leading-none text-ink-900">{money(result.amount)}</p>
            <p className="mt-2 text-[14px] text-ink-700/85">sent to {result.bank} ••••{result.last4}</p>
            <p className="mt-1 text-[12px] text-ink-600">Reference {result.reference}</p>
            <div className="mt-6 border-l-[3px] border-brass-500 bg-white p-4 text-left text-[13px] leading-relaxed text-ink-800">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-700">Important</p>
              Your bank may take 1–3 business days to show this transfer. We’ve emailed you a receipt. If you did not make this transfer, contact Everixa HR immediately.
            </div>
            <button onClick={onClose} className="btn-primary mt-6 w-full">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

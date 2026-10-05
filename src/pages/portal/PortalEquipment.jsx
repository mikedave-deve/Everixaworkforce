import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { PageHead } from '../../components/portal/ui'
import ShipmentTracker from '../../components/portal/ShipmentTracker'
import { api } from '../../lib/api'

export default function PortalEquipment() {
  const [params, setParams] = useSearchParams()
  const [value, setValue] = useState(params.get('t') ?? '')
  const [shipment, setShipment] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function track(raw) {
    const code = String(raw ?? '').trim()
    if (!code) return setError('Enter a tracking number.')
    setError('')
    setLoading(true)
    try {
      const { shipment: s } = await api.get(`/track/${encodeURIComponent(code)}`)
      setShipment(s)
      setParams({ t: s.tracking }, { replace: true })
    } catch (err) {
      setShipment(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Opening the page with ?t=... tracks it straight away.
  useEffect(() => {
    const t = params.get('t')
    if (t) track(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <PageHead
        eyebrow="Equipment & Logistics"
        title="Track a package."
        description="Enter the tracking number HR gave you to see where your equipment or documents are right now."
      />

      <form
        onSubmit={(e) => { e.preventDefault(); track(value) }}
        className="mb-8 flex flex-col gap-3 border border-ink-900/10 bg-white p-5 sm:flex-row sm:items-end sm:p-6"
        role="search"
      >
        <div className="flex-1">
          <label htmlFor="tracking" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Tracking number</label>
          <input id="tracking" className="field font-num !text-[1.1rem] !tracking-wide" placeholder="e.g. EW123456789012" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" spellCheck={false} />
        </div>
        <button type="submit" className="btn-primary sm:min-w-36" disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Tracking…</> : <><Search size={16} /> Track</>}
        </button>
      </form>

      {error && <p role="alert" className="mb-6 border border-red-300 bg-red-50 p-4 text-[14px] text-red-800">{error}</p>}
      {shipment && <ShipmentTracker shipment={shipment} />}
    </div>
  )
}

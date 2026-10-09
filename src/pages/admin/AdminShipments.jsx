import { useState } from 'react'
import { Copy, Download, Eye, Pause, Play, Plus, Trash2 } from 'lucide-react'
import { PageHead, Panel, Pill, Field, TableWrap, th, td, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import ShipmentTracker from '../../components/portal/ShipmentTracker'
import { api, downloadFile, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'

const STAGES = ['Label Created', 'On the Way', 'Out for Delivery', 'Delivered']
const HQ = { name: 'Everixa Workforce', address: '110 N Wacker Drive', city: 'Chicago', state: 'IL', zip: '60606' }
const emptyAddr = { name: '', address: '', city: '', state: '', zip: '' }

function AddressFields({ label, value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })
  return (
    <fieldset className="border border-ink-900/10 bg-white p-4">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-6">
        <input aria-label={`${label} name`} placeholder="Name or company" className="field sm:col-span-6" value={value.name} onChange={set('name')} />
        <input aria-label={`${label} street`} placeholder="Street address" className="field sm:col-span-6" value={value.address} onChange={set('address')} />
        <input aria-label={`${label} city`} placeholder="City" className="field sm:col-span-3" value={value.city} onChange={set('city')} />
        <input aria-label={`${label} state`} placeholder="State" className="field sm:col-span-1" value={value.state} onChange={set('state')} />
        <input aria-label={`${label} ZIP`} placeholder="ZIP" className="field sm:col-span-2" value={value.zip} onChange={set('zip')} />
      </div>
    </fieldset>
  )
}

function ShipmentForm({ employees, onDone }) {
  const notify = useToast()
  const [f, setF] = useState({ from: HQ, to: emptyAddr, service: 'Everixa Courier', weightKg: '', reference: '', eta: '', shippingCost: 0, assignedUserId: '', tracking: '' })
  const [items, setItems] = useState([{ description: '', qty: 1, unitPrice: 0 }])
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const setItem = (i, k, v) => setItems((list) => list.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
  const total = items.reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0) + (Number(f.shippingCost) || 0)

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { shipment } = await api.post('/admin/shipments', {
        from: f.from, to: f.to, service: f.service, weightKg: f.weightKg, reference: f.reference,
        estimatedDelivery: f.eta ? new Date(f.eta).toISOString() : null, items, shippingCost: f.shippingCost,
        assignedUserId: f.assignedUserId || null, tracking: f.tracking,
      })
      notify(`Package created. Tracking number ${shipment.tracking}`)
      onDone(shipment)
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={save} className="space-y-5">
      <AddressFields label="Ship to" value={f.to} onChange={(to) => setF((x) => ({ ...x, to }))} />
      <AddressFields label="Ship from" value={f.from} onChange={(from) => setF((x) => ({ ...x, from }))} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="s-service" label="Service"><input id="s-service" className="field" value={f.service} onChange={set('service')} /></Field>
        <Field id="s-ref" label="Reference number"><input id="s-ref" className="field" value={f.reference} onChange={set('reference')} /></Field>
        <Field id="s-weight" label="Weight (kg)"><input id="s-weight" type="number" min="0" step="0.01" className="field" value={f.weightKg} onChange={set('weightKg')} /></Field>
        <Field id="s-eta" label="Estimated delivery"><input id="s-eta" type="datetime-local" className="field" value={f.eta} onChange={set('eta')} /></Field>
        <Field id="s-emp" label="For employee (optional)">
          <select id="s-emp" className="field" value={f.assignedUserId} onChange={set('assignedUserId')}><option value="">— Not assigned —</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        </Field>
        <Field id="s-track" label="Tracking number" hint="Leave blank to generate one."><input id="s-track" className="field" value={f.tracking} onChange={set('tracking')} autoComplete="off" /></Field>
      </div>

      <fieldset className="border border-ink-900/10 bg-white p-4">
        <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Items (for the invoice)</legend>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_4.5rem_6rem_auto] gap-2">
              <input aria-label="Description" placeholder="Description" className="field" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
              <input aria-label="Quantity" type="number" min="1" className="field" value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} />
              <input aria-label="Unit price" type="number" min="0" step="0.01" placeholder="Price" className="field" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', e.target.value)} />
              <button type="button" aria-label="Remove item" disabled={items.length === 1} onClick={() => setItems((l) => l.filter((_, j) => j !== i))} className="px-2 text-ink-500 hover:text-red-700 disabled:opacity-30"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setItems((l) => [...l, { description: '', qty: 1, unitPrice: 0 }])} className="link-arrow mt-3 !text-[11px]"><Plus size={12} /> Add item</button>
        <div className="mt-4 flex items-end justify-between gap-4 border-t border-ink-900/10 pt-3">
          <Field id="s-ship" label="Shipping & handling ($)"><input id="s-ship" type="number" min="0" step="0.01" className="field !w-36" value={f.shippingCost} onChange={set('shippingCost')} /></Field>
          <p className="text-right text-[13px] text-ink-600">Invoice total<br /><span className="font-num text-[1.5rem] leading-none text-ink-900">{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p>
        </div>
      </fieldset>

      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={saving}>{saving ? 'Creating…' : 'Create package'}</button>
    </form>
  )
}

export default function AdminShipments() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/admin/shipments')
  const emps = useApi('/admin/employees?status=approved')
  const [creating, setCreating] = useState(false)
  const [preview, setPreview] = useState(null)
  const [pausing, setPausing] = useState(null)
  const [reason, setReason] = useState('')

  const [setStage] = useAction(async (s, stage) => {
    await api.patch(`/admin/shipments/${s.id}`, { stage })
    notify(`Marked “${STAGES[stage]}”.`)
    reload()
  })
  const [pause, pausingBusy] = useAction(async () => {
    await api.post(`/admin/shipments/${pausing.id}/pause`, { reason })
    notify('Shipment paused. Employees tracking it now see a red notice with your reason.')
    setPausing(null); setReason(''); reload()
  })
  const [resume] = useAction(async (s) => {
    await api.post(`/admin/shipments/${s.id}/resume`)
    notify('Shipment resumed.')
    reload()
  })
  const [remove] = useAction(async (s) => {
    if (!window.confirm(`Delete package ${s.tracking}? Its tracking page will stop working.`)) return
    await api.del(`/admin/shipments/${s.id}`)
    notify('Package deleted.')
    reload()
  })
  const copy = async (t) => { await navigator.clipboard?.writeText(t); notify('Tracking number copied.') }

  return (
    <div>
      <PageHead
        eyebrow="Shipments"
        title="Packages & tracking."
        description="Create a package, share its tracking number with the employee, move it along, and pause it with a reason if something goes wrong."
        actions={<button onClick={() => setCreating(true)} className="btn-primary"><Plus size={16} /> New package</button>}
      />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : data.shipments.length === 0 ? (
        <EmptyState title="No packages yet" body="Create a package to generate a tracking number and an invoice." />
      ) : (
        <Panel flush>
          <div className="px-6 pb-4 pt-3">
            <TableWrap min="56rem">
              <thead>
                <tr className="border-b border-ink-900/10"><th scope="col" className={th}>Tracking</th><th scope="col" className={th}>Ship to</th><th scope="col" className={th}>Status</th><th scope="col" className={th}>Move to</th><th scope="col" className={th}><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {data.shipments.map((s) => (
                  <tr key={s.id} className="border-b border-ink-900/10 align-top last:border-0">
                    <td className={td}>
                      <button onClick={() => copy(s.tracking)} className="group flex items-center gap-2 font-num text-[1.05rem] text-ink-900" title="Copy tracking number">{s.tracking}<Copy size={13} className="text-ink-400 group-hover:text-ink-800" /></button>
                      <p className="mt-0.5 text-[12px] text-ink-600">{s.invoiceNumber}{s.estimatedDelivery ? ` · ETA ${fmtDate(s.estimatedDelivery)}` : ''}</p>
                    </td>
                    <td className={td}><p className="font-medium text-ink-900">{s.to.name}</p><p className="text-[12px] text-ink-600">{s.to.city}, {s.to.state}</p></td>
                    <td className={td}>
                      {s.paused ? <Pill tone="danger">Paused</Pill> : <Pill tone={s.stage === 3 ? 'success' : 'info'}>{s.status}</Pill>}
                      {s.paused && <p className="mt-1 max-w-[14rem] text-[12px] text-red-700">{s.pauseReason}</p>}
                    </td>
                    <td className={td}>
                      <label className="sr-only" htmlFor={`st-${s.id}`}>Move to stage</label>
                      <select id={`st-${s.id}`} className="field !w-44 !py-2" value={s.stage} onChange={(e) => setStage(s, Number(e.target.value))}>{STAGES.map((l, i) => <option key={l} value={i}>{l}</option>)}</select>
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex flex-wrap justify-end gap-x-4 gap-y-2">
                        {s.paused
                          ? <button onClick={() => resume(s)} className="link-arrow !text-[11px]"><Play size={12} /> Resume</button>
                          : s.stage < 3 && <button onClick={() => { setPausing(s); setReason('') }} className="link-arrow !text-[11px] !text-red-700"><Pause size={12} /> Pause</button>}
                        <button onClick={() => setPreview(s)} className="link-arrow !text-[11px]"><Eye size={12} /> Preview</button>
                        <button onClick={() => downloadFile(`/admin/shipments/${s.id}/invoice`, `${s.invoiceNumber}.pdf`)} className="link-arrow !text-[11px]"><Download size={12} /> Invoice</button>
                        <button onClick={() => remove(s)} aria-label="Delete package" className="link-arrow !text-[11px] !text-red-700"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </Panel>
      )}

      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto bg-cream-50 p-0 sm:max-w-2xl">
          <div className="p-7">
            <SheetHeader className="p-0 pb-6"><p className="eyebrow">Package</p><SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">Create a package</SheetTitle></SheetHeader>
            <ShipmentForm employees={emps.data?.employees ?? []} onDone={() => { setCreating(false); reload() }} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(pausing)} onOpenChange={(o) => !o && setPausing(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          {pausing && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6"><p className="eyebrow">{pausing.tracking}</p><SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">Pause this shipment</SheetTitle></SheetHeader>
              <p className="mb-5 text-[14px] leading-relaxed text-ink-700">The tracker turns red for anyone who looks it up, and they will see the reason you write below.</p>
              <Field id="pause-reason" label="Reason"><textarea id="pause-reason" rows={4} className="field resize-none" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Address needs to be confirmed" /></Field>
              <button onClick={pause} disabled={pausingBusy || reason.trim().length < 3} className="btn mt-5 w-full bg-red-700 text-white hover:bg-red-800">Pause shipment</button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent side="right" className="w-full max-w-3xl overflow-y-auto bg-cream-50 p-0 sm:max-w-3xl">
          {preview && (
            <div className="p-6">
              <SheetHeader className="p-0 pb-5"><p className="eyebrow">What the employee sees</p><SheetTitle className="font-display text-[1.6rem] font-medium leading-tight text-ink-900">Tracker preview</SheetTitle></SheetHeader>
              <ShipmentTracker shipment={preview} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

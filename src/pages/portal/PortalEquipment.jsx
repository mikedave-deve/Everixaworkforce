import { useState } from 'react'
import { Truck, Check } from 'lucide-react'
import { PageHead, Panel, Pill, Field, TableWrap, th, td, EmptyState, useToast } from '../../components/portal/ui'
import { equipmentSeed, shipmentsSeed } from '../../data/employeePortal'
import { fmtDate, logActivity, usePortalState } from '../../lib/portalStore'
import { cn } from '../../lib/utils'

const REQUEST_TYPES = ['Replacement', 'Repair', 'Return', 'New equipment']

function Tracker({ shipment }) {
  return (
    <div className="border border-ink-900/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[1.3rem] leading-tight text-ink-900">{shipment.what}</p>
          <p className="mt-0.5 text-[12px] text-ink-600">{shipment.carrier} · {shipment.tracking}</p>
        </div>
        <div className="text-right">
          <Pill tone={shipment.stage === 4 ? 'success' : 'info'}>{shipment.status}</Pill>
          <p className="mt-1 text-[12px] text-ink-600">{shipment.stage === 4 ? 'Delivered' : 'ETA'} {fmtDate(shipment.eta, { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Shipment progress">
        {shipment.steps.map((s, i) => (
          <li key={s} className="min-w-0">
            <div className={cn('h-1', i <= shipment.stage ? 'bg-brass-500' : 'bg-ink-100')} />
            <p className={cn('mt-2 text-[10px] leading-tight sm:text-[11px]', i <= shipment.stage ? 'font-semibold text-ink-900' : 'text-ink-500')}>{s}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function PortalEquipment() {
  const notify = useToast()
  const [acked, setAcked] = usePortalState('equipmentAck', ['eq-badge', 'eq-headset', 'eq-vest'])
  const [reqs, setReqs] = usePortalState('equipmentReqs', [])
  const [form, setForm] = useState({ type: 'Replacement', item: equipmentSeed[0].id, note: '' })
  const shipments = shipmentsSeed()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function acknowledge(e) {
    setAcked((cur) => [...cur, e.id])
    logActivity('equipment', 'Equipment received', `${e.item} (${e.tag})`)
    notify(`Receipt confirmed for ${e.item}.`)
  }

  function submit(ev) {
    ev.preventDefault()
    const item = equipmentSeed.find((e) => e.id === form.item)
    setReqs((cur) => [{ id: `rq-${Date.now()}`, type: form.type, item: item.item, note: form.note, status: 'Submitted', at: new Date().toISOString() }, ...cur])
    logActivity('equipment', `${form.type} requested`, item.item)
    notify('Equipment request submitted. Logistics will confirm shipping details by email.')
    setForm((f) => ({ ...f, note: '' }))
  }

  return (
    <div>
      <PageHead
        eyebrow="Equipment & Logistics"
        title="Gear, shipments and returns."
        description="Everything issued to you, where your packages are, and how to request a replacement or return."
      />

      <Panel title="Assigned equipment" flush>
        <div className="px-6 pb-4">
          <TableWrap min="42rem">
            <thead>
              <tr className="border-b border-ink-900/10">
                <th scope="col" className={th}>Item</th>
                <th scope="col" className={th}>Asset tag</th>
                <th scope="col" className={th}>Issued</th>
                <th scope="col" className={th}>Condition</th>
                <th scope="col" className={th}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {equipmentSeed.map((e) => (
                <tr key={e.id} className="border-b border-ink-900/10 last:border-0">
                  <td className={`${td} font-medium`}>{e.item}</td>
                  <td className={`${td} tabular-nums text-ink-600`}>{e.tag}</td>
                  <td className={`${td} text-ink-600`}>{e.issued}</td>
                  <td className={td}>{e.condition}</td>
                  <td className={td}>
                    {acked.includes(e.id)
                      ? <Pill tone="success"><Check className="mr-1 h-3 w-3" strokeWidth={3} />Confirmed</Pill>
                      : <button onClick={() => acknowledge(e)} className="link-arrow !text-[11px]">Confirm receipt</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      </Panel>

      <div className="mt-6">
        <h2 className="mb-4 flex items-center gap-3 font-display text-[1.55rem] text-ink-900"><Truck className="h-5 w-5 text-brass-600" /> Shipments</h2>
        <div className="grid gap-4 md:grid-cols-2">{shipments.map((s) => <Tracker key={s.id} shipment={s} />)}</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel title="Request replacement or return" className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-5">
            <Field id="rq-type" label="Request type"><select id="rq-type" className="field" value={form.type} onChange={set('type')}>{REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field id="rq-item" label="Item"><select id="rq-item" className="field" value={form.item} onChange={set('item')}>{equipmentSeed.map((e) => <option key={e.id} value={e.id}>{e.item}</option>)}</select></Field>
            <Field id="rq-note" label="Details"><textarea id="rq-note" rows={3} required className="field resize-none" value={form.note} onChange={set('note')} placeholder="What happened, and where should we ship it?" /></Field>
            <button className="btn-primary w-full">Submit request</button>
          </form>
        </Panel>
        <Panel title="Your requests" className="lg:col-span-3" flush>
          <div className="px-6 pb-6">
            {reqs.length === 0 ? <EmptyState title="No requests" body="Replacement and return requests will be tracked here." /> : (
              <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
                {reqs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-4">
                    <div><p className="font-display text-[1.2rem] leading-tight text-ink-900">{r.type} — {r.item}</p><p className="mt-0.5 text-[12px] text-ink-600">{fmtDate(r.at)}</p></div>
                    <Pill tone="brass">{r.status}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHead, Panel, Field, TableWrap, th, td, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, downloadFile, useApi } from '../../lib/api'
import { addDays, fmtDate, isoDay, money } from '../../lib/format'

function lastFriday() {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 2) % 7))
  return d
}

function StubForm({ employee, stub, onDone }) {
  const notify = useToast()
  const pay = lastFriday()
  const [f, setF] = useState(
    stub
      ? { payDate: stub.payDate, periodStart: stub.periodStart, periodEnd: stub.periodEnd, regular: stub.regular, overtime: stub.overtime, bonus: stub.bonus ?? 0, rate: stub.rate }
      : { payDate: isoDay(pay), periodStart: isoDay(addDays(pay, -19)), periodEnd: isoDay(addDays(pay, -6)), regular: 80, overtime: 0, bonus: 0, rate: employee.hourlyRate || '' }
  )
  const [manual, setManual] = useState(Boolean(stub))
  const [taxes, setTaxes] = useState(stub?.taxes ?? {})
  const [deds, setDeds] = useState(stub?.deductions ?? {})
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const body = (extra = {}) => ({ userId: employee.id, ...f, ...(manual ? { taxes, deductions: deds } : {}), ...extra })

  // Live preview of the maths (server is the single source of truth).
  useEffect(() => {
    if (!f.rate && f.rate !== 0) return
    const t = setTimeout(() => {
      api.post('/admin/pay/preview', body()).then((r) => { setPreview(r.stub); setError('') }).catch((e) => setError(e.message))
    }, 280)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, manual, taxes, deds])

  function enableManual(on) {
    if (on && preview) { setTaxes(preview.taxes); setDeds(preview.deductions) }
    setManual(on)
  }

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    try {
      if (stub) await api.put(`/admin/pay/${stub.id}`, body())
      else await api.post('/admin/pay', body())
      notify(stub ? 'Pay statement updated.' : 'Pay statement posted. The employee can see it now.')
      onDone()
    } catch (err) {
      setError(err.message)
    }
  })

  const numInput = (map, setMap, k) => (
    <input aria-label={k} type="number" min="0" step="0.01" className="field !w-28 !py-1.5 text-right tabular-nums" value={map[k]} onChange={(e) => setMap({ ...map, [k]: e.target.value })} />
  )

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="p-date" label="Pay date"><input id="p-date" type="date" required className="field" value={f.payDate} onChange={set('payDate')} /></Field>
        <Field id="p-start" label="Period start"><input id="p-start" type="date" required className="field" value={f.periodStart} onChange={set('periodStart')} /></Field>
        <Field id="p-end" label="Period end"><input id="p-end" type="date" required className="field" value={f.periodEnd} onChange={set('periodEnd')} /></Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-4">
        <Field id="p-rate" label="Hourly rate ($)"><input id="p-rate" type="number" min="0" step="0.25" required className="field" value={f.rate} onChange={set('rate')} /></Field>
        <Field id="p-reg" label="Regular hours"><input id="p-reg" type="number" min="0" step="0.25" className="field" value={f.regular} onChange={set('regular')} /></Field>
        <Field id="p-ot" label="Overtime hours" hint="Paid at 1.5×"><input id="p-ot" type="number" min="0" step="0.25" className="field" value={f.overtime} onChange={set('overtime')} /></Field>
        <Field id="p-bonus" label="Bonus ($)"><input id="p-bonus" type="number" min="0" step="0.01" className="field" value={f.bonus} onChange={set('bonus')} /></Field>
      </div>

      <div className="border border-ink-900/10 bg-white p-5" aria-live="polite">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[1.3rem] text-ink-900">Preview</h3>
          <label className="flex items-center gap-2 text-[12px] text-ink-700"><input type="checkbox" className="h-4 w-4 accent-ink-800" checked={manual} onChange={(e) => enableManual(e.target.checked)} /> Edit taxes &amp; deductions</label>
        </div>
        {preview ? (
          <dl className="space-y-1.5 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-700">Gross pay</dt><dd className="font-semibold tabular-nums">{money(preview.gross)}</dd></div>
            {Object.entries(manual ? taxes : preview.taxes).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between"><dt className="text-ink-600">− {k}</dt><dd className="tabular-nums">{manual ? numInput(taxes, setTaxes, k) : money(v)}</dd></div>
            ))}
            {Object.entries(manual ? deds : preview.deductions).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between"><dt className="text-ink-600">− {k}</dt><dd className="tabular-nums">{manual ? numInput(deds, setDeds, k) : money(v)}</dd></div>
            ))}
            {manual && <button type="button" className="link-arrow !text-[11px]" onClick={() => { const n = window.prompt('Deduction name (e.g. Garnishment)'); if (n) setDeds({ ...deds, [n.slice(0, 60)]: 0 }) }}><Plus size={12} /> Add deduction</button>}
            <div className="flex justify-between border-t-2 border-ink-900 pt-3 text-[16px]"><dt className="font-semibold">Net pay</dt><dd className="font-num text-[1.5rem] leading-none">{money(preview.net)}</dd></div>
          </dl>
        ) : <p className="text-[13px] text-ink-600">Enter the hours and rate to see the statement.</p>}
      </div>

      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={saving || !preview}>{saving ? 'Saving…' : stub ? 'Save changes' : 'Post pay statement'}</button>
    </form>
  )
}

export default function AdminPay() {
  const notify = useToast()
  const emps = useApi('/admin/employees?status=approved')
  const [pickedUid, setUid] = useState('')
  const [editing, setEditing] = useState(undefined)
  const [rateEdit, setRateEdit] = useState(null)

  const employees = emps.data?.employees ?? []
  const uid = pickedUid || employees[0]?.id || ''
  const stubs = useApi(uid ? `/admin/pay?userId=${uid}` : null)
  const employee = employees.find((e) => e.id === uid)
  // Rate box: shows the saved rate until the admin types something for this employee.
  const rate = rateEdit?.uid === uid ? rateEdit.value : String(employee?.hourlyRate || '')
  const setRate = (value) => setRateEdit({ uid, value })

  const [saveRate, savingRate] = useAction(async () => {
    await api.patch(`/admin/employees/${uid}`, { hourlyRate: rate })
    notify('Hourly rate updated.')
    setRateEdit(null)
    emps.reload()
  })
  const [remove] = useAction(async (s) => {
    if (!window.confirm(`Delete the pay statement dated ${fmtDate(s.payDate)}? The employee will no longer see it.`)) return
    await api.del(`/admin/pay/${s.id}`)
    notify('Pay statement deleted.')
    stubs.reload()
  })

  if (emps.loading) return <Loading />
  if (emps.error) return <ErrorState error={emps.error} onRetry={emps.reload} />

  return (
    <div>
      <PageHead
        eyebrow="Pay"
        title="Employee pay."
        description="Set an hourly rate, then post pay statements. Taxes and benefit deductions are calculated for you and can be adjusted."
        actions={employee && <button onClick={() => setEditing(null)} className="btn-primary"><Plus size={16} /> New pay statement</button>}
      />

      {employees.length === 0 ? <EmptyState title="No active employees yet" body="Approve an account request first, then post their pay here." /> : (
        <>
          <Panel className="mb-6">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field id="pay-emp" label="Employee">
                <select id="pay-emp" className="field" value={uid} onChange={(e) => setUid(e.target.value)}>{employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.employeeId}</option>)}</select>
              </Field>
              <div className="flex items-end gap-3">
                <Field id="pay-rate" label="Hourly rate ($)"><input id="pay-rate" type="number" min="0" step="0.25" className="field !w-32" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
                <button onClick={saveRate} disabled={savingRate || rate === String(employee?.hourlyRate || '')} className="btn-outline">Update</button>
              </div>
            </div>
          </Panel>

          <Panel title="Pay statements" flush>
            <div className="px-6 pb-4">
              {stubs.loading ? <Loading /> : stubs.error ? <ErrorState error={stubs.error} onRetry={stubs.reload} /> : stubs.data.stubs.length === 0 ? (
                <EmptyState title="No pay statements yet" body="Post the first one with the button above." />
              ) : (
                <TableWrap min="42rem">
                  <thead>
                    <tr className="border-b border-ink-900/10"><th scope="col" className={th}>Pay date</th><th scope="col" className={th}>Period</th><th scope="col" className={`${th} text-right`}>Hours</th><th scope="col" className={`${th} text-right`}>Gross</th><th scope="col" className={`${th} text-right`}>Net</th><th scope="col" className={th}><span className="sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {stubs.data.stubs.map((s) => (
                      <tr key={s.id} className="border-b border-ink-900/10 last:border-0">
                        <td className={`${td} font-medium`}>{fmtDate(s.payDate)}</td>
                        <td className={`${td} text-ink-600`}>{fmtDate(s.periodStart, { month: 'short', day: 'numeric' })} – {fmtDate(s.periodEnd, { month: 'short', day: 'numeric' })}</td>
                        <td className={`${td} text-right tabular-nums`}>{s.regular + s.overtime}</td>
                        <td className={`${td} text-right tabular-nums`}>{money(s.gross)}</td>
                        <td className={`${td} text-right font-semibold tabular-nums`}>{money(s.net)}</td>
                        <td className={`${td} text-right`}>
                          <div className="flex justify-end gap-4">
                            <button onClick={() => setEditing(s)} className="link-arrow !text-[11px]"><Pencil size={12} /> Edit</button>
                            <button onClick={() => downloadFile(`/admin/pay/${s.id}/pdf`, `earnings-statement-${s.payDate}.pdf`)} className="link-arrow !text-[11px]"><Download size={12} /> PDF</button>
                            <button onClick={() => remove(s)} className="link-arrow !text-[11px] !text-red-700" aria-label="Delete"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </div>
          </Panel>
        </>
      )}

      <Sheet open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto bg-cream-50 p-0 sm:max-w-2xl">
          {editing !== undefined && employee && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">{employee.name}</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{editing ? 'Edit pay statement' : 'New pay statement'}</SheetTitle>
              </SheetHeader>
              <StubForm employee={employee} stub={editing} onDone={() => { setEditing(undefined); stubs.reload() }} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

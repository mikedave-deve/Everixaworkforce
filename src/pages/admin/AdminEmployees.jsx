import { useMemo, useState } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'
import { PageHead, Panel, Pill, Field, TableWrap, th, td, EmptyState, Loading, ErrorState, Avatar, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, useApi } from '../../lib/api'
import { fmtDate, money } from '../../lib/format'

const ID_TONE = { none: ['neutral', 'Not started'], submitted: ['info', 'Under review'], verified: ['success', 'Verified'], rejected: ['danger', 'Rejected'] }

function EmployeeDetail({ id, onClose, onSaved }) {
  const notify = useToast()
  const { data, loading, error } = useApi(id ? `/admin/employees/${id}` : null)
  const [form, setForm] = useState(null)
  const [reveal, setReveal] = useState(false)

  if (data && !form) {
    const e = data.employee
    setForm({ position: e.position, department: e.department, hourlyRate: e.hourlyRate, startDate: e.startDate ?? '', vacation: e.balances.vacation, sick: e.balances.sick, personal: e.balances.personal })
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    await api.patch(`/admin/employees/${id}`, {
      position: form.position, department: form.department, hourlyRate: form.hourlyRate, startDate: form.startDate || undefined,
      balances: { vacation: form.vacation, sick: form.sick, personal: form.personal },
    })
    notify('Employee updated.')
    onSaved()
  })

  return (
    <Sheet open={Boolean(id)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto bg-cream-50 p-0 sm:max-w-xl">
        <div className="p-7">
          {loading || !form ? (error ? <ErrorState error={error} /> : <Loading />) : (
            <>
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">{data.employee.employeeId}</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{data.employee.name}</SheetTitle>
                <p className="text-[13px] text-ink-600">{data.employee.email} · {data.employee.phone}</p>
              </SheetHeader>

              <form onSubmit={save} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="e-pos" label="Position"><input id="e-pos" className="field" value={form.position} onChange={set('position')} /></Field>
                  <Field id="e-dep" label="Department"><input id="e-dep" className="field" value={form.department} onChange={set('department')} /></Field>
                  <Field id="e-rate" label="Hourly rate ($)" hint="Used for new pay statements."><input id="e-rate" type="number" min="0" step="0.25" className="field" value={form.hourlyRate} onChange={set('hourlyRate')} /></Field>
                  <Field id="e-start" label="Start date"><input id="e-start" type="date" className="field" value={form.startDate} onChange={set('startDate')} /></Field>
                </div>
                <fieldset>
                  <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Yearly leave allowance (hours)</legend>
                  <div className="grid grid-cols-3 gap-4">
                    {['vacation', 'sick', 'personal'].map((k) => (
                      <div key={k}><label htmlFor={`b-${k}`} className="mb-1 block text-[12px] capitalize text-ink-600">{k}</label><input id={`b-${k}`} type="number" min="0" className="field" value={form[k]} onChange={set(k)} /></div>
                    ))}
                  </div>
                </fieldset>
                <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </form>

              <div className="mt-8 border-t border-ink-900/10 pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-[1.35rem] text-ink-900">Direct deposit</h3>
                  {data.directDeposit && <button onClick={() => setReveal((r) => !r)} className="link-arrow !text-[11px]">{reveal ? <><EyeOff size={13} /> Hide numbers</> : <><Eye size={13} /> Show numbers</>}</button>}
                </div>
                {data.directDeposit ? (
                  <dl className="grid gap-4 text-[14px] sm:grid-cols-2">
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Account holder</dt><dd className="mt-1 text-ink-900">{data.directDeposit.holder}</dd></div>
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Bank</dt><dd className="mt-1 text-ink-900">{data.directDeposit.bank}</dd></div>
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Account number</dt><dd className="mt-1 tabular-nums text-ink-900">{reveal ? data.directDeposit.account : data.directDeposit.accountMasked}</dd></div>
                    <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Routing number</dt><dd className="mt-1 tabular-nums text-ink-900">{reveal ? data.directDeposit.routing : '•••••••••'}</dd></div>
                  </dl>
                ) : <p className="text-[14px] text-ink-600">The employee hasn't added bank details yet.</p>}
              </div>

              {data.setup && (
                <div className="mt-8 border-t border-ink-900/10 pt-6">
                  <h3 className="mb-3 font-display text-[1.35rem] text-ink-900">Information on file</h3>
                  <dl className="space-y-2 text-[14px]">
                    {[['Name', `${data.setup.firstName} ${data.setup.lastName}`], ['Phone', data.setup.phone], ['Email', data.setup.email], ['Mailing address', data.setup.mailingAddress]].map(([k, v]) => (
                      <div key={k} className="flex gap-4"><dt className="w-32 shrink-0 text-ink-600">{k}</dt><dd className="text-ink-900">{v}</dd></div>
                    ))}
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function AdminEmployees() {
  const { data, error, loading, reload } = useApi('/admin/employees')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('approved')
  const [open, setOpen] = useState(null)

  const list = useMemo(() => (data?.employees ?? []).filter((e) => e.status === status && `${e.name} ${e.email} ${e.employeeId}`.toLowerCase().includes(query.toLowerCase())), [data, status, query])

  return (
    <div>
      <PageHead eyebrow="Employees" title="Your team." description="Everyone with a portal account. Click a person to set their hourly rate, position and leave allowance, or to see their bank and contact details." />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <Panel flush>
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-72">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <label htmlFor="emp-search" className="sr-only">Search employees</label>
              <input id="emp-search" type="search" placeholder="Search by name, email or ID" value={query} onChange={(e) => setQuery(e.target.value)} className="field !py-2.5 pl-11" />
            </div>
            <div className="flex gap-2" role="group" aria-label="Status">
              {[['approved', 'Active'], ['pending', 'Pending'], ['rejected', 'Rejected']].map(([k, l]) => (
                <button key={k} onClick={() => setStatus(k)} aria-pressed={status === k} className={`px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] ${status === k ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="border-t border-ink-900/10 px-6 pb-4">
            {list.length === 0 ? <div className="py-8"><EmptyState title="No employees here" body={status === 'pending' ? 'New requests are handled in Approvals.' : undefined} /></div> : (
              <TableWrap min="44rem">
                <thead>
                  <tr className="border-b border-ink-900/10">
                    <th scope="col" className={th}>Employee</th><th scope="col" className={th}>Position</th><th scope="col" className={`${th} text-right`}>Rate</th><th scope="col" className={th}>Identity</th><th scope="col" className={th}>Bank</th><th scope="col" className={th}><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.id} className="cursor-pointer border-b border-ink-900/10 last:border-0 hover:bg-ink-50" onClick={() => setOpen(e.id)}>
                      <td className={td}><div className="flex items-center gap-3"><Avatar user={e} size={36} /><div><p className="font-medium text-ink-900">{e.name}</p><p className="text-[12px] text-ink-600">{e.email} · joined {fmtDate(e.createdAt)}</p></div></div></td>
                      <td className={td}>{e.position}</td>
                      <td className={`${td} text-right tabular-nums`}>{e.hourlyRate ? money(e.hourlyRate) : <span className="text-ink-500">Not set</span>}</td>
                      <td className={td}><Pill tone={ID_TONE[e.identityStatus][0]}>{ID_TONE[e.identityStatus][1]}</Pill></td>
                      <td className={td}>{e.hasBank ? <Pill tone="success">On file</Pill> : <Pill>Missing</Pill>}</td>
                      <td className={`${td} text-right`}><button onClick={(ev) => { ev.stopPropagation(); setOpen(e.id) }} className="link-arrow !text-[11px]">Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        </Panel>
      )}

      <EmployeeDetail key={open ?? 'none'} id={open} onClose={() => setOpen(null)} onSaved={() => { reload() }} />
    </div>
  )
}

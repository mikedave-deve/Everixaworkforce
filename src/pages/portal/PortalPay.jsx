import { useState } from 'react'
import { Download, Landmark } from 'lucide-react'
import { PageHead, Panel, Stat, TableWrap, th, td, Pill, Field, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, downloadFile, useApi } from '../../lib/api'
import { fmtDate, money } from '../../lib/format'

function Breakdown({ title, rows, total, negative }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-700">{title}</h3>
      <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10 text-[14px]">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4 py-2.5"><span className="text-ink-700">{k}</span><span className="tabular-nums text-ink-900">{negative ? '−' : ''}{money(v)}</span></li>
        ))}
        <li className="flex justify-between gap-4 py-2.5 font-semibold"><span>{total[0]}</span><span className="tabular-nums">{negative ? '−' : ''}{money(total[1])}</span></li>
      </ul>
    </div>
  )
}

function DepositForm({ current, onSaved }) {
  const notify = useToast()
  const [form, setForm] = useState({ accountHolder: current?.holder ?? '', bankName: current?.bank ?? '', accountNumber: '', routingNumber: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/pay/direct-deposit', form)
      notify('Direct deposit saved. HR has been notified.')
      setForm((f) => ({ ...f, accountNumber: '', routingNumber: '' }))
      onSaved()
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={save} className="space-y-4" noValidate>
      <Field id="dd-holder" label="Account holder name"><input id="dd-holder" className="field" value={form.accountHolder} onChange={set('accountHolder')} autoComplete="off" /></Field>
      <Field id="dd-bank" label="Bank name"><input id="dd-bank" className="field" value={form.bankName} onChange={set('bankName')} autoComplete="off" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="dd-acct" label="Account number" hint={current ? `On file: ${current.accountMasked}. Leave blank to keep it.` : undefined}>
          <input id="dd-acct" className="field" inputMode="numeric" maxLength={17} value={form.accountNumber} onChange={set('accountNumber')} autoComplete="off" />
        </Field>
        <Field id="dd-routing" label="Routing number" hint={current ? `On file: ${current.routingMasked}.` : '9 digits, bottom-left of a check.'}>
          <input id="dd-routing" className="field" inputMode="numeric" maxLength={9} value={form.routingNumber} onChange={set('routingNumber')} autoComplete="off" />
        </Field>
      </div>
      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : current ? 'Update direct deposit' : 'Save direct deposit'}</button>
    </form>
  )
}

export default function PortalPay() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/pay')
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const [download, downloading] = useAction(async (stub) => {
    await downloadFile(`/pay/${stub.id}/pdf`, `earnings-statement-${stub.payDate}.pdf`)
    notify('Earnings statement downloaded.')
  })

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { stubs, ytd, directDeposit } = data

  return (
    <div>
      <PageHead eyebrow="Pay" title="Your earnings." description="Pay statements posted by Everixa payroll, year-to-date totals, and where your money goes." />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Next payday" value={data.nextPayday ? fmtDate(data.nextPayday, { month: 'short', day: 'numeric' }) : '—'} hint="Direct deposit" />
        <Stat label="YTD gross" value={money(ytd.gross).replace('.00', '')} hint={`${ytd.periods} pay period${ytd.periods === 1 ? '' : 's'}`} />
        <Stat label="YTD taxes" value={money(ytd.taxes).replace('.00', '')} hint="Federal, FICA, state" />
        <Stat label="YTD net" value={money(ytd.net).replace('.00', '')} hint={`Hourly rate ${money(data.rate)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Pay statements" flush className="lg:col-span-2" description="Select a statement to see the full breakdown.">
          <div className="px-6 pb-4">
            {stubs.length === 0 ? (
              <EmptyState title="No pay statements yet" body="Statements appear here after Everixa payroll posts them." />
            ) : (
              <TableWrap>
                <thead>
                  <tr className="border-b border-ink-900/10">
                    <th scope="col" className={th}>Pay date</th>
                    <th scope="col" className={th}>Period</th>
                    <th scope="col" className={`${th} text-right`}>Gross</th>
                    <th scope="col" className={`${th} text-right`}>Net</th>
                    <th scope="col" className={th}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {stubs.map((s) => (
                    <tr key={s.id} className="border-b border-ink-900/10 last:border-0">
                      <td className={`${td} font-medium`}>{fmtDate(s.payDate)}</td>
                      <td className={`${td} text-ink-600`}>{fmtDate(s.periodStart, { month: 'short', day: 'numeric' })} – {fmtDate(s.periodEnd, { month: 'short', day: 'numeric' })}</td>
                      <td className={`${td} text-right tabular-nums`}>{money(s.gross)}</td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>{money(s.net)}</td>
                      <td className={`${td} text-right`}><button onClick={() => setSelected(s)} className="link-arrow !text-[11px]">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Direct deposit">
            {directDeposit ? (
              <div className="flex items-center gap-3">
                <Landmark className="h-6 w-6 text-brass-600" strokeWidth={1.5} />
                <div>
                  <p className="text-[15px] font-medium text-ink-900">{directDeposit.bank} {directDeposit.accountMasked}</p>
                  <p className="text-[12px] text-ink-600">{directDeposit.holder} · 100% of net pay</p>
                </div>
              </div>
            ) : (
              <p className="text-[14px] leading-relaxed text-ink-700/85">Add your bank details so your pay can be deposited.</p>
            )}
            <button onClick={() => setFormOpen(true)} className="link-arrow mt-5">{directDeposit ? 'Update account' : 'Add account'}</button>
          </Panel>
        </div>
      </div>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          <div className="p-7">
            <SheetHeader className="p-0 pb-6">
              <p className="eyebrow">Direct deposit</p>
              <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{directDeposit ? 'Update your account' : 'Add your account'}</SheetTitle>
            </SheetHeader>
            <DepositForm current={directDeposit} onSaved={() => { setFormOpen(false); reload() }} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          {selected && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">Earnings statement</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{fmtDate(selected.payDate, { month: 'long', day: 'numeric', year: 'numeric' })}</SheetTitle>
                <p className="text-[13px] text-ink-600">Period {fmtDate(selected.periodStart)} – {fmtDate(selected.periodEnd)}</p>
              </SheetHeader>

              <Breakdown title="Earnings" rows={[
                [`Regular · ${Number(selected.regular).toFixed(1)} h × ${money(selected.rate)}`, selected.regular * selected.rate],
                ...(selected.overtime ? [[`Overtime · ${Number(selected.overtime).toFixed(1)} h × ${money(selected.rate * 1.5)}`, selected.overtime * selected.rate * 1.5]] : []),
                ...(selected.bonus ? [['Bonus / adjustment', selected.bonus]] : []),
              ]} total={['Gross pay', selected.gross]} />
              <Breakdown title="Taxes" negative rows={Object.entries(selected.taxes)} total={['Total taxes', selected.totalTaxes]} />
              {Object.keys(selected.deductions).length > 0 && <Breakdown title="Deductions" negative rows={Object.entries(selected.deductions)} total={['Total deductions', selected.totalDeductions]} />}

              <div className="mt-6 flex items-baseline justify-between border-t-2 border-ink-900 pt-4">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-700">Net pay</span>
                <span className="font-num text-[2rem] text-ink-900">{money(selected.net)}</span>
              </div>
              <button onClick={() => download(selected)} disabled={downloading} className="btn-primary mt-8 w-full"><Download size={16} /> Download PDF statement</button>
              <p className="mt-3 text-center"><Pill>Posted by Everixa payroll</Pill></p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

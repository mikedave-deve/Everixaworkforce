import { useMemo, useState } from 'react'
import { Download, Landmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHead, Panel, Stat, TableWrap, th, td, Pill, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { buildPayStubs, nextPayday, HOURLY_RATE } from '../../data/employeePortal'
import { downloadText, fmtDate, logActivity, money, usePortalState } from '../../lib/portalStore'
import { getSession } from '../../lib/auth'

function stubText(stub, session) {
  const line = (k, v) => `${k.padEnd(34)}${v}`
  return [
    'EVERIXA WORKFORCE — EARNINGS STATEMENT (DEMO)',
    `Employee: ${session?.name}   ID: ${session?.employeeId ?? '—'}`,
    `Pay date: ${stub.payDate}   Period: ${stub.periodStart} – ${stub.periodEnd}`,
    '',
    line('Regular hours', `${stub.regular.toFixed(2)} @ ${money(stub.rate)}`),
    line('Overtime hours', `${stub.overtime.toFixed(2)} @ ${money(stub.rate * 1.5)}`),
    line('GROSS PAY', money(stub.gross)),
    '',
    'TAXES',
    ...Object.entries(stub.taxes).map(([k, v]) => line(k, `-${money(v)}`)),
    '',
    'DEDUCTIONS',
    ...Object.entries(stub.deductions).map(([k, v]) => line(k, `-${money(v)}`)),
    '',
    line('NET PAY', money(stub.net)),
  ].join('\n')
}

export default function PortalPay() {
  const notify = useToast()
  const session = getSession()
  const stubs = useMemo(() => buildPayStubs(10), [])
  const [selected, setSelected] = useState(null)
  const [setup] = usePortalState('setup', {})

  const year = new Date().getFullYear()
  const ytd = stubs.filter((s) => s.payDate.startsWith(String(year)))
  const ytdGross = ytd.reduce((a, s) => a + s.gross, 0)
  const ytdNet = ytd.reduce((a, s) => a + s.net, 0)
  const ytdTax = ytd.reduce((a, s) => a + s.totalTaxes, 0)
  const last4 = setup.data?.accountLast4 ?? '4821'

  function download(stub) {
    downloadText(`earnings-statement-${stub.payDate}.txt`, stubText(stub, session))
    logActivity('pay', 'Pay statement downloaded', fmtDate(stub.payDate))
    notify('Earnings statement downloaded.')
  }

  return (
    <div>
      <PageHead
        eyebrow="Pay"
        title="Your earnings."
        description="Pay statements, year-to-date totals and where your money goes. Figures shown are demonstration data."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Next payday" value={fmtDate(nextPayday(), { month: 'short', day: 'numeric' })} hint="Direct deposit" />
        <Stat label="YTD gross" value={money(ytdGross).replace('.00', '')} hint={`${ytd.length} pay periods`} />
        <Stat label="YTD taxes" value={money(ytdTax).replace('.00', '')} hint="Federal, FICA, state" />
        <Stat label="YTD net" value={money(ytdNet).replace('.00', '')} hint={`Hourly rate ${money(HOURLY_RATE)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Pay statements" flush className="lg:col-span-2" description="Select a statement to see the full breakdown.">
          <div className="px-6 pb-4">
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
                    <td className={`${td} font-medium`}>{fmtDate(s.payDate, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className={`${td} text-ink-600`}>{fmtDate(s.periodStart, { month: 'short', day: 'numeric' })} – {fmtDate(s.periodEnd, { month: 'short', day: 'numeric' })}</td>
                    <td className={`${td} text-right tabular-nums`}>{money(s.gross)}</td>
                    <td className={`${td} text-right font-semibold tabular-nums`}>{money(s.net)}</td>
                    <td className={`${td} text-right`}>
                      <button onClick={() => setSelected(s)} className="link-arrow !text-[11px]">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Direct deposit">
            <div className="flex items-center gap-3">
              <Landmark className="h-6 w-6 text-brass-600" strokeWidth={1.5} />
              <div>
                <p className="text-[15px] font-medium text-ink-900">Checking ••••{last4}</p>
                <p className="text-[12px] text-ink-600">100% of net pay</p>
              </div>
            </div>
            <Link to="/portal/setup" className="link-arrow mt-5">Update account</Link>
          </Panel>
          <Panel title="Tax withholding">
            <p className="text-[14px] leading-relaxed text-ink-700/85">Your federal and state withholding are based on the W-4 on file.</p>
            <Link to="/portal/tax-forms" className="link-arrow mt-5">Manage W-4</Link>
          </Panel>
        </div>
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-cream-50 p-0 sm:max-w-md">
          {selected && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">Earnings statement</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">
                  {fmtDate(selected.payDate, { month: 'long', day: 'numeric', year: 'numeric' })}
                </SheetTitle>
                <p className="text-[13px] text-ink-600">Period {fmtDate(selected.periodStart)} – {fmtDate(selected.periodEnd)}</p>
              </SheetHeader>

              <Breakdown title="Earnings" rows={[
                [`Regular · ${selected.regular.toFixed(1)} h × ${money(selected.rate)}`, selected.regular * selected.rate],
                ...(selected.overtime ? [[`Overtime · ${selected.overtime.toFixed(1)} h × ${money(selected.rate * 1.5)}`, selected.overtime * selected.rate * 1.5]] : []),
              ]} total={['Gross pay', selected.gross]} />
              <Breakdown title="Taxes" negative rows={Object.entries(selected.taxes)} total={['Total taxes', selected.totalTaxes]} />
              <Breakdown title="Deductions" negative rows={Object.entries(selected.deductions)} total={['Total deductions', selected.totalDeductions]} />

              <div className="mt-6 flex items-baseline justify-between border-t-2 border-ink-900 pt-4">
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-700">Net pay</span>
                <span className="font-num text-[2rem] text-ink-900">{money(selected.net)}</span>
              </div>
              <button onClick={() => download(selected)} className="btn-primary mt-8 w-full"><Download size={16} /> Download statement</button>
              <p className="mt-3 text-center text-[11px] text-ink-500"><Pill>Demo data</Pill></p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

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

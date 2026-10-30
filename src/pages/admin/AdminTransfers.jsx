import { useMemo, useState } from 'react'
import { Undo2 } from 'lucide-react'
import { PageHead, Panel, Pill, Field, TableWrap, th, td, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, useApi } from '../../lib/api'
import { fmtDate, money } from '../../lib/format'

function ReverseForm({ transfer, onDone }) {
  const notify = useToast()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const [submit, saving] = useAction(async (e) => {
    e.preventDefault()
    try {
      await api.post(`/admin/transfers/${transfer.id}/reverse`, { reason })
      notify('Transfer reversed. The employee has been emailed the reason.')
      onDone()
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={submit} className="space-y-5">
      <dl className="space-y-2 border border-ink-900/10 bg-white p-4 text-[14px]">
        {[['Employee', `${transfer.employee} (${transfer.employeeId})`], ['Amount', money(transfer.amount)], ['Sent to', transfer.bankLabel], ['Reference', transfer.reference], ['Made on', fmtDate(transfer.createdAt)]].map(([k, v]) => (
          <div key={k} className="flex gap-4"><dt className="w-28 shrink-0 text-ink-600">{k}</dt><dd className="text-ink-900">{v}</dd></div>
        ))}
      </dl>
      <p className="text-[13px] leading-relaxed text-ink-600">Reversing cancels this transfer and puts {money(transfer.amount)} back into the employee&apos;s available balance.</p>
      <Field id="rev-reason" label="Reason for the reversal" hint="The employee sees this on their Pay page and receives it by email, so write it clearly.">
        <textarea id="rev-reason" required minLength={5} maxLength={600} rows={5} className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. The bank account details on file could not be verified. Please re-enter your account number and try again." />
      </Field>
      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={saving || reason.trim().length < 5}>{saving ? 'Reversing…' : 'Reverse transfer & notify employee'}</button>
    </form>
  )
}

export default function AdminTransfers() {
  const { data, error, loading, reload } = useApi('/admin/transfers')
  const [status, setStatus] = useState('completed')
  const [target, setTarget] = useState(null)

  const list = useMemo(() => (data?.transfers ?? []).filter((t) => (t.status ?? 'completed') === status), [data, status])

  return (
    <div>
      <PageHead eyebrow="Transfers" title="Pay transfers." description="Every transfer employees make to their bank. Reverse one to return the money to their balance, and tell them why." />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <Panel flush>
          <div className="flex gap-2 p-6" role="group" aria-label="Status">
            {[['completed', 'Completed'], ['reversed', 'Reversed']].map(([k, l]) => (
              <button key={k} onClick={() => setStatus(k)} aria-pressed={status === k} className={`px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] ${status === k ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100'}`}>{l}</button>
            ))}
          </div>
          <div className="border-t border-ink-900/10 px-6 pb-4">
            {list.length === 0 ? <div className="py-8"><EmptyState title={status === 'reversed' ? 'No reversed transfers' : 'No transfers yet'} /></div> : (
              <TableWrap min="48rem">
                <thead>
                  <tr className="border-b border-ink-900/10">
                    <th scope="col" className={th}>Employee</th><th scope="col" className={th}>Date</th><th scope="col" className={th}>Reference</th><th scope="col" className={th}>Bank</th><th scope="col" className={`${th} text-right`}>Amount</th><th scope="col" className={th}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.id} className="border-b border-ink-900/10 last:border-0">
                      <td className={td}><p className="font-medium text-ink-900">{t.employee}</p><p className="text-[12px] text-ink-600">{t.employeeId}</p></td>
                      <td className={`${td} text-ink-600`}>{fmtDate(t.createdAt)}</td>
                      <td className={`${td} font-mono text-[13px]`}>{t.reference}</td>
                      <td className={td}>{t.bankLabel}</td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>{money(t.amount)}</td>
                      <td className={`${td} text-right`}>
                        {t.status === 'reversed' ? (
                          <div className="text-left sm:text-right"><Pill tone="danger">Reversed</Pill><p className="mt-1 max-w-[16rem] text-[12px] text-ink-600">{t.reversalReason}</p></div>
                        ) : (
                          <button onClick={() => setTarget(t)} className="link-arrow !text-[11px] !text-red-700"><Undo2 size={12} /> Reverse</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        </Panel>
      )}

      <Sheet open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto bg-cream-50 p-0 sm:max-w-lg">
          {target && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">Reverse transfer</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">Cancel this transfer?</SheetTitle>
              </SheetHeader>
              <ReverseForm transfer={target} onDone={() => { setTarget(null); reload() }} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

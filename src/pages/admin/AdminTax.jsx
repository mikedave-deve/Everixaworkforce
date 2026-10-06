import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { PageHead, Panel, Pill, EmptyState, Loading, ErrorState } from '../../components/portal/ui'
import { ApprovalCard } from './AdminApprovals'
import { openFile, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'
import { cn } from '../../lib/utils'

const STATUS = { pending: ['brass', 'Waiting for you'], approved: ['success', 'Approved'], rejected: ['danger', 'Rejected'] }

/** Everything employees asked for on the Tax Forms page — preview the exact PDF, then approve or reject. */
export default function AdminTax() {
  const { data, error, loading, reload } = useApi('/admin/tax')
  const [filter, setFilter] = useState('pending')

  const forms = useMemo(() => data?.forms ?? [], [data])
  const counts = { pending: 0, approved: 0, rejected: 0 }
  forms.forEach((f) => (counts[f.status] += 1))
  const shown = filter === 'all' ? forms : forms.filter((f) => f.status === filter)

  return (
    <div>
      <PageHead
        eyebrow="Tax Forms"
        title="Approve what employees download."
        description="Open the exact Everixa-styled PDF the employee would get, check it, then approve or reject. Each request comes with an automatic checklist."
      />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : forms.length === 0 ? (
        <EmptyState title="No tax form requests yet" body="When an employee submits a W-4 or requests a W-2 or 1095-C, it appears here." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {[['pending', 'Waiting'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={cn('px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors', filter === k ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100')}>
                {l} <span className="ml-1 opacity-70">{k === 'all' ? forms.length : counts[k]}</span>
              </button>
            ))}
          </div>

          {shown.length === 0 ? <EmptyState title="Nothing here" /> : (
            <div className="space-y-5">
              {shown.map((f) =>
                f.status === 'pending' ? (
                  <ApprovalCard
                    key={f.id}
                    item={{ type: 'tax', id: f.id, title: f.title, employee: f.employee, summary: f.summary, submittedAt: f.requestedAt, checks: f.checks, recommendation: f.recommendation ?? 'review', suggestedNote: f.suggestedNote }}
                    onDone={reload}
                    openIdentity={() => {}}
                  />
                ) : (
                  <Panel key={f.id}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-[1.4rem] leading-tight text-ink-900">{f.title}</p>
                        <p className="mt-1 text-[14px] text-ink-700">{f.employee?.name}{f.employee?.employeeId ? ` · ${f.employee.employeeId}` : ''}</p>
                        {f.status === 'rejected' && f.reviewNote && <p className="mt-1 text-[13px] text-red-700">Reason: {f.reviewNote}</p>}
                        <p className="mt-1 text-[12px] text-ink-500">{f.reviewedAt ? `${STATUS[f.status][1]} ${fmtDate(f.reviewedAt)}` : `Requested ${fmtDate(f.requestedAt)}`}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Pill tone={STATUS[f.status][0]}>{STATUS[f.status][1]}</Pill>
                        <button onClick={() => openFile(`/admin/tax/${f.id}/pdf`)} className="link-arrow !text-[11px]"><FileText size={13} /> View PDF</button>
                      </div>
                    </div>
                  </Panel>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

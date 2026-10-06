import { useMemo, useState } from 'react'
import { Check, AlertTriangle, X, Eye, FileText } from 'lucide-react'
import { PageHead, Panel, Pill, EmptyState, Loading, ErrorState, AuthImage, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, openFile, useApi } from '../../lib/api'
import { fmtDateTime } from '../../lib/format'
import { TYPE_LABEL, decideApproval } from '../../lib/admin'
import { cn } from '../../lib/utils'

const REC = {
  approve: { tone: 'success', label: 'Recommended: approve', hint: 'Every automatic check passed.' },
  review: { tone: 'brass', label: 'Needs a look', hint: 'Passed the hard checks, but something deserves your attention.' },
  reject: { tone: 'danger', label: 'Recommended: reject', hint: 'A check failed — a reason is pre-filled for you.' },
}
const CHECK_ICON = { ok: [Check, 'text-emerald-700', 'bg-emerald-100'], warn: [AlertTriangle, 'text-amber-700', 'bg-amber-100'], fail: [X, 'text-red-700', 'bg-red-100'] }
const IMAGE_LABELS = { dlFront: "Driver's license · front", dlBack: "Driver's license · back", selfie: 'Selfie for ID card' }

function IdentityViewer({ userId, onClose }) {
  const { data, error } = useApi(userId ? `/admin/identity/${userId}` : null)
  return (
    <Sheet open={Boolean(userId)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto bg-cream-50 p-0 sm:max-w-xl">
        <div className="p-7">
          <SheetHeader className="p-0 pb-6">
            <p className="eyebrow">Identity documents</p>
            <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{data?.employee?.name ?? 'Loading…'}</SheetTitle>
          </SheetHeader>
          {!data ? (error ? <ErrorState error={error} /> : <Loading />) : (
            <>
              <dl className="mb-6 grid grid-cols-1 gap-4 border border-ink-900/10 bg-white p-5 text-[15px]">
                <div><dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-600">Social Security no.</dt><dd className="mt-1 font-semibold tabular-nums text-ink-900">{data.ssn.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3')}</dd></div>
              </dl>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(IMAGE_LABELS).map(([slot, label]) => (
                  <figure key={slot}>
                    <button type="button" onClick={() => openFile(`/files/${data.files[slot]}`)} className="block w-full border border-ink-900/10 bg-white" aria-label={`Open ${label} full size`}>
                      <AuthImage fileId={data.files[slot]} alt={label} className="aspect-[4/3] w-full object-cover" style={undefined} />
                    </button>
                    <figcaption className="mt-1.5 text-[12px] text-ink-600">{label}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-6 text-[12px] leading-relaxed text-ink-600">Compare the name and numbers on the documents with the employee's record. Click an image to open it full size.</p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ApprovalCard({ item, onDone, openIdentity }) {
  const notify = useToast()
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState(item.suggestedNote)
  const rec = REC[item.recommendation]

  const [approve, approving] = useAction(async () => {
    await decideApproval(item.type, item.id, 'approve', '')
    notify(`${TYPE_LABEL[item.type]} approved.`)
    onDone()
  })
  const [reject, rejectingBusy] = useAction(async () => {
    await decideApproval(item.type, item.id, 'reject', note)
    notify(`${TYPE_LABEL[item.type]} rejected. The employee will see your reason.`)
    onDone()
  })

  return (
    <Panel className={cn(item.recommendation === 'reject' && 'border-red-300', item.recommendation === 'approve' && 'border-emerald-300')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-700">{TYPE_LABEL[item.type]}</p>
          <h3 className="mt-1 font-display text-[1.5rem] leading-tight text-ink-900">{item.title}</h3>
          <p className="mt-1 text-[14px] text-ink-700">{item.employee?.name}{item.employee?.employeeId ? ` · ${item.employee.employeeId}` : ''}</p>
          <p className="mt-0.5 break-words text-[13px] text-ink-600">{item.summary}</p>
        </div>
        <div className="text-right">
          <Pill tone={rec.tone}>{rec.label}</Pill>
          <p className="mt-1.5 text-[11px] text-ink-500">Submitted {fmtDateTime(item.submittedAt)}</p>
        </div>
      </div>

      <ul className="mt-5 grid gap-x-8 gap-y-2.5 border-y border-ink-900/10 py-4 sm:grid-cols-2" aria-label="Automatic checks">
        {item.checks.map((c, i) => {
          const [Icon, text, bg] = CHECK_ICON[c.status]
          return (
            <li key={i} className="flex items-start gap-3 text-[13px]">
              <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center', bg, text)}><Icon className="h-3 w-3" strokeWidth={3} /></span>
              <span className="text-ink-800"><span className="font-medium">{c.label}</span>{c.detail && <span className="block text-[12px] text-ink-600">{c.detail}</span>}</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[12px] text-ink-600">{rec.hint}</p>

      {rejecting ? (
        <div className="mt-5">
          <label htmlFor={`note-${item.id}`} className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Reason shown to the employee</label>
          <textarea id={`note-${item.id}`} rows={2} className="field resize-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Briefly explain what needs to change" />
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={reject} disabled={rejectingBusy || !note.trim()} className="btn bg-red-700 text-white hover:bg-red-800">Confirm rejection</button>
            <button onClick={() => setRejecting(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          {item.type === 'identity' && <button onClick={() => openIdentity(item.employee.id)} className="btn-outline"><Eye size={16} /> View documents</button>}
          {item.type === 'tax' && <button onClick={() => openFile(`/admin/tax/${item.id}/pdf`)} className="btn-outline"><FileText size={16} /> Preview the PDF</button>}
          <button onClick={approve} disabled={approving} className="btn-primary"><Check size={16} /> Approve</button>
          <button onClick={() => setRejecting(true)} className="btn-outline">Reject…</button>
        </div>
      )}
    </Panel>
  )
}

export default function AdminApprovals() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/admin/approvals')
  const [filter, setFilter] = useState('all')
  const [identityUser, setIdentityUser] = useState(null)

  const items = useMemo(() => data?.items ?? [], [data])
  const types = ['all', ...Object.keys(TYPE_LABEL).filter((t) => items.some((i) => i.type === t))]
  const shown = filter === 'all' ? items : items.filter((i) => i.type === filter)
  const bulk = shown.filter((i) => i.recommendation === 'approve' && i.type !== 'identity')

  const [approveAll, bulkBusy] = useAction(async () => {
    if (!window.confirm(`Approve ${bulk.length} request${bulk.length > 1 ? 's' : ''} that passed every check?`)) return
    for (const i of bulk) await api.post(`/admin/approvals/${i.type}/${i.id}`, { decision: 'approve' })
    notify(`${bulk.length} approved.`)
    window.dispatchEvent(new Event('everixa:admin-changed'))
    reload()
  })

  return (
    <div>
      <PageHead
        eyebrow="Approvals"
        title="Review & decide."
        description="Every request is checked automatically. Green means safe to approve, amber means look closer, red means something failed — with a reason already written for you."
        actions={bulk.length > 1 && <button onClick={approveAll} disabled={bulkBusy} className="btn-primary"><Check size={16} /> Approve {bulk.length} that look good</button>}
      />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
        <EmptyState title="All caught up" body="New account requests, timesheets, time off, tax forms, benefits and identity checks appear here." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            {types.map((t) => (
              <button key={t} onClick={() => setFilter(t)} aria-pressed={filter === t} className={cn('px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors', filter === t ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100')}>
                {t === 'all' ? 'All' : TYPE_LABEL[t]} <span className="ml-1 opacity-70">{t === 'all' ? items.length : items.filter((i) => i.type === t).length}</span>
              </button>
            ))}
          </div>
          <div className="space-y-5">
            {shown.map((i) => <ApprovalCard key={`${i.type}-${i.id}`} item={i} onDone={reload} openIdentity={setIdentityUser} />)}
          </div>
        </>
      )}

      <IdentityViewer userId={identityUser} onClose={() => setIdentityUser(null)} />
    </div>
  )
}

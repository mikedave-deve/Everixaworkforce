import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { PageHead, Panel, Pill, EmptyState, Loading, ErrorState, useAction } from '../../components/portal/ui'
import { api, downloadFile, useApi } from '../../lib/api'
import { fmtDateTime } from '../../lib/format'
import { adminChanged } from '../../lib/admin'
import { cn } from '../../lib/utils'

const TYPES = { contact: 'Contact form', apply: 'Applications', resume: 'Resumes', help: 'HR requests', service: 'Services', 'service-details': 'Service details', '401k': '401(k) details', setup: 'Info setup' }
const LABELS = {
  firstName: 'First name', lastName: 'Last name', fullName: 'Full name', email: 'Email', phone: 'Phone', inquiryType: 'Inquiry', company: 'Company', message: 'Message',
  dob: 'Date of birth', address: 'Address', jobPosition: 'Position', additionalInfo: 'Additional info', availability: 'Availability', workDuration: 'Duration',
  industry: 'Industry', fileName: 'File', topic: 'Topic', subject: 'Subject', service: 'Service', mailingAddress: 'Mailing address',
  accountHolder: 'Account holder', bankName: 'Bank', accountMasked: 'Account', routingMasked: 'Routing',
}

export default function AdminInbox() {
  const { data, error, loading, reload } = useApi('/admin/inbox')
  const [type, setType] = useState('all')
  const [onlyNew, setOnlyNew] = useState(false)

  const items = useMemo(() => data?.items ?? [], [data])
  const shown = items.filter((i) => (type === 'all' || i.type === type) && (!onlyNew || !i.handled))
  const types = ['all', ...Object.keys(TYPES).filter((t) => items.some((i) => i.type === t))]

  const [toggle] = useAction(async (i) => {
    await api.patch(`/admin/inbox/${i.id}`, { handled: !i.handled })
    adminChanged()
    reload()
  })

  return (
    <div>
      <PageHead eyebrow="Submissions" title="Everything people send you." description="Website forms, applications, resumes and employee requests all land here — and in your email. Mark each one done when you've dealt with it." />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Contact, Apply Now and Submit Resume forms, plus Help & HR and company service requests, appear here." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter">
            {types.map((t) => (
              <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={cn('px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors', type === t ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100')}>
                {t === 'all' ? 'All' : TYPES[t]} <span className="ml-1 opacity-70">{t === 'all' ? items.length : items.filter((i) => i.type === t).length}</span>
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-[13px] text-ink-700"><input type="checkbox" className="h-4 w-4 accent-ink-800" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} /> New only</label>
          </div>

          <div className="space-y-4">
            {shown.length === 0 && <EmptyState title="Nothing to show" />}
            {shown.map((i) => (
              <Panel key={i.id} className={cn(!i.handled && 'border-brass-400')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass-700">{TYPES[i.type] ?? i.type}</p>
                    <h3 className="mt-1 break-words font-display text-[1.4rem] leading-tight text-ink-900">{i.title}</h3>
                    <p className="mt-1 text-[12px] text-ink-500">{fmtDateTime(i.createdAt)}{i.employee ? ` · from ${i.employee}` : ''}</p>
                  </div>
                  {i.handled ? <Pill tone="success">Done</Pill> : <Pill tone="brass">New</Pill>}
                </div>
                <dl className="mt-4 grid gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2">
                  {Object.entries(i.data ?? {}).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className={cn('min-w-0', String(v).length > 60 && 'sm:col-span-2')}>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-600">{LABELS[k] ?? k}</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap break-words text-ink-900">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex flex-wrap gap-5">
                  {i.fileId && <button onClick={() => downloadFile(`/files/${i.fileId}`, i.data?.fileName || 'resume')} className="link-arrow !text-[11px]"><Download size={12} /> Download resume</button>}
                  {i.data?.email && <a href={`mailto:${i.data.email}`} className="link-arrow !text-[11px]">Reply by email</a>}
                  <button onClick={() => toggle(i)} className="link-arrow !text-[11px]">{i.handled ? 'Mark as new' : 'Mark as done'}</button>
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

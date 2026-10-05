import { Link } from 'react-router-dom'
import { ArrowRight, Users, CheckCheck, LifeBuoy, Inbox, Truck, ClipboardList, Wallet, FolderOpen } from 'lucide-react'
import { PageHead, Panel, Stat, Pill, Loading, ErrorState } from '../../components/portal/ui'
import { useApi } from '../../lib/api'
import { fmtDateTime } from '../../lib/format'

const REC = { approve: ['success', 'Looks good'], review: ['brass', 'Needs a look'], reject: ['danger', 'Problem found'] }

export default function AdminOverview() {
  const { data, error, loading, reload } = useApi('/admin/overview')
  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const c = data.counts

  const tiles = [
    { label: 'Waiting for you', value: c.pending, hint: 'Approvals', to: '/admin/approvals', icon: CheckCheck },
    { label: 'Employees', value: c.employees, hint: 'Active accounts', to: '/admin/employees', icon: Users },
    { label: 'New submissions', value: c.newInbox, hint: `${c.openHelp} open HR request${c.openHelp === 1 ? '' : 's'}`, to: '/admin/inbox', icon: Inbox },
    { label: 'Packages in transit', value: c.activeShipments, hint: c.pausedShipments ? `${c.pausedShipments} paused` : 'None paused', to: '/admin/shipments', icon: Truck },
  ]

  const quick = [
    ['/admin/missions', ClipboardList, 'Create a mission'],
    ['/admin/pay', Wallet, 'Post a pay statement'],
    ['/admin/shipments', Truck, 'Create a package'],
    ['/admin/documents', FolderOpen, 'Send a document'],
  ]

  return (
    <div>
      <PageHead eyebrow="Overview" title="Everything that needs you." description="Start with Approvals — each request shows an automatic checklist and a recommendation, so you can clear the queue quickly." actions={<Link to="/admin/approvals" className="btn-primary">Open approvals <ArrowRight size={16} /></Link>} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="group block min-w-0 border border-ink-900/10 bg-white p-4 transition-colors hover:border-ink-900/30 sm:p-5">
            <div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">{t.label}</p><t.icon className="h-4 w-4 text-brass-600" strokeWidth={1.6} /></div>
            <p className="font-num mt-3 text-[1.9rem] leading-none text-ink-900 sm:text-[2.2rem]">{t.value}</p>
            <p className="mt-2 text-[12px] text-ink-600">{t.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Needs your attention" className="lg:col-span-3" action={<Link to="/admin/approvals" className="link-arrow !text-[11px]">All</Link>}>
          {data.queue.length === 0 ? (
            <p className="text-[14px] text-ink-600">You're all caught up — nothing is waiting for approval.</p>
          ) : (
            <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
              {data.queue.map((q) => (
                <li key={`${q.type}-${q.id}`}>
                  <Link to="/admin/approvals" className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-ink-50">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-ink-900">{q.title}</p>
                      <p className="truncate text-[12px] text-ink-600">{q.employee?.name} · {fmtDateTime(q.submittedAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3"><Pill tone={REC[q.recommendation][0]}>{REC[q.recommendation][1]}</Pill><ArrowRight size={15} className="text-ink-400 transition-transform group-hover:translate-x-0.5" /></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Quick actions">
            <ul className="divide-y divide-ink-900/10">
              {quick.map(([to, Icon, label]) => (
                <li key={to}><Link to={to} className="group flex items-center gap-3 py-3.5 text-[14px] text-ink-900 first:pt-0 last:pb-0 hover:text-ink-600"><Icon className="h-4 w-4 text-brass-600" strokeWidth={1.6} />{label}<ArrowRight size={14} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" /></Link></li>
              ))}
            </ul>
          </Panel>

          <Panel title="Latest submissions" action={<Link to="/admin/inbox" className="link-arrow !text-[11px]">Inbox</Link>}>
            {data.recent.length === 0 ? <p className="text-[14px] text-ink-600">Nothing yet.</p> : (
              <ul className="divide-y divide-ink-900/10">
                {data.recent.map((r) => (
                  <li key={r.id} className="py-3 first:pt-0 last:pb-0"><p className="truncate text-[14px] font-medium text-ink-900">{r.title}</p><p className="text-[12px] text-ink-500">{fmtDateTime(r.createdAt)}{!r.handled && ' · new'}</p></li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}


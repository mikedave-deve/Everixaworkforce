import { useMemo, useState } from 'react'
import { Wallet, Clock, ClipboardList, FileText, ShieldCheck, HeartPulse, CalendarDays, Package, UserCog, LifeBuoy, Sparkles } from 'lucide-react'
import { PageHead, Panel, EmptyState, Loading, ErrorState } from '../../components/portal/ui'
import { useApi } from '../../lib/api'
import { fmtTime } from '../../lib/format'
import { cn } from '../../lib/utils'

const TYPES = {
  pay: { label: 'Pay', icon: Wallet },
  time: { label: 'Time', icon: Clock },
  mission: { label: 'Missions', icon: ClipboardList },
  doc: { label: 'Documents', icon: FileText },
  security: { label: 'Security', icon: ShieldCheck },
  benefit: { label: 'Benefits', icon: HeartPulse },
  timeoff: { label: 'Time off', icon: CalendarDays },
  equipment: { label: 'Equipment', icon: Package },
  setup: { label: 'Setup', icon: UserCog },
  help: { label: 'Help', icon: LifeBuoy },
  service: { label: 'Services', icon: Sparkles },
}

function dayLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const y = new Date()
  y.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' })
}

export default function PortalActivity() {
  const { data, error, loading, reload } = useApi('/activity')
  const [filter, setFilter] = useState('all')

  const all = useMemo(() => data?.items ?? [], [data])
  const items = filter === 'all' ? all : all.filter((a) => a.type === filter)
  const present = ['all', ...Object.keys(TYPES).filter((t) => all.some((a) => a.type === t))]

  const groups = items.reduce((acc, a) => {
    const k = dayLabel(a.at)
    ;(acc[k] ||= []).push(a)
    return acc
  }, {})

  return (
    <div>
      <PageHead
        eyebrow="Activity History"
        title="Everything on your account."
        description="A record of pay, time, document and security events, newest first. Actions you take in the portal appear here automatically."
      />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <>
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter activity">
            {present.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                aria-pressed={filter === t}
                className={cn('px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors', filter === t ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100')}
              >
                {t === 'all' ? 'All' : TYPES[t].label}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState title="No activity yet" body="Events will show up here as you use the portal." />
          ) : (
            <div className="space-y-8">
              {Object.entries(groups).map(([day, list]) => (
                <Panel key={day} title={day} flush>
                  <ul className="divide-y divide-ink-900/10 border-t border-ink-900/10">
                    {list.map((a) => {
                      const Icon = (TYPES[a.type] ?? TYPES.help).icon
                      return (
                        <li key={a.id} className="flex items-start gap-4 px-6 py-4">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-ink-100 text-ink-700"><Icon className="h-4 w-4" strokeWidth={1.6} /></span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-medium text-ink-900">{a.title}</p>
                            {a.detail && <p className="mt-0.5 break-words text-[13px] text-ink-600">{a.detail}</p>}
                          </div>
                          <time dateTime={a.at} className="shrink-0 pt-0.5 text-[12px] text-ink-500">{fmtTime(a.at)}</time>
                        </li>
                      )
                    })}
                  </ul>
                </Panel>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

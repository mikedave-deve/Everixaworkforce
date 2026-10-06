import { useEffect, useMemo, useState } from 'react'
import { LayoutDashboard, CheckCheck, Users, ClipboardList, Wallet, Truck, FolderOpen, Inbox, FileText } from 'lucide-react'
import PortalShell from '../components/portal/PortalShell'
import { api } from '../lib/api'

/** Admin portal — same chrome as the employee portal, with a live count on Approvals and Inbox. */
export default function AdminLayout() {
  const [counts, setCounts] = useState({ pending: 0, newInbox: 0 })
  const [taxPending, setTaxPending] = useState(0)

  useEffect(() => {
    let alive = true
    const load = () => api.get('/admin/overview').then((d) => { if (alive) { setCounts(d.counts); setTaxPending(d.byType?.tax ?? 0) } }).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    window.addEventListener('everixa:admin-changed', load)
    return () => { alive = false; clearInterval(t); window.removeEventListener('everixa:admin-changed', load) }
  }, [])

  const navGroups = useMemo(() => [
    { label: 'Overview', items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/approvals', label: 'Approvals', icon: CheckCheck, badge: counts.pending },
    ] },
    { label: 'People', items: [
      { to: '/admin/employees', label: 'Employees', icon: Users },
      { to: '/admin/missions', label: 'Missions', icon: ClipboardList },
    ] },
    { label: 'Money & Records', items: [
      { to: '/admin/pay', label: 'Pay', icon: Wallet },
      { to: '/admin/tax', label: 'Tax Forms', icon: FileText, badge: taxPending },
      { to: '/admin/documents', label: 'Documents', icon: FolderOpen },
    ] },
    { label: 'Logistics', items: [{ to: '/admin/shipments', label: 'Shipments', icon: Truck }] },
    { label: 'Inbox', items: [{ to: '/admin/inbox', label: 'Submissions', icon: Inbox, badge: counts.newInbox }] },
  ], [counts, taxPending])

  return <PortalShell navGroups={navGroups} label="Admin Portal" home="/admin" />
}

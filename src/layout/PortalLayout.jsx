import {
  LayoutDashboard, ClipboardList, History, Wallet, FileText, Clock, CalendarDays, HeartPulse,
  Sparkles, Package, UserCog, ShieldCheck, FolderOpen, Lock, LifeBuoy,
} from 'lucide-react'
import PortalShell from '../components/portal/PortalShell'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/portal/missions', label: 'Missions & Instructions', icon: ClipboardList },
      { to: '/portal/activity', label: 'Activity History', icon: History },
    ],
  },
  {
    label: 'Pay & Time',
    items: [
      { to: '/portal/pay', label: 'Pay', icon: Wallet },
      { to: '/portal/tax-forms', label: 'Tax Forms', icon: FileText },
      { to: '/portal/timesheet', label: 'Time Sheet', icon: Clock },
      { to: '/portal/time-off', label: 'Time Off', icon: CalendarDays },
    ],
  },
  {
    label: 'Benefits & Services',
    items: [
      { to: '/portal/benefits', label: 'Benefits', icon: HeartPulse },
      { to: '/portal/services', label: 'Company Services', icon: Sparkles },
      { to: '/portal/equipment', label: 'Equipment & Logistics', icon: Package },
    ],
  },
  {
    label: 'Records',
    items: [
      { to: '/portal/setup', label: 'Information Setup', icon: UserCog },
      { to: '/portal/identity', label: 'Identity Verification', icon: ShieldCheck },
      { to: '/portal/documents', label: 'Documents', icon: FolderOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/portal/profile', label: 'Profile & Security', icon: Lock },
      { to: '/portal/help', label: 'Help & HR', icon: LifeBuoy },
    ],
  },
]

export default function PortalLayout() {
  return <PortalShell navGroups={navGroups} label="Employee Portal" home="/portal" />
}

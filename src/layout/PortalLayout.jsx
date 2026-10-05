import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, History, Wallet, FileText, Clock, CalendarDays, HeartPulse,
  Sparkles, Package, UserCog, ShieldCheck, FolderOpen, Lock, LifeBuoy, LogOut, Menu, ExternalLink,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../components/ui/Sheet'
import { ToastProvider } from '../components/portal/ui'
import BrandMark from '../components/BrandMark'
import { getSession, logout } from '../lib/auth'
import { cn } from '../lib/utils'

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

const allItems = navGroups.flatMap((g) => g.items)

function initials(session) {
  const f = session?.firstName ?? session?.name?.split(' ')[0] ?? ''
  const l = session?.lastName ?? session?.name?.split(' ').slice(-1)[0] ?? ''
  return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
}

function SidebarNav({ onNavigate }) {
  const session = getSession()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="on-dark flex h-full flex-col">
      <div className="px-6 pb-4 pt-6">
        <Link to="/" aria-label="Everixa Workforce — public site" onClick={onNavigate}>
          <BrandMark variant="dark" size="sm" />
        </Link>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brass-300">Employee Portal</p>
      </div>

      <nav aria-label="Portal" className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/40">{group.label}</p>
            <ul>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 px-3 py-2 text-[14px] transition-colors',
                        isActive
                          ? 'bg-cream-50/[0.07] text-cream-50 before:absolute before:inset-y-1.5 before:left-0 before:w-[2px] before:bg-brass-300'
                          : 'text-cream-100/65 hover:bg-cream-50/[0.04] hover:text-cream-50'
                      )
                    }
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.6} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 border-t border-cream-50/10 py-2">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-3 py-2 text-[14px] text-cream-100/65 transition-colors hover:text-cream-50">
          <ExternalLink className="h-[17px] w-[17px]" strokeWidth={1.6} /> View public site
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-[14px] text-cream-100/65 transition-colors hover:text-cream-50">
          <LogOut className="h-[17px] w-[17px]" strokeWidth={1.6} /> Sign out
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-cream-50/10 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-cream-50/10 text-[12px] font-semibold tracking-wide text-cream-50">
          {initials(session)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-cream-50">{session?.name}</p>
          <p className="truncate text-[12px] text-cream-100/55">{session?.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function PortalLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = allItems.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-cream-50">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 bg-ink-950 lg:block">
          <SidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="on-dark sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-ink-950 px-4 lg:hidden">
            <Link to="/portal" aria-label="Portal dashboard"><BrandMark variant="dark" size="sm" /></Link>
            <div className="flex items-center gap-3">
              <span className="max-w-[9rem] truncate text-[13px] text-cream-100/70">{current?.label}</span>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-cream-50" aria-label="Open portal menu"><Menu className="h-6 w-6" /></button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 max-w-[85vw] border-none bg-ink-950 p-0 text-cream-50">
                  <SheetHeader className="sr-only"><SheetTitle>Portal menu</SheetTitle></SheetHeader>
                  <SidebarNav onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <main className="flex-1 px-5 py-8 md:px-10 md:py-12 xl:px-14">
            <div className="mx-auto w-full min-w-0 max-w-[1100px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

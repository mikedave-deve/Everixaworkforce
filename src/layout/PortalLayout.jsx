import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { Leaf, LayoutDashboard, User, Clock, FileText, Megaphone, LogOut, Menu, ExternalLink } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '../components/ui/Sheet'
import { getSession, logout } from '../lib/auth'
import { cn } from '../lib/utils'

const navItems = [
  { to: '/portal',               label: 'Overview',      icon: LayoutDashboard, end: true },
  { to: '/portal/profile',       label: 'Profile',       icon: User },
  { to: '/portal/timesheet',     label: 'Timesheet',     icon: Clock },
  { to: '/portal/documents',     label: 'Documents',     icon: FileText },
  { to: '/portal/announcements', label: 'Announcements', icon: Megaphone },
]

function initials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function SidebarNav({ onNavigate }) {
  const session = getSession()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2.5 px-6 py-6 group">
        <div className="w-8 h-8 bg-forest-600 rounded-sm flex items-center justify-center group-hover:bg-forest-500 transition-colors">
          <Leaf className="w-4 h-4 text-cream-100" />
        </div>
        <div className="leading-none">
          <span className="font-display font-bold text-lg text-white block">Everixa</span>
          <span className="font-body text-[10px] tracking-[0.18em] uppercase text-forest-400 block">Portal</span>
        </div>
      </Link>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-sm font-body text-sm transition-colors',
                  isActive
                    ? 'bg-forest-800 text-white font-medium'
                    : 'text-cream-200/70 hover:bg-forest-800/60 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 pb-3 space-y-1 border-t border-forest-800/60 pt-3 mx-3">
        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-sm font-body text-sm text-cream-200/70 hover:bg-forest-800/60 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          View Public Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-sm font-body text-sm text-cream-200/70 hover:bg-red-900/30 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log Out
        </button>
      </div>

      <div className="flex items-center gap-3 px-6 py-5 border-t border-forest-800/60 mx-3">
        <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center shrink-0">
          <span className="font-body text-xs font-bold text-white">{initials(session?.name)}</span>
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm font-semibold text-white truncate">{session?.name}</p>
          <p className="font-body text-xs text-forest-400 truncate">{session?.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function PortalLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-forest-950 shrink-0">
        <SidebarNav />
      </aside>

      {/* Mobile topbar + sheet */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-16 bg-forest-950 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-600 rounded-sm flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-cream-100" />
            </div>
            <span className="font-display font-bold text-white">Everixa Portal</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-forest-950 border-none p-0 w-72">
              <SheetHeader className="hidden">
                <SheetTitle>Portal Menu</SheetTitle>
              </SheetHeader>
              <div className="pt-2">
                <SidebarNav onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

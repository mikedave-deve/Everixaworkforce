import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react'
import { useNavbarScroll } from '../hooks/useNavbarScroll'
import { cn } from '../lib/utils'
import { getSession, homeFor } from '../lib/auth'
import BrandMark from './BrandMark'

const navLinks = [
  { label: 'About', href: '/about' },
  {
    label: 'Solutions',
    children: [
      { label: 'Services', href: '/services' },
      { label: 'Industries', href: '/industries' },
      { label: 'For Employers', href: '/employers' },
      { label: 'For Candidates', href: '/candidates' },
    ],
  },
  { label: 'Jobs', href: '/jobs' },
  {
    label: 'Work With Us',
    children: [
      { label: 'Apply Now', href: '/apply' },
      { label: 'Submit Resume', href: '/submit-resume' },
    ],
  },
  { label: 'Our Team', href: '/staff' },
  { label: 'Contact', href: '/contact' },
]

function DesktopDropdown({ link, pathname }) {
  const [open, setOpen] = useState(false)
  const active = link.children.some((c) => c.href === pathname)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'nav-link flex items-center gap-1 px-4 py-2 text-[14px] text-cream-50/85 transition-colors hover:text-cream-50',
          active && 'text-cream-50'
        )}
      >
        {link.label}
        <ChevronDown size={13} className={cn('transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div
        className={cn(
          'absolute left-0 top-full w-56 pt-3 transition-[opacity,transform] duration-300 ease-out',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        )}
      >
        <div className="border border-cream-50/10 bg-ink-950/95 py-2 backdrop-blur-xl">
          {link.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              tabIndex={open ? 0 : -1}
              className="group flex items-center justify-between px-5 py-2.5 text-[14px] text-cream-50/75 transition-colors hover:bg-cream-50/5 hover:text-cream-50"
            >
              {child.label}
              <ArrowUpRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const scrolled = useNavbarScroll(40)
  const { pathname } = useLocation()
  // Menu state is tied to the route it was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState(null)
  const [expandedOn, setExpandedOn] = useState({ path: null, label: null })
  const mobileOpen = openOn === pathname
  const expanded = expandedOn.path === pathname ? expandedOn.label : null
  const setMobileOpen = (fn) => setOpenOn((cur) => ((typeof fn === 'function' ? fn(cur === pathname) : fn) ? pathname : null))
  const setExpanded = (label) => setExpandedOn({ path: pathname, label })
  const session = getSession()
  const portalHref = session ? homeFor(session) : '/login'
  const portalLabel = session ? (session.role === 'admin' ? 'Admin Portal' : 'My Portal') : 'Employee Login'

  // Lock page scroll while the full-screen menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const solid = scrolled || mobileOpen

  return (
    <>
    <header
      className={cn(
        'on-dark fixed inset-x-0 top-0 z-50 transition-[background-color,padding,border-color] duration-500 ease-out',
        solid ? 'border-b border-cream-50/10 bg-ink-950/90 py-3 backdrop-blur-xl' : 'border-b border-transparent bg-transparent py-5'
      )}
    >
      <div className="container-main">
        <nav className="flex items-center justify-between gap-6" aria-label="Primary">
          <Link to="/" aria-label="Everixa Workforce — home" className="shrink-0">
            <BrandMark variant="dark" draw />
          </Link>

          <div className="hidden items-center lg:flex">
            {navLinks.map((link) =>
              link.children ? (
                <DesktopDropdown key={link.label} link={link} pathname={pathname} />
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className="nav-link px-4 py-2 text-[14px] text-cream-50/85 transition-colors hover:text-cream-50 aria-[current=page]:text-cream-50"
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to={portalHref}
              className="px-3 py-2 text-[14px] text-cream-50/85 transition-colors hover:text-cream-50"
            >
              {portalLabel}
            </Link>
            <Link
              to="/jobs"
              className="btn-light !px-5 !py-2.5 !text-[13px]"
            >
              Find Talent
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 p-2 text-cream-50 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

    </header>

      {/* Mobile: full-height sheet */}
      <div
        className={cn(
          'on-dark fixed inset-0 z-40 overflow-y-auto bg-ink-950 pt-[76px] transition-[opacity,visibility] duration-300 lg:hidden',
          mobileOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <div className="container-main flex min-h-full flex-col py-8">
          <ul className="divide-y divide-cream-50/10 border-y border-cream-50/10">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-4 font-display text-[28px] text-cream-50"
                      aria-expanded={expanded === link.label}
                      onClick={() => setExpanded(expanded === link.label ? null : link.label)}
                    >
                      {link.label}
                      <ChevronDown size={20} className={cn('transition-transform', expanded === link.label && 'rotate-180')} />
                    </button>
                    {expanded === link.label && (
                      <div className="pb-4 pl-1">
                        {link.children.map((child) => (
                          <Link key={child.href} to={child.href} className="block py-2.5 text-[16px] text-cream-50/70">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={link.href} className="block py-4 font-display text-[28px] text-cream-50">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-3 pt-10">
            <Link to="/jobs" className="btn-light w-full">Find Talent</Link>
            <Link to="/submit-resume" className="btn-ghost-light w-full">Submit Your Resume</Link>
            <Link to={portalHref} className="block pt-3 text-center text-[14px] text-cream-50/70">
              {portalLabel}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, Phone, MapPin } from 'lucide-react'
import BrandMark from './BrandMark'
import { offices } from '../data'

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Services', href: '/services' },
    { label: 'Industries', href: '/industries' },
    { label: 'Contact', href: '/contact' },
  ],
  Talent: [
    { label: 'Job Board', href: '/jobs' },
    { label: 'For Candidates', href: '/candidates' },
    { label: 'Submit Resume', href: '/submit-resume' },
    { label: 'Career Resources', href: '/candidates' },
  ],
  Employers: [
    { label: 'Hiring Solutions', href: '/employers' },
    { label: 'Remote Placement', href: '/services' },
    { label: 'Flexible Staffing', href: '/services' },
    { label: 'Virtual Team Building', href: '/services' },
  ],
}

export default function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-ink-950 text-cream-100">
      <div className="container-main">
        {/* Closing statement */}
        <div className="grid gap-10 border-b border-cream-50/10 py-20 md:py-28 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow mb-6">Ready to grow?</p>
            <h2 className="font-display text-[clamp(2.4rem,6vw,5.2rem)] leading-[0.98] tracking-[-0.025em] text-cream-50">
              Partner with Everixa
              <br />
              <em className="text-brass-300">Workforce</em> today.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/jobs" className="btn-light">Browse Jobs <ArrowUpRight size={16} /></Link>
            <Link to="/contact" className="btn-ghost-light">Contact Us</Link>
          </div>
        </div>

        {/* Directory */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Everixa Workforce — home" className="inline-block">
              <BrandMark variant="dark" size="md" />
            </Link>
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-cream-100/65">
              Connecting exceptional talent with forward-thinking organizations since 2006.
              We believe great placements change lives — and companies.
            </p>
            <ul className="mt-7 space-y-3 text-[14px] text-cream-100/75">
              {offices.map((o) => (
                <li key={o.city} className="flex items-start gap-3"><MapPin size={15} className="mt-0.5 shrink-0 text-brass-300" />{o.address}, {o.city}, {o.state} {o.zip}</li>
              ))}
              <li><a href="tel:+18632433789" className="flex items-center gap-3 hover:text-cream-50"><Phone size={15} className="shrink-0 text-brass-300" />(863) 243-3789</a></li>
              <li><a href="mailto:info@everixaworkforce.com" className="flex items-center gap-3 hover:text-cream-50"><Mail size={15} className="shrink-0 text-brass-300" />info@everixaworkforce.com</a></li>
            </ul>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={category}>
              <h3 className="mb-5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-300">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-[15px] text-cream-100/75 transition-colors hover:text-cream-50">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-cream-50/10 py-6 text-[13px] text-cream-100/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Everixa Workforce LLC. All rights reserved.</p>
          <p>Staffing &amp; Recruitment · Since 2006</p>
        </div>
      </div>
    </footer>
  )
}

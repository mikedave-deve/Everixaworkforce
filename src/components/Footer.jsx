import { Link } from 'react-router-dom'
import { Leaf, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react'

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
    { label: 'Submit Resume', href: '/candidates' },
    { label: 'Career Resources', href: '/candidates' },
  ],
  Employers: [
    { label: 'Hiring Solutions', href: '/employers' },
    { label: 'Permanent Staffing', href: '/services' },
    { label: 'Contract Staffing', href: '/services' },
    { label: 'Executive Search', href: '/services' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-cream-200">
      {/* CTA Banner */}
      <div className="bg-forest-800 py-10">
        <div className="container-main flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="label-tag">Ready to grow?</p>
            <h3 className="font-display text-2xl text-cream-100">Partner with Everixa Workforce today.</h3>
          </div>
          <div className="flex gap-3">
            <Link to="/jobs" className="btn-gold text-sm">Browse Jobs</Link>
            <Link to="/contact" className="btn-outline border-cream-200 text-cream-100 hover:bg-cream-100 hover:text-forest-900 text-sm">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-500 flex items-center justify-center rounded-sm">
                <Leaf size={16} className="text-forest-950" />
              </div>
              <span className="font-display text-xl text-cream-100">
                Everixa <span className="text-gold-400 font-300 italic">Workforce</span>
              </span>
            </Link>
            <p className="text-sm text-cream-300 leading-relaxed max-w-xs mb-6">
              Connecting exceptional talent with forward-thinking organizations since 2008. 
              We believe great placements change lives — and companies.
            </p>
            <div className="space-y-2 text-sm text-cream-300">
              <div className="flex items-center gap-2"><MapPin size={14} className="text-gold-500 shrink-0" /><span>1200 Forest Way, Suite 400, Austin TX 78701</span></div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-gold-500 shrink-0" /><span>(863) 243-3789 </span></div>
              <div className="flex items-center gap-2"><Mail size={14} className="text-gold-500 shrink-0" /><span>info@everixaworkforce.com</span></div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-body font-600 uppercase tracking-[0.15em] text-gold-500 mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-cream-300 hover:text-gold-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-forest-800">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream-300">© {new Date().getFullYear()} Everixa Workforce LLC. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-cream-300 hover:text-gold-400 transition-colors"><Linkedin size={16} /></a>
            <a href="#" className="text-cream-300 hover:text-gold-400 transition-colors"><Twitter size={16} /></a>
            <a href="#" className="text-cream-300 hover:text-gold-400 transition-colors"><Mail size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

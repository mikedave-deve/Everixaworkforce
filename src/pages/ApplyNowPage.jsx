import { useState } from 'react'
import { CheckCircle2, Briefcase, Clock, User, Mail, Phone, Calendar, MapPin, FileText, ChevronDown } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import applyHero from '../assets/stock/candidates-remote.jpg'

// ── Backend base URL — set VITE_API_URL in your .env (e.g. https://your-backend.vercel.app)
const API_BASE = import.meta.env.VITE_API_URL ?? ''

// ─── Page Header ──────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <PageHeaderImage
      image={applyHero}
      label="Join Our Network"
      title="Apply now &"
      highlight="start your journey"
      subtitle="Take the first step toward your next career milestone. Complete the form below and a dedicated recruiter will be in touch within one business day."
    />
  )
}

// ─── Trust Badges ─────────────────────────────────────────────────────────
const trustItems = [
  { icon: <User className="w-4 h-4 text-brass-600" />,    title: 'Personalized Match',  body: 'Every application is reviewed by a human recruiter who specialises in your field.' },
  { icon: <Clock className="w-4 h-4 text-brass-600" />,   title: '24-Hr Response',      body: 'We respond to every submission within one business day — no automated filters.' },
  { icon: <Briefcase className="w-4 h-4 text-brass-600" />, title: 'Active Openings',   body: 'We keep an active pipeline of vetted roles across multiple sectors and locations.' },
  { icon: <FileText className="w-4 h-4 text-brass-600" />, title: 'Confidential',        body: 'Your details are never shared with employers without your explicit consent.' },
]

// ─── The Application Form ─────────────────────────────────────────────────
function ApplicationForm() {
  const [submitted,   setSubmitted]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState('')

  const inputClass = 'field'

  const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setLoading(true)

    // Collect all field values from the form
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch(`${API_BASE}/api/apply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        // Surface backend validation errors or generic error message
        const msg = Array.isArray(json.errors)
          ? json.errors.join(' ')
          : (json.message || 'Something went wrong. Please try again.')
        setSubmitError(msg)
        return
      }

      setSubmitted(true)
    } catch {
      setSubmitError('Unable to reach the server. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-ink-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-ink-600" />
        </div>
        <h3 className="font-display text-2xl font-medium text-ink-900 mb-3">
          Application Received
        </h3>
        <p className="font-body text-sm text-ink-700/70 max-w-sm leading-relaxed">
          Thank you for applying. One of our recruiters will review your information and reach
          out within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Row 1 – Full Name */}
      <div>
        <label htmlFor="fullName" className={labelClass}>Full Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            id="fullName" name="fullName" type="text" required
            className={`${inputClass} pl-10`}
            placeholder="Jane Smith"
          />
        </div>
      </div>

      {/* Row 2 – Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="email" name="email" type="email" required
              className={`${inputClass} pl-10`}
              placeholder="jane@email.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="phone" name="phone" type="tel" required
              className={`${inputClass} pl-10`}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Row 3 – DOB + Home Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dob" className={labelClass}>Date of Birth *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="dob" name="dob" type="date" required
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>Home Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="address" name="address" type="text" required
              className={`${inputClass} pl-10`}
              placeholder="123 Main St, City, State"
            />
          </div>
        </div>
      </div>

      {/* Row 4 – Job Position + Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="jobPosition" className={labelClass}>Job Position *</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <select
              id="jobPosition" name="jobPosition" defaultValue="" required
              className={`${inputClass} pl-10 appearance-none`}
            >
              <option value="" disabled>Select a position…</option>
              <option value="environmental-pm">Environmental Project Manager</option>
              <option value="customer-service">Customer Service Representative</option>
              <option value="accounts-payable">Accounts Payable Clerk</option>
              <option value="data-entry">Data Entry Clerk</option>
              <option value="payroll-specialist">Payroll Specialist</option>
              <option value="hr-coordinator">HR Coordinator</option>
              <option value="office-admin">Office Administrator</option>
              <option value="other">Other / Open to Opportunities</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="additionalInfo" className={labelClass}>Additional Information</label>
          <input
            id="additionalInfo" name="additionalInfo" type="text"
            className={inputClass}
            placeholder="Certifications, LinkedIn, portfolio…"
          />
        </div>
      </div>

      {/* Row 5 – Full Time / Part Time + Work Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Availability *</label>
          <div className="flex gap-3">
            {['Full Time', 'Part Time'].map(opt => (
              <label
                key={opt}
                className="flex items-center gap-2 flex-1 px-4 py-3 border border-ink-200 rounded-sm
                           bg-ink-50 cursor-pointer hover:border-ink-400 transition-colors
                           has-[:checked]:border-ink-600 has-[:checked]:bg-ink-100"
              >
                <input type="radio" name="availability" value={opt} required className="accent-ink-600" />
                <span className="font-body text-sm text-ink-800">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="workDuration" className={labelClass}>Work Duration *</label>
          <div className="relative">
            <select
              id="workDuration" name="workDuration" defaultValue="" required
              className={`${inputClass} appearance-none`}
            >
              <option value="" disabled>Select duration…</option>
              <option value="temporary">Temporary (under 3 months)</option>
              <option value="contract">Contract (3–12 months)</option>
              <option value="permanent">Permanent / Long-term</option>
              <option value="seasonal">Seasonal</option>
              <option value="open">Open to Discussion</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 6 – Message */}
      <div>
        <label htmlFor="message" className={labelClass}>Message <span className="normal-case text-ink-400 tracking-normal">(optional)</span></label>
        <textarea
          id="message" name="message" rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about your background, goals, preferred work environment, or anything else that would help us find the right fit…"
        />
      </div>

      {submitError && (
        <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-sm">
          <span className="text-red-500 text-sm shrink-0 mt-0.5">!</span>
          <p className="font-body text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center text-sm py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting Application…
          </>
        ) : 'Submit Application'}
      </button>

      <p className="font-body text-xs text-center text-ink-400">
        By submitting, you agree that your information may be used to connect you with suitable employers.
      </p>
    </form>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────
function ApplicationSection() {
  const ref = useScrollReveal('.reveal')

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">

          {/* Form Column */}
          <div className="reveal">
            <p className="section-label mb-3">Application Form</p>
            <h2 className="section-title mb-12">Tell us about <em className="text-brass-700">yourself.</em></h2>
            <ApplicationForm />
          </div>

          {/* Sidebar */}
          <aside className="reveal lg:pt-4">
            <p className="eyebrow mb-6">Why Apply With Us</p>
            <ul className="mb-10 border-t border-ink-900/15">
              {trustItems.map(item => (
                <li key={item.title} className="border-b border-ink-900/15 py-6">
                  <div className="mb-2 flex items-center gap-3">
                    {item.icon}
                    <h3 className="font-display text-[1.45rem] leading-tight text-ink-900">{item.title}</h3>
                  </div>
                  <p className="pl-7 text-[14px] leading-relaxed text-ink-700/80">{item.body}</p>
                </li>
              ))}
            </ul>

            {/* Highlight box */}
            <div className="on-dark bg-ink-900 p-7">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-300">
                Since 2006
              </p>
              <p className="font-display text-3xl leading-tight text-cream-50 mb-3">
                Over 2,000+ successful placements
              </p>
              <p className="font-body text-xs text-cream-200/60 leading-relaxed">
                We have spent nearly two decades building a network of trusted employers and
                talented professionals across every major sector.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function ApplyNowPage() {
  return (
    <>
      <PageHeader />
      <ApplicationSection />
    </>
  )
}
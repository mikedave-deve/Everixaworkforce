import { useState } from 'react'
import { Mail, Phone, Clock, CheckCircle2 } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import contactHero from '../assets/stock/contact-lobby.jpg'

const API_URL = import.meta.env.VITE_API_URL

// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <PageHeaderImage
      image={contactHero}
      label="Get in Touch"
      title="Let's start a"
      highlight="real conversation"
      subtitle="Whether you're looking to hire or looking for your next role, we respond to every inquiry within one business day."
    />
  )
}

// ---------------------------------------------------------------------------

const labelClass = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700'

function ContactForm() {
  const [submitted,   setSubmitted]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setLoading(true)

    const form = e.target

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:   form.firstName.value.trim(),
          lastName:    form.lastName.value.trim(),
          email:       form.email.value.trim(),
          phone:       form.phone.value.trim(),
          inquiryType: form.inquiryType.value,
          company:     form.company.value.trim(),
          message:     form.message.value.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitted(true)
      } else {
        setSubmitError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div role="status" className="flex flex-col items-start justify-center border-t border-ink-900/15 py-16">
        <CheckCircle2 className="mb-6 h-10 w-10 text-ink-600" strokeWidth={1.5} />
        <h3 className="mb-3 font-display text-4xl text-ink-900">Message received.</h3>
        <p className="max-w-sm text-[16px] leading-relaxed text-ink-700/80">
          Thank you for reaching out. A member of our team will respond within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name *</label>
          <input id="firstName" required name="firstName" type="text" autoComplete="given-name"
                 className="field" placeholder="Jane" />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name *</label>
          <input id="lastName" required name="lastName" type="text" autoComplete="family-name"
                 className="field" placeholder="Smith" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input id="email" required type="email" name="email" autoComplete="email"
                 className="field" placeholder="jane@company.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input id="phone" type="tel" name="phone" autoComplete="tel"
                 className="field" placeholder="" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiryType" className={labelClass}>Inquiry Type *</label>
          <select id="inquiryType" required name="inquiryType" defaultValue="" className="field">
            <option value="" disabled>Select one...</option>
            <option value="employer">I am looking to hire</option>
            <option value="candidate">I am looking for a job</option>
            <option value="consulting">Workforce consulting</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>Company / Organization</label>
          <input id="company" name="company" type="text" autoComplete="organization"
                 className="field" placeholder="Acme Environmental" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message *</label>
        <textarea id="message" required name="message" rows={5}
                  className="field resize-none"
                  placeholder="Tell us about your hiring needs, the role you are targeting, or any questions you have..." />
      </div>

      {submitError && (
        <div role="alert" className="flex items-start gap-2.5 border border-red-300 bg-red-50 p-4">
          <p className="text-[14px] text-red-800">{submitError}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending...
            </>
          ) : 'Send Message'}
        </button>
        <p className="text-[13px] text-ink-600">We respond to all inquiries within one business day.</p>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------

function ContactSection() {
  const ref = useScrollReveal('.reveal')

  const offices = [
    { city: 'Portland',      state: 'OR', address: '1234 NW Glisan St, Suite 400', primary: true },
    { city: 'Seattle',       state: 'WA', address: '800 Fifth Ave, Suite 1010'                   },
    { city: 'San Francisco', state: 'CA', address: '535 Mission St, Suite 1450'                  },
  ]

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
          <div className="reveal">
            <p className="eyebrow mb-6">Contact Us</p>
            <h2 className="section-title mb-12">Send us <em className="text-brass-700">a message.</em></h2>
            <ContactForm />
          </div>

          <aside className="reveal space-y-12 lg:pt-4">
            <div>
              <p className="eyebrow mb-2">Our Offices</p>
              <ul className="border-t border-ink-900/15 mt-6">
                {offices.map((office) => (
                  <li key={office.city} className="border-b border-ink-900/15 py-6">
                    <h3 className="font-display text-[1.7rem] leading-tight text-ink-900">
                      {office.city}, {office.state}
                      {office.primary && (
                        <span className="ml-3 align-middle text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">HQ</span>
                      )}
                    </h3>
                    <p className="mt-1 text-[14px] text-ink-700/80">{office.address}</p>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-8">
              <div>
                <dt className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  <Clock className="h-3.5 w-3.5" /> Business Hours
                </dt>
                <dd className="space-y-1 text-[15px] text-ink-800">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM PT</p>
                  <p>Saturday - Sunday: Closed</p>
                </dd>
              </div>
              <div>
                <dt className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  <Mail className="h-3.5 w-3.5" /> Direct Email
                </dt>
                <dd>
                  <a href="mailto:info@everixaworkforce.com" className="text-[15px] text-ink-800 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700">
                    info@everixaworkforce.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </dt>
                <dd>
                  <a href="tel:+18632433789" className="text-[15px] text-ink-800 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-700">
                    (863) 243-3789
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------

export default function ContactPage() {
  return (
    <>
      <PageHeader />
      <ContactSection />
    </>
  )
}

import { useState }                                 from 'react'
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import { useScrollReveal }                          from '../hooks/useScrollReveal'
import PageHeaderImage                              from '../components/PageHeaderImage'
import contactHero                                  from '../assets/stock/contact-lobby.jpg'

const API_URL = import.meta.env.VITE_API_URL

// ---------------------------------------------------------------------------

function PageHeader() {
  return (
    <PageHeaderImage
      image={contactHero}
      label="Get in Touch"
      title="Let's Start a"
      highlight="Real Conversation"
      subtitle="Whether you're looking to hire or looking for your next role, we respond to every inquiry within one business day."
    />
  )
}

// ---------------------------------------------------------------------------

function ContactForm() {
  const [submitted,   setSubmitted]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [submitError, setSubmitError] = useState('')

  const inputClass = [
    'w-full px-4 py-3 text-sm font-body',
    'border border-forest-200 rounded-sm',
    'bg-forest-50 text-forest-900 placeholder-forest-400',
    'focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent',
    'transition-all duration-200',
  ].join(' ')

  const labelClass = 'block font-body text-xs font-medium text-forest-700 mb-1.5 tracking-wide'

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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-forest-600" />
        </div>
        <h3 className="font-display text-2xl font-bold text-forest-900 mb-3">
          Message Received
        </h3>
        <p className="font-body text-sm text-forest-700/70 max-w-sm leading-relaxed">
          Thank you for reaching out. A member of our team will respond within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name *</label>
          <input id="firstName" required name="firstName" type="text"
                 className={inputClass} placeholder="Jane" />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name *</label>
          <input id="lastName" required name="lastName" type="text"
                 className={inputClass} placeholder="Smith" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input id="email" required type="email" name="email"
                 className={inputClass} placeholder="jane@company.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input id="phone" type="tel" name="phone"
                 className={inputClass} placeholder="" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inquiryType" className={labelClass}>Inquiry Type *</label>
          <select id="inquiryType" required name="inquiryType" defaultValue=""
                  className={inputClass}>
            <option value="" disabled>Select one...</option>
            <option value="employer">I am looking to hire</option>
            <option value="candidate">I am looking for a job</option>
            <option value="consulting">Workforce consulting</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>Company / Organization</label>
          <input id="company" name="company" type="text"
                 className={inputClass} placeholder="Acme Environmental" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message *</label>
        <textarea id="message" required name="message" rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Tell us about your hiring needs, the role you are targeting, or any questions you have..." />
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
            Sending...
          </>
        ) : 'Send Message'}
      </button>

      <p className="font-body text-xs text-center text-forest-400">
        We respond to all inquiries within one business day.
      </p>
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
    <section className="section-wrapper bg-white" ref={ref}>
      <div className="container-base">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 reveal">
            <p className="section-label mb-3">Contact Us</p>
            <h2 className="section-title mb-8">Send Us a Message</h2>
            <div className="bg-forest-50 border border-forest-100 rounded-sm p-7">
              <ContactForm />
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-6 reveal">
            <div>
              <p className="section-label mb-4">Our Offices</p>
              {offices.map((office) => (
                <div
                  key={office.city}
                  className={`p-5 rounded-sm border mb-4 ${
                    office.primary
                      ? 'border-forest-200 bg-forest-50'
                      : 'border-forest-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-forest-500" />
                    <span className="font-body text-sm font-semibold text-forest-900">
                      {office.city}, {office.state}
                      {office.primary && (
                        <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 bg-forest-200 text-forest-700 rounded-full">
                          HQ
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="font-body text-xs text-forest-700/70 mb-1 ml-6">{office.address}</p>
                  <a
                    href={`tel:${office.phone}`}
                    className="font-body text-xs text-forest-600 hover:text-forest-800 transition-colors ml-6 flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" /> {office.phone}
                  </a>
                </div>
              ))}
            </div>

            <div className="p-5 bg-forest-50 border border-forest-100 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-forest-500" />
                <span className="font-body text-sm font-semibold text-forest-900">Business Hours</span>
              </div>
              <div className="font-body text-xs text-forest-700/70 space-y-1">
                <p>Monday - Friday: 8:00 AM - 6:00 PM PT</p>
                <p>Saturday - Sunday: Closed</p>
              </div>
            </div>

            <div className="p-5 bg-forest-50 border border-forest-100 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-forest-500" />
                <span className="font-body text-sm font-semibold text-forest-900">Direct Email</span>
              </div>
              <a
                href="mailto:info@everixaworkforce.com"
                className="font-body text-xs text-forest-600 hover:text-forest-800 transition-colors"
              >
                info@everixaworkforce.com
              </a>
            </div>

            {/* Map placeholder */}
            <div className="rounded-sm overflow-hidden border border-forest-100 h-48 bg-forest-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-forest-400 mx-auto mb-2" />
                <p className="font-body text-xs text-forest-500">Portland, OR 97209</p>
              </div>
            </div>
          </div>
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

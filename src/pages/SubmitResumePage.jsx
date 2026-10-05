import { Link } from 'react-router-dom'
import { FileText, Clock, Users, ShieldCheck } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageHeaderImage from '../components/PageHeaderImage'
import submitHero from '../assets/stock/jobs-videocall.jpg'
import ResumeSubmissionForm from '../components/ResumeSubmissionForm'

function PageHeader() {
  return (
    <PageHeaderImage
      image={submitHero}
      label="Career Opportunities"
      title="Submit your"
      highlight="resume"
      subtitle="Share your experience with our team. We review every submission and reach out when we have a role that genuinely fits your background and goals."
    />
  )
}

// ─── Trust signals sidebar ────────────────────────────────────────────────
const trustItems = [
  {
    icon: <ShieldCheck className="w-4 h-4 text-brass-600" />,
    title: 'Confidential',
    body: 'Your resume and personal details are never shared without your explicit consent.',
  },
  {
    icon: <Clock className="w-4 h-4 text-brass-600" />,
    title: '1-2 Day Review',
    body: 'Every submission is personally reviewed by a specialist within 1-2 business days.',
  },
  {
    icon: <Users className="w-4 h-4 text-brass-600" />,
    title: 'Human Recruiters',
    body: 'No automated screening. A real recruiter with sector experience reviews your file.',
  },
  {
    icon: <FileText className="w-4 h-4 text-brass-600" />,
    title: 'Active Pipeline',
    body: 'Your profile stays active in our candidate database for 12 months after submission.',
  },
]

// ─── What Happens Next steps ──────────────────────────────────────────────
const nextSteps = [
  { n: '01', text: 'Our team reviews your resume within 1-2 business days.' },
  { n: '02', text: 'If there is a match, a recruiter will contact you directly.' },
  { n: '03', text: 'We discuss your goals and the opportunity in more detail.' },
  { n: '04', text: 'We introduce you to the client only with your consent.' },
]

// ─── Main Section ─────────────────────────────────────────────────────────
function SubmitSection() {
  const ref = useScrollReveal('.reveal')

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
          <div className="reveal">
            <p className="eyebrow mb-6">Submit Your Application</p>
            <h2 className="section-title mb-5">Tell us about <em className="text-brass-700">yourself.</em></h2>
            <p className="mb-12 max-w-md text-[15px] leading-relaxed text-ink-700/80">
              Fill in your details and attach your resume as a PDF. All fields marked
              with * are required.
            </p>
            <ResumeSubmissionForm />
          </div>

          <aside className="reveal space-y-12 lg:pt-4">
            <div>
              <p className="eyebrow mb-6">Why Submit With Us</p>
              <ul className="border-t border-ink-900/15">
                {trustItems.map((item) => (
                  <li key={item.title} className="border-b border-ink-900/15 py-6">
                    <div className="mb-2 flex items-center gap-3">
                      {item.icon}
                      <h3 className="font-display text-[1.45rem] leading-tight text-ink-900">{item.title}</h3>
                    </div>
                    <p className="pl-7 text-[14px] leading-relaxed text-ink-700/80">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="on-dark bg-ink-900 p-7">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-300">What Happens Next</p>
              <ol className="space-y-4">
                {nextSteps.map((step) => (
                  <li key={step.n} className="flex items-start gap-4">
                    <span className="font-num text-sm font-medium leading-none text-brass-300">{step.n}</span>
                    <p className="text-[14px] leading-relaxed text-cream-100/75">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-ink-900/15 pt-8">
              <p className="font-display text-[1.5rem] leading-tight text-ink-900">Looking for a specific role?</p>
              <p className="mb-6 mt-2 text-[14px] leading-relaxed text-ink-700/80">
                Browse our active job listings and apply directly to open positions.
              </p>
              <Link to="/jobs" className="btn-outline">View Open Positions</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────
export default function SubmitResumePage() {
  return (
    <>
      <PageHeader />
      <SubmitSection />
    </>
  )
}

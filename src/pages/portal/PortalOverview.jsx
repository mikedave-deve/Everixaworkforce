import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Clock, CalendarClock, FileText, Award, ArrowRight, MapPin } from 'lucide-react'
import { getSession } from '../../lib/auth'
import { timesheet, upcomingShift, documents, announcements, recognitionPoints } from '../../data/employeePortal'

function StatTile({ icon: Icon, value, suffix = '', label }) {
  const numRef = useRef(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const counter = { val: 0 }
    const tween = gsap.to(counter, {
      val: value,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = Math.round(counter.val).toLocaleString()
      },
    })
    return () => tween.kill()
  }, [value])

  return (
    <div className="bg-white border border-forest-100 rounded-sm p-5 hover:shadow-md hover:border-forest-200 transition-all duration-300">
      <div className="w-9 h-9 bg-forest-50 border border-forest-100 rounded-sm flex items-center justify-center mb-4">
        <Icon className="w-4 h-4 text-forest-600" />
      </div>
      <p className="font-display text-3xl font-bold text-forest-900">
        <span ref={numRef}>0</span>{suffix}
      </p>
      <p className="font-body text-xs text-forest-500 mt-1">{label}</p>
    </div>
  )
}

export default function PortalOverview() {
  const session = getSession()
  const firstName = session?.name?.split(' ')[0] ?? 'there'
  const weeklyHours = timesheet.reduce((sum, d) => sum + d.hours, 0)
  const latestAnnouncement = announcements[0]
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.portal-reveal',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref}>
      <div className="portal-reveal mb-8">
        <p className="section-label mb-2">Overview</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
          Welcome back, {firstName}
        </h1>
        <p className="font-body text-sm text-forest-700/70 mt-2">
          Here's what's happening with your account this week.
        </p>
      </div>

      <div className="portal-reveal grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={Clock} value={weeklyHours} suffix=" hrs" label="Hours This Week" />
        <StatTile icon={CalendarClock} value={1} label="Upcoming Shift" />
        <StatTile icon={FileText} value={documents.length} label="Documents on File" />
        <StatTile icon={Award} value={recognitionPoints} label="Recognition Points" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="portal-reveal lg:col-span-3 bg-forest-950 rounded-sm p-7 relative overflow-hidden">
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-forest-400 mb-3">
            {upcomingShift.label}
          </p>
          <p className="font-display text-2xl font-bold text-white mb-1">{upcomingShift.day}</p>
          <p className="font-body text-sm text-cream-200/70 mb-4">{upcomingShift.time}</p>
          <div className="flex items-center gap-2 text-cream-200/60">
            <MapPin className="w-4 h-4" />
            <span className="font-body text-xs">{upcomingShift.location}</span>
          </div>
          <Link to="/portal/timesheet" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium font-body text-forest-400 hover:text-forest-300 transition-colors">
            View full timesheet <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="portal-reveal lg:col-span-2 bg-white border border-forest-100 rounded-sm p-7">
          <p className="section-label mb-3">Latest Announcement</p>
          <p className="font-display text-lg font-semibold text-forest-900 mb-1.5">{latestAnnouncement.title}</p>
          <p className="font-body text-xs text-forest-400 mb-3">{latestAnnouncement.date}</p>
          <p className="font-body text-sm text-forest-700/70 leading-relaxed line-clamp-3">
            {latestAnnouncement.body}
          </p>
          <Link to="/portal/announcements" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium font-body text-forest-600 hover:text-forest-800 transition-colors">
            View all announcements <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

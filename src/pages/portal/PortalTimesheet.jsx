import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Clock } from 'lucide-react'
import { timesheet, upcomingShift } from '../../data/employeePortal'

const TARGET_HOURS = 8

export default function PortalTimesheet() {
  const barsRef = useRef(null)
  const weeklyTotal = timesheet.reduce((sum, d) => sum + d.hours, 0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hour-bar',
        { width: '0%' },
        { width: (i, el) => el.dataset.width, duration: 1, ease: 'power2.out', stagger: 0.08 }
      )
    }, barsRef)
    return () => ctx.revert()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <p className="section-label mb-2">Timesheet</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
          This Week's Hours
        </h1>
      </div>

      <div className="bg-forest-950 rounded-sm p-6 mb-6 flex items-center gap-4">
        <div className="w-11 h-11 bg-forest-800 rounded-sm flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-forest-300" />
        </div>
        <div>
          <p className="font-body text-xs text-forest-400 uppercase tracking-widest mb-0.5">{upcomingShift.label}</p>
          <p className="font-body text-sm text-white">
            {upcomingShift.day} · {upcomingShift.time} · {upcomingShift.location}
          </p>
        </div>
      </div>

      <div ref={barsRef} className="bg-white border border-forest-100 rounded-sm overflow-hidden">
        <div className="divide-y divide-forest-50">
          {timesheet.map((entry) => {
            const pct = Math.min(100, Math.round((entry.hours / TARGET_HOURS) * 100))
            return (
              <div key={entry.day} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="sm:w-32 shrink-0">
                  <p className="font-body text-sm font-semibold text-forest-900">{entry.day}</p>
                  <p className="font-body text-xs text-forest-400">{entry.date}</p>
                </div>
                <div className="sm:w-40 shrink-0 font-body text-xs text-forest-600">
                  {entry.clockIn} – {entry.clockOut}
                </div>
                <div className="flex-1 h-2 bg-forest-50 rounded-full overflow-hidden">
                  <div
                    className="hour-bar h-full bg-forest-500 rounded-full"
                    data-width={`${pct}%`}
                    style={{ width: 0 }}
                  />
                </div>
                <div className="sm:w-16 text-right font-body text-sm font-semibold text-forest-900 shrink-0">
                  {entry.hours > 0 ? `${entry.hours}h` : '—'}
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-5 bg-forest-50 flex items-center justify-between">
          <span className="font-body text-sm font-semibold text-forest-900">Weekly Total</span>
          <span className="font-display text-xl font-bold text-forest-700">{weeklyTotal.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  )
}

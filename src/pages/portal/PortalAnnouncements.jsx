import { Megaphone, Award } from 'lucide-react'
import { announcements } from '../../data/employeePortal'
import { staff, employeeOfTheMonthId } from '../../data/staff'

export default function PortalAnnouncements() {
  const eotm = staff.find(s => s.id === employeeOfTheMonthId) ?? staff[0]

  return (
    <div>
      <div className="mb-8">
        <p className="section-label mb-2">Announcements</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-forest-900">
          Company News & Recognition
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white border border-forest-100 rounded-sm p-6 hover:border-forest-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-forest-50 border border-forest-100 rounded-sm flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4 text-forest-600" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-forest-900 mb-0.5">{a.title}</p>
                  <p className="font-body text-xs text-forest-400 mb-2">{a.date}</p>
                  <p className="font-body text-sm text-forest-700/70 leading-relaxed">{a.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-forest-900 rounded-sm overflow-hidden">
          <div className="relative overflow-hidden bg-forest-100" style={{ minHeight: '200px' }}>
            <img
              src={eotm.image}
              alt={eotm.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-yellow-400 text-forest-900 px-3 py-1 rounded-full shadow-md">
              <Award className="w-3.5 h-3.5" />
              <span className="font-body text-xs font-bold tracking-wide">Employee of the Month</span>
            </div>
          </div>
          <div className="p-6">
            <p className="font-display text-xl font-bold text-white mb-1">{eotm.name}</p>
            <p className="font-body text-xs font-medium text-forest-400 tracking-widest uppercase mb-3">{eotm.role}</p>
            {eotm.bio && (
              <p className="font-body text-sm text-cream-200/70 leading-relaxed">{eotm.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

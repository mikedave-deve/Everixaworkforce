import { wageGuide } from '../data'

/** Approved hourly wage ranges for U.S. employers, one row per remote role. */
export default function WageTable({ tone = 'light' }) {
  const dark = tone === 'dark'
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-[15px]">
          <thead>
            <tr className={`border-b text-[11px] uppercase tracking-[0.16em] ${dark ? 'border-cream-50/15 text-brass-300' : 'border-ink-900/15 text-ink-600'}`}>
              <th scope="col" className="py-5 pr-4 font-semibold">Role</th>
              <th scope="col" className="py-5 pr-4 font-semibold">Schedule</th>
              <th scope="col" className="py-5 text-right font-semibold">Approved hourly wage</th>
            </tr>
          </thead>
          <tbody>
            {wageGuide.map((w) => (
              <tr key={w.role} className={`border-b ${dark ? 'border-cream-50/10' : 'border-ink-900/10'}`}>
                <td className={`py-4 pr-4 font-display text-[1.3rem] ${dark ? 'text-cream-50' : 'text-ink-900'}`}>{w.role}</td>
                <td className={`py-4 pr-4 ${dark ? 'text-cream-100/70' : 'text-ink-600'}`}>{w.type}</td>
                <td className={`py-4 text-right font-semibold tabular-nums ${dark ? 'text-cream-50' : 'text-ink-800'}`}>{w.wage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`mt-6 max-w-2xl text-[13px] leading-relaxed ${dark ? 'text-cream-100/60' : 'text-ink-600'}`}>
        Approved hourly wage ranges for U.S. employers. Final pay depends on experience, hours worked and your state's minimum wage.
      </p>
    </div>
  )
}

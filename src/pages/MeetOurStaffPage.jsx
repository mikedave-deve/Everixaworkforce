import { useScrollReveal } from '../hooks/useScrollReveal'
import { staff, employeeOfTheMonthId } from '../data/staff'
import PageHeaderImage from '../components/PageHeaderImage'
import { SectionHead } from '../components/Editorial'
import staffHero from '../assets/stock/contact-team.jpg'

const fallbackAvatar = (name, size) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=274d38&color=faf8f3&size=${size}`

function StaffCard({ member }) {
  return (
    <article className="reveal group">
      <div className="aspect-[4/5] overflow-hidden bg-ink-100">
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover object-top grayscale contrast-[1.05] transition-[transform,filter] duration-[900ms] ease-out group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackAvatar(member.name, 400) }}
        />
      </div>
      <h3 className="mt-5 font-display text-[1.55rem] leading-tight text-ink-900">{member.name}</h3>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">{member.role}</p>
      {member.bio && <p className="mt-3 text-[14px] leading-relaxed text-ink-700/75">{member.bio}</p>}
    </article>
  )
}

function StaffGrid() {
  const ref = useScrollReveal('.reveal')
  const gridMembers = staff.filter(s => s.id !== employeeOfTheMonthId)

  return (
    <section className="section-wrapper bg-cream-50" ref={ref}>
      <div className="container-main">
        <SectionHead
          index="01"
          label="The Team"
          title={<>People you'll <em className="text-brass-700">work with.</em></>}
          lede="Each member of our team brings deep sector expertise and a genuine commitment to getting the right result for every candidate and employer."
        />
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {gridMembers.map(member => <StaffCard key={member.id} member={member} />)}
        </div>
      </div>
    </section>
  )
}

function EmployeeOfTheMonth() {
  const ref = useScrollReveal('.reveal')
  const eotm = staff.find(s => s.id === employeeOfTheMonthId) ?? staff[0]

  return (
    <section className="on-dark grain relative bg-ink-900 py-24 md:py-32" ref={ref}>
      <div className="container-main relative">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="reveal aspect-[4/5] overflow-hidden bg-ink-800">
            <img
              src={eotm.image}
              alt={eotm.name}
              className="h-full w-full object-cover object-top grayscale contrast-[1.05]"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackAvatar(eotm.name, 600) }}
            />
          </div>

          <div>
            <p className="reveal eyebrow mb-6">Employee Recognition</p>
            <h2 className="reveal section-title mb-10">Employee of <em className="text-brass-300">the month.</em></h2>
            <p className="reveal mb-6 max-w-md text-[16px] leading-relaxed text-cream-100/70">
              Each month we celebrate a team member who exemplifies our values of integrity,
              dedication, and outstanding client service.
            </p>

            <div className="reveal border-t border-cream-50/15 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-300">This Month's Honoree</p>
              <h3 className="mt-3 font-display text-[clamp(2rem,3.4vw,3rem)] leading-tight text-cream-50">{eotm.name}</h3>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream-100/60">{eotm.role}</p>
              {eotm.bio && <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream-100/70">{eotm.bio}</p>}
              <blockquote className="mt-8 border-l border-brass-400 pl-5 font-display text-[1.3rem] italic leading-snug text-cream-50/90">
                "Outstanding performance, consistent excellence, and an unwavering commitment to
                the team. This recognition is well deserved."
              </blockquote>
              <p className="mt-4 text-[13px] text-cream-100/55">— James Whitfield, CEO &amp; Founder</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function MeetOurStaffPage() {
  return (
    <>
      <PageHeaderImage
        image={staffHero}
        label="Our People"
        title="Meet our"
        highlight="staff"
        subtitle="The talented individuals behind every successful placement. We're a team of specialists who are deeply passionate about connecting great people with great opportunities."
      />
      <StaffGrid />
      <EmployeeOfTheMonth />
    </>
  )
}

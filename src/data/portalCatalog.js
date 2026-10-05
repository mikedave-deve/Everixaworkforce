/* Static reference content for the employee portal (plans, programs, FAQs). */

export const medicalPlans = [
  { id: 'pp', name: 'Everixa PPO Plus', premium: 118, deductible: '$1,000', oop: '$4,500', note: 'Largest provider network, no referrals needed.' },
  { id: 'hd', name: 'HSA-Qualified High Deductible', premium: 74, deductible: '$3,200', oop: '$6,500', note: 'Lower premium with a tax-advantaged health savings account.' },
  { id: 'hm', name: 'Everixa HMO Select', premium: 92, deductible: '$500', oop: '$3,800', note: 'Coordinated care through a primary care physician.' },
  { id: 'wv', name: 'Waive coverage', premium: 0, deductible: '—', oop: '—', note: 'I have coverage elsewhere.' },
]

export const coverageLevels = [
  { id: 'ee', label: 'Employee only', factor: 1 },
  { id: 'es', label: 'Employee + spouse', factor: 2.1 },
  { id: 'ec', label: 'Employee + child(ren)', factor: 1.9 },
  { id: 'fa', label: 'Family', factor: 2.8 },
]

export const otherBenefits = [
  { id: 'dental', name: 'Dental', detail: 'Preventive care covered at 100%.', cost: '$8.75 / pay period' },
  { id: 'vision', name: 'Vision', detail: 'Annual exam plus frames or contacts allowance.', cost: '$4.20 / pay period' },
  { id: 'life', name: 'Basic life & AD&D', detail: '1× annual pay, paid by Everixa.', cost: 'Company paid' },
  { id: 'std', name: 'Short-term disability', detail: '60% of pay after a 7-day waiting period.', cost: '$6.10 / pay period' },
]

export const companyServices = [
  { id: 'eap', name: 'Employee Assistance Program', body: 'Free, confidential counseling and life-event support for you and your household, available 24/7.', cta: 'Request this service' },
  { id: 'tuition', name: 'Tuition & Certification Assistance', body: 'Up to $2,500 per year toward job-related courses and professional certifications.', cta: 'Request this service' },
  { id: 'referral', name: 'Referral Bonus Program', body: 'Earn a bonus when someone you refer is placed and completes 90 days.', cta: 'Request this service' },
  { id: 'coach', name: 'Career Coaching', body: 'One-on-one sessions with a recruiter on resumes, interviews and next-step planning.', cta: 'Request this service' },
  { id: 'finwell', name: 'Financial Wellness', body: 'Budgeting tools, earned-wage access guidance and free retirement planning consultations.', cta: 'Request this service' },
  { id: 'legal', name: 'Legal & ID Theft Protection', body: 'Discounted legal consultations and identity monitoring through our partner network.', cta: 'Request this service' },
]

export const hrContacts = [
  { name: 'HR & Payroll Desk', detail: 'Pay, benefits, leave and records', phone: '(863) 243-3789', email: 'info@everixaworkforce.com', hours: 'Mon–Fri, 8:00 AM – 6:00 PM PT' },
  { name: 'Safety & Incident Line', detail: 'Injuries, near-misses, site concerns', phone: '(863) 243-3789', email: 'info@everixaworkforce.com', hours: 'Available 24/7 for emergencies' },
]

export const faqs = [
  { q: 'When is payday?', a: 'Pay is issued every other Friday by direct deposit. If the Friday is a bank holiday, funds arrive the business day before.' },
  { q: 'How do I correct a timesheet after submitting it?', a: 'Contact your supervisor before the Friday 5:00 PM deadline and ask them to return it to you. After approval, open a Help request so payroll can adjust the next check.' },
  { q: 'How much notice do I need for time off?', a: 'Please request vacation at least 14 days ahead. Sick leave can be requested the same day.' },
  { q: 'Where do I get my W-2?', a: 'Request it in Tax Forms. Once HR approves, you can download it as a PDF.' },
  { q: 'I lost my badge or equipment — what now?', a: 'Open a Help & HR request and tell us what was lost. For lost badges, also tell your supervisor so the old badge can be deactivated.' },
  { q: 'How do I change my direct deposit?', a: 'Update it on the Pay page or in Information Setup. Changes made before Tuesday take effect on the next pay date.' },
]

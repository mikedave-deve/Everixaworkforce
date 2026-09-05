

// ─────────────────────────────────────────────
//  JOBS DATA
// ─────────────────────────────────────────────
export const jobs = [
  {
    id: 1,
    title: 'Environmental Project Manager',
    company: 'Everixa Workforce',
    location: 'Portland, OR',
    type: 'Full-Time',
    category: 'Management',
    salary: '$85,000 - $105,000',
    posted: '2 days ago',
    description:
      'Lead multi-disciplinary environmental remediation projects from assessment through closure. Coordinate with regulatory agencies and client stakeholders.',
    tags: ['NEPA', 'Remediation', 'PMP'],
  },
  {
    id: 2,
    title: 'Customer Service Representative',
    company: 'Pacific Basin Consulting',
    location: 'Remote, USA',
    type: 'Part-Time',
    category: 'Customer Service',
    salary: '$35 - $80',
    posted: '3 days ago',
    description:
      'Handles customer inquiries, resolves complaints, and provides product or service information.',
    tags: ['Geology', 'Phase II ESA', 'GIS'],
  },
  {
    id: 3,
    title: 'Accounts Payable Clerk',
    company: 'NorthWest Industrial',
    location: 'Remote, USA',
    type: 'Contract',
    category: 'Bookkeeping',
    salary: '$25 - $70/hr',
    posted: '1 day ago',
    description:
      'Manages invoices, processes payments, and maintains accurate financial documentation.',
    tags: ['OSHA', 'ISO 14001', 'Auditing'],
  },
  {
    id: 4,
    title: 'Data Entry Clerk',
    company: 'Columbia Basin Ecology',
    location: 'Remote / Field',
    type: 'Seasonal',
    category: 'Data Entry',
    salary: '$35 - $90/hr',
    posted: '5 days ago',
    description:
      'Perform wetland delineations, jurisdictional determinations, and mitigation monitoring under 404/401 permits.',
    tags: ['Wetlands', 'Section 404', 'Botany'],
  },
  {
    id: 5,
    title: 'Payroll Specialist',
    company: 'ClearSky Technologies',
    location: 'Remote, USA',
    type: 'Contract',
    category: 'Payroll',
    salary: '$35 - $80',
    posted: '1 week ago',
    description:
      'Responsible for processing employee payroll, ensuring accurate wage calculations, tax deductions, and compliance with company policies.',
    tags: ['AERMOD', 'Title V', 'GHG Reporting'],
  },
  {
    id: 6,
    title: 'Payroll Administrator',
    company: 'CleanSite Solutions',
    location: 'Remote, USA',
    type: 'Contract',
    category: 'Payroll',
    salary: '35 - $80/hr',
    posted: '4 days ago',
    description:
      'Manages payroll records, verifies employee hours, and assists with payroll reporting and compliance tasks.',
    tags: ['LNAPL', 'Groundwater', 'Field Work'],
  },
  {
    id: 7,
    title: 'Bookkeeper',
    company: 'Cascade Energy Group',
    location: 'Remote, USA',
    type: 'Contract',
    category: 'Bookkeeping',
    salary: '$30 - $75/hr',
    posted: '6 days ago',
    description:
      'Maintains financial records, tracks expenses, and reconciles accounts for businesses.',
    tags: ['RCRA', 'CWA', 'Reporting'],
  },
  {
    id: 8,
    title: 'IT Support',
    company: 'GeoData Northwest',
    location: 'Remote, USA',
    type: 'Contract',
    category: 'I.T',
    salary: '$30 - $82/hr',
    posted: '2 weeks ago',
    description:
      'Provides technical assistance, troubleshoots systems, and maintains company hardware and software.',
    tags: ['ArcGIS', 'QGIS', 'Python'],
  },
]

// ─────────────────────────────────────────────
//  SERVICES DATA
// ─────────────────────────────────────────────
export const services = [
  {
    id: 'direct-placement',
    title: 'Direct Placement',
    icon: '',
    shortDesc: 'Permanent hires aligned with your long-term team vision.',
    description:
      'Our direct placement service identifies, vets, and presents qualified environmental professionals for permanent roles - from entry-level technicians to senior executives. We handle the search so you can focus on your mission.',
    items: [
      'Full candidate lifecycle management',
      'Cultural and technical fit assessment',
      'Reference and credential verification',
      'Salary benchmarking and negotiation support',
      '90-day placement guarantee',
    ],
  },
  {
    id: 'contract-staffing',
    title: 'Contract Staffing',
    icon: '',
    shortDesc: 'Flexible talent for project-based or seasonal needs.',
    description:
      'Scale your workforce precisely when you need it. Our contract staffing solutions provide experienced environmental professionals for short-term projects, seasonal peaks, and specialized engagements.',
    items: [
      'Rapid deployment within 48-72 hours',
      'Payroll and benefits administration',
      'Workers\' compensation coverage',
      'Contract-to-hire conversion options',
      'Multi-state compliance management',
    ],
  },
  {
    id: 'executive-search',
    title: 'Executive Search',
    icon: '',
    shortDesc: 'Retained search for director, VP, and C-suite roles.',
    description:
      'Leadership in the environmental sector requires rare combinations of technical mastery and business acumen. Our retained executive search practice uncovers candidates who are not on job boards.',
    items: [
      'Confidential, retained search model',
      'Market mapping and competitive intelligence',
      'Leadership competency assessments',
      'Onboarding integration planning',
      'Board-level placement expertise',
    ],
  },
  {
    id: 'consulting',
    title: 'Workforce Consulting',
    icon: '',
    shortDesc: 'Strategic hiring, compensation, and team structure analysis.',
    description:
      'Beyond individual hires - we help organizations design hiring systems, understand compensation trends, and build employer brand strategies to attract top environmental talent.',
    items: [
      'Compensation and benefits benchmarking',
      'Organizational structure design',
      'Diversity and inclusion hiring strategy',
      'Job description architecture',
      'Campus and early-career pipeline development',
    ],
  },
]

// ─────────────────────────────────────────────
//  INDUSTRIES DATA
// ─────────────────────────────────────────────
export const industries = [
  {
    id: 'remediation',
    title: 'Administrative & Office Support',
    icon: '',
    description: 'Provides essential workplace support through organization, coordination, and day-to-day office management that keeps businesses running efficiently.',
    color: 'bg-forest-50 border-forest-200',
  },
  {
    id: 'energy',
    title: 'Accounting & Finance',
    icon: '',
    description: 'Manages financial records, payroll, budgeting, and compliance to ensure organizations maintain accurate and responsible financial operations.',
    color: 'bg-cream-50 border-cream-300',
  },
  {
    id: 'consulting',
    title: 'Healthcare Administration',
    icon: '',
    description: 'Supports medical facilities by managing patient records, billing, scheduling, and administrative operations that enable healthcare professionals to focus on patient care',
    color: 'bg-forest-50 border-forest-200',
  },
  {
    id: 'water',
    title: 'Customer Service',
    icon: '',
    description: 'Focuses on assisting customers, resolving issues, and maintaining positive relationships that enhance brand trust and customer satisfaction.',
    color: 'bg-cream-50 border-cream-300',
  },
  {
    id: 'ehs',
    title: 'Sales & Business Development',
    icon: '',
    description: 'Drives company growth by building client relationships, generating revenue opportunities, and expanding market presence.',
    color: 'bg-forest-50 border-forest-200',
  },
  {
    id: 'ecology',
    title: 'Human Resources',
    icon: '',
    description: 'Handles workforce management including recruitment, employee relations, training, and organizational development.',
    color: 'bg-cream-50 border-cream-300',
  },
  {
    id: 'geoscience',
    title: 'IT & Technology',
    icon: '',
    description: 'Supports digital infrastructure, software systems, cybersecurity, and technical operations that power modern business environments.',
    color: 'bg-forest-50 border-forest-200',
  },
  {
    id: 'municipal',
    title: 'Logistics & Supply Chain',
    icon: '',
    description: 'Coordinates the movement, storage, and delivery of goods to ensure products reach customers efficiently and on time.',
    color: 'bg-cream-50 border-cream-300',
  },
]

// ─────────────────────────────────────────────
//  TESTIMONIALS DATA
// ─────────────────────────────────────────────
export const testimonials = [
  {
    id: 1,
    quote:
      "Everixa Workforce consistently delivers candidates who genuinely understand both the technical and regulatory dimensions of our work. They've placed four of our key project managers - all exceptional hires.",
    name: 'Dr. Rebecca Holt',
    title: 'Director of Operations',
    company: 'Pacific Basin Environmental',
    initials: 'RH',
  },
  {
    id: 2,
    quote:
      "When our Phase II team needed to triple in size before a major field season, Everixa mobilized eight qualified technicians in under a week. Quality didn't suffer for speed.",
    name: 'Marcus Chen',
    title: 'VP of Field Services',
    company: 'SteelBridge Consulting Group',
    initials: 'MC',
  },
  {
    id: 3,
    quote:
      "I was skeptical that a recruiter could find someone with both the RCRA expertise and leadership skills we needed. Everixa proved me wrong - our new Compliance Director is outstanding.",
    name: 'Amanda Torres',
    title: 'Chief Environmental Officer',
    company: 'Cascade Manufacturing',
    initials: 'AT',
  },
  {
    id: 4,
    quote:
      "As a candidate, the experience was refreshingly human. They took time to understand my career goals, not just match keywords on a resume. I'm in the best role of my career.",
    name: 'James Whitfield',
    title: 'Senior Hydrogeologist',
    company: 'GreenPath Solutions',
    initials: 'JW',
  },
]

// ─────────────────────────────────────────────
//  STATS DATA
// ─────────────────────────────────────────────
export const stats = [
  { value: 1400, suffix: '+', label: 'Placements Made', description: 'Successful hires across 18 years' },
  { value: 94, suffix: '%', label: 'Retention Rate', description: '1-year post-placement retention' },
  { value: 320, suffix: '+', label: 'Client Partners', description: 'Firms who hire through us repeatedly' },
  { value: 18, suffix: ' yrs', label: 'Industry Focus', description: 'Exclusively environmental sector' },
]

// ─────────────────────────────────────────────
//  TEAM DATA
// ─────────────────────────────────────────────
export const team = [
  {
    id: 1,
    name: 'Catherine Moore',
    title: 'Founder & CEO',
    bio: 'Former environmental engineer with 12 years in the field before founding Everixa Workforce. Catherine built the firm on the principle that great hiring starts with technical fluency.',
    initials: 'CM',
  },
  {
    id: 2,
    name: 'David Park',
    title: 'Director of Candidate Relations',
    bio: 'With a background in ecology and environmental consulting, David brings deep sector knowledge to every candidate conversation. He leads our science and natural resources practice.',
    initials: 'DP',
  },
  {
    id: 3,
    name: 'Serena Yamamoto',
    title: 'Client Development Manager',
    bio: 'Serena specializes in executive search and workforce consulting for mid-to-large environmental firms. She has led over 200 director and C-level placements.',
    initials: 'SY',
  },
  {
    id: 4,
    name: 'Omar Khalil',
    title: 'EHS & Compliance Practice Lead',
    bio: 'Former EHS manager at a Fortune 500 company, Omar leads our industrial compliance and health & safety staffing practice with unmatched sector credibility.',
    initials: 'OK',
  },
]

// ─────────────────────────────────────────────
//  TIMELINE DATA
// ─────────────────────────────────────────────
export const timeline = [
  { year: '2006', event: 'Everixa Workforce founded in Portland, OR with a focus on environmental consulting placements.' },
  { year: '2010', event: 'Expanded into EHS and compliance staffing; grew to a team of 12 specialists.' },
  { year: '2014', event: 'Launched executive search practice. Completed first C-suite placement.' },
  { year: '2018', event: 'Opened offices in Seattle and San Francisco. Surpassed 500 active client accounts.' },
  { year: '2022', event: 'Introduced renewable energy staffing vertical in response to surging market demand.' },
  { year: '2024', event: 'Reached 1,400 cumulative placements. Named a Top Environmental Staffing Firm by Green Business Journal.' },
]

// ─────────────────────────────────────────────
//  JOB CATEGORIES (filter options)
// ─────────────────────────────────────────────
export const jobCategories = ['All', 'Management', 'Science', 'EHS', 'Engineering', 'Field', 'Compliance', 'Technology']
export const jobTypes = ['All Types', 'Full-Time', 'Contract', 'Part-Time', 'Seasonal']
export const jobLocations = ['All Locations', 'Portland, OR', 'Seattle, WA', 'San Francisco, CA', 'Sacramento, CA', 'Remote / Field', 'Boise, ID', 'Olympia, WA', 'Tacoma, WA']

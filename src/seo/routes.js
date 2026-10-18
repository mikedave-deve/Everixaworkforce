// Single source of truth for page-level SEO. Imported by the browser (RouteSeo)
// and by scripts/prerender.mjs at build time, so keep it plain ESM with no JSX.

export const SITE_URL = 'https://everixaworkforce.com'
export const SITE_NAME = 'Everixa Workforce'
export const DEFAULT_IMAGE = `${SITE_URL}/preview.png?v=2`

export const publicRoutes = [
  {
    path: '/',
    title: 'Work From Home Jobs with Approved Hourly Pay | Everixa Workforce',
    description:
      'Find real work-from-home jobs with approved hourly pay: customer support, data entry, bookkeeping and admin. Flexible, remote and open to every age and stage of life.',
    heading: 'Work-from-home jobs with approved hourly pay',
    priority: 1.0,
    changefreq: 'weekly',
    source: 'src/pages/HomePage.jsx',
  },
  {
    path: '/jobs',
    title: 'Remote Jobs & Work From Home Openings | Everixa Workforce',
    description:
      'Browse fully remote jobs with the approved hourly wage shown up front: customer support, data entry, bookkeeping, administrative and more. Training provided, flexible hours.',
    heading: 'Find a job you can do from home',
    priority: 0.9,
    changefreq: 'daily',
    source: 'src/data/index.js',
  },
  {
    path: '/candidates',
    title: 'Remote Job Seekers: Get Matched to Work From Home | Everixa Workforce',
    description:
      'Whatever your age or experience, we match you with a friendly, flexible work-from-home job and an approved hourly wage you can count on. See how it works.',
    heading: 'Find real work you can do from home',
    priority: 0.8,
    changefreq: 'monthly',
    source: 'src/pages/CandidatesPage.jsx',
  },
  {
    path: '/employers',
    title: 'Hire Remote Workers: Remote Staffing for Employers | Everixa Workforce',
    description:
      'Hire friendly, reliable remote team members for customer support, data entry, bookkeeping and administration. We screen, place and run payroll at approved hourly wages.',
    heading: 'Hire work-from-home talent',
    priority: 0.8,
    changefreq: 'monthly',
    source: 'src/pages/EmployersPage.jsx',
  },
  {
    path: '/services',
    title: 'Remote Staffing Services: Direct Hire, Contract & Payroll | Everixa Workforce',
    description:
      'Remote direct placement, flexible contract staffing and virtual team building, with payroll, taxes and a 90-day placement guarantee handled for you.',
    heading: 'Staffing solutions for remote teams',
    priority: 0.8,
    changefreq: 'monthly',
    source: 'src/pages/ServicesPage.jsx',
  },
  {
    path: '/industries',
    title: 'Remote Roles by Industry & Skill | Everixa Workforce',
    description:
      'From customer support to bookkeeping, find a remote role for almost every skill, schedule and stage of life. Explore the work-from-home fields we hire for.',
    heading: 'Work-from-home roles across industries',
    priority: 0.7,
    changefreq: 'monthly',
    source: 'src/pages/IndustriesPage.jsx',
  },
  {
    path: '/about',
    title: 'About Everixa Workforce: People-First Remote Staffing Since 2006',
    description:
      'Since 2006 Everixa Workforce has treated every placement as a long-term relationship. Meet the staffing firm connecting people with work-from-home careers.',
    heading: 'People-first staffing since 2006',
    priority: 0.6,
    changefreq: 'yearly',
    source: 'src/pages/AboutPage.jsx',
  },
  {
    path: '/staff',
    title: 'Meet Our Team | Everixa Workforce',
    description:
      'Meet the recruiters, specialists and leaders behind every Everixa placement, a team passionate about connecting great people with great remote opportunities.',
    heading: 'Meet our team',
    priority: 0.4,
    changefreq: 'yearly',
    source: 'src/pages/MeetOurStaffPage.jsx',
  },
  {
    path: '/contact',
    title: 'Contact Everixa Workforce | Offices in Chicago, San Francisco & Boston',
    description:
      'Looking to hire or looking for your next role? Call (863) 243-3789 or send a message. We respond to every inquiry within one business day.',
    heading: "Let's start a conversation",
    priority: 0.7,
    changefreq: 'yearly',
    source: 'src/pages/ContactPage.jsx',
  },
  {
    path: '/apply',
    title: 'Apply Now: Remote Job Application | Everixa Workforce',
    description:
      'Take the first step toward your next career milestone. Complete the short application and a recruiter will be in touch within one business day.',
    heading: 'Apply now',
    priority: 0.7,
    changefreq: 'yearly',
    source: 'src/pages/ApplyNowPage.jsx',
  },
  {
    path: '/submit-resume',
    title: 'Submit Your Resume | Everixa Workforce',
    description:
      'Share your experience with our team. We review every resume and reach out when we have a remote role that genuinely fits your background and goals.',
    heading: 'Submit your resume',
    priority: 0.6,
    changefreq: 'yearly',
    source: 'src/pages/SubmitResumePage.jsx',
  },
]

// Pages that must never appear in search results.
export const privateRoutes = [
  { path: '/login', title: 'Sign in | Everixa Workforce' },
  { path: '/signup', title: 'Create account | Everixa Workforce' },
  { path: '/forgot-password', title: 'Reset password | Everixa Workforce' },
  { path: '/reset-password', title: 'Choose a new password | Everixa Workforce' },
]

export const notFound = {
  title: 'Page not found | Everixa Workforce',
  description: "The page you're looking for doesn't exist.",
}

const byPath = new Map(publicRoutes.map((r) => [r.path, r]))

/** Resolve SEO settings for a pathname. */
export function seoFor(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const hit = byPath.get(path)
  if (hit) return { ...hit, canonical: SITE_URL + (path === '/' ? '/' : path), noindex: false }
  const isPrivate =
    path.startsWith('/portal') ||
    path.startsWith('/admin') ||
    privateRoutes.some((r) => r.path === path)
  if (isPrivate) {
    const named = privateRoutes.find((r) => r.path === path)
    return {
      title: named?.title ?? 'Employee portal | Everixa Workforce',
      description: 'Everixa Workforce secure sign-in.',
      canonical: null,
      noindex: true,
    }
  }
  return { ...notFound, canonical: null, noindex: true }
}

// ─── Structured data ─────────────────────────────────────────────────────────

const ORG_ID = `${SITE_URL}/#organization`
const SITE_ID = `${SITE_URL}/#website`

export function organizationSchema(offices = []) {
  return {
    '@type': ['Organization', 'EmploymentAgency'],
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: 'Everixa Workforce LLC',
    url: SITE_URL + '/',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/android-chrome-512x512.png`, width: 512, height: 512 },
    image: DEFAULT_IMAGE,
    description:
      'Remote staffing and recruitment firm connecting people with work-from-home jobs and approved hourly pay since 2006.',
    foundingDate: '2006',
    telephone: '+1-863-243-3789',
    email: 'admin.everixaworkforce@gmail.com',
    areaServed: { '@type': 'Country', name: 'United States' },
    knowsAbout: ['Remote staffing', 'Work from home jobs', 'Customer support', 'Data entry', 'Bookkeeping', 'Administrative support'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+1-863-243-3789',
        email: 'admin.everixaworkforce@gmail.com',
        areaServed: 'US',
        availableLanguage: 'English',
      },
    ],
    location: offices.map((o) => ({
      '@type': 'Place',
      name: `Everixa Workforce ${o.city}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: o.address,
        addressLocality: o.city,
        addressRegion: o.state,
        postalCode: o.zip,
        addressCountry: 'US',
      },
    })),
  }
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE_URL + '/',
    name: SITE_NAME,
    inLanguage: 'en-US',
    publisher: { '@id': ORG_ID },
  }
}

function breadcrumbSchema(route) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }]
  if (route.path !== '/') {
    items.push({ '@type': 'ListItem', position: 2, name: route.heading, item: SITE_URL + route.path })
  }
  return { '@type': 'BreadcrumbList', itemListElement: items }
}

/**
 * JSON-LD graph for a public route. `extra` carries data-driven nodes
 * (e.g. the job list) so this file stays free of imports.
 */
export function schemaFor(route, { offices = [], extra = [] } = {}) {
  const graph = []
  graph.push(organizationSchema(offices), websiteSchema())
  graph.push({
    '@type': route.path === '/contact' ? 'ContactPage' : route.path === '/about' ? 'AboutPage' : 'WebPage',
    '@id': `${SITE_URL}${route.path === '/' ? '/' : route.path}#webpage`,
    url: SITE_URL + (route.path === '/' ? '/' : route.path),
    name: route.title,
    description: route.description,
    inLanguage: 'en-US',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
  })
  if (route.path !== '/') graph.push(breadcrumbSchema(route))
  graph.push(...extra)
  return { '@context': 'https://schema.org', '@graph': graph }
}

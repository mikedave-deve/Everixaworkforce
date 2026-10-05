import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react'
import { jobs, jobTypes } from '../data'
import PageHeaderImage from '../components/PageHeaderImage'
import jobsHero from '../assets/stock/jobs-videocall.jpg'

// Filter options come from the live listings so every option returns results.
const unique = (key) => [...new Set(jobs.map((j) => j[key]))]
const categoryOptions = ['All', ...unique('category')]
const typeOptions = jobTypes.filter((t) => t === 'All Types' || jobs.some((j) => j.type === t))
const locationOptions = ['All Locations', ...unique('location')]

function PageHeader() {
  return (
    <PageHeaderImage
      image={jobsHero}
      label="Career Opportunities"
      title="Find your next"
      highlight="career role"
      subtitle="Browse roles across various industries, engineering, compliance, and beyond. Updated weekly with curated opportunities from trusted clients."
    />
  )
}

function JobRow({ job }) {
  return (
    <li className="border-b border-ink-900/15">
      <Link
        to="/submit-resume"
        className="group grid gap-x-10 gap-y-4 py-9 transition-colors hover:bg-ink-100/50 md:grid-cols-[1.2fr_1fr_11rem] md:items-center md:px-4"
      >
        <div>
          <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-600">
            <span>{job.type}</span>
            <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-brass-500" />
            <span>{job.location}</span>
            <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-brass-500" />
            <span className="font-normal normal-case tracking-normal text-ink-500">{job.posted}</span>
          </p>
          <h3 className="font-display text-[clamp(1.7rem,2.6vw,2.3rem)] leading-tight text-ink-900">{job.title}</h3>
          <p className="mt-1 text-[14px] text-ink-600">{job.company}</p>
        </div>

        <div>
          <p className="line-clamp-2 max-w-md text-[15px] leading-relaxed text-ink-700/80">{job.description}</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-600">
            {job.tags.map((tag) => <li key={tag}>#{tag}</li>)}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-6 md:flex-col md:items-end md:gap-4">
          <span className="font-display text-xl text-ink-900">{job.salary}</span>
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-700">
            Apply now
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  )
}

function Pagination({ current, total, onChange }) {
  const base = 'h-10 min-w-10 px-3 text-[13px] font-medium transition-colors'
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${base} border border-ink-900/20 text-ink-800 hover:bg-ink-900 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-800`}
      >
        Prev
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          aria-current={page === current ? 'page' : undefined}
          className={`${base} ${page === current ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-800 hover:bg-ink-100'}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${base} border border-ink-900/20 text-ink-800 hover:bg-ink-900 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-800`}
      >
        Next
      </button>
    </nav>
  )
}

export default function JobsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All Types')
  const [location, setLocation] = useState('All Locations')
  const [currentPage, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const PER_PAGE = 5

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = query.toLowerCase()
      const matchQuery = !q || job.title.toLowerCase().includes(q) ||
                         job.company.toLowerCase().includes(q) ||
                         job.tags.some(t => t.toLowerCase().includes(q))
      const matchCat  = category === 'All' || job.category === category
      const matchType = type === 'All Types' || job.type === type
      const matchLoc  = location === 'All Locations' || job.location === location
      return matchQuery && matchCat && matchType && matchLoc
    })
  }, [query, category, type, location])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
  const filtersActive = category !== 'All' || type !== 'All Types' || location !== 'All Locations' || query

  function handleFilter(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  return (
    <>
      <PageHeader />

      {/* Search bar */}
      <div className="sticky top-[64px] z-30 border-b border-ink-900/10 bg-cream-50/95 backdrop-blur">
        <div className="container-main py-4">
          <div className="flex items-center gap-3">
            <div className="relative max-w-xl flex-1">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <label htmlFor="job-search" className="sr-only">Search jobs</label>
              <input
                id="job-search"
                type="search"
                placeholder="Job title, skill, or keyword..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="field !py-3 pl-11"
              />
            </div>
            <button
              type="button"
              aria-expanded={showFilters}
              onClick={() => setShowFilters(v => !v)}
              className={`btn ${showFilters ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/25 text-ink-900 hover:bg-ink-900 hover:text-cream-50'} !px-5 !py-3`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Category', value: category, options: categoryOptions, setter: handleFilter(setCategory) },
                { label: 'Type',     value: type,     options: typeOptions,     setter: handleFilter(setType)     },
                { label: 'Location', value: location, options: locationOptions, setter: handleFilter(setLocation) },
              ].map((filter) => (
                <div key={filter.label}>
                  <label htmlFor={`filter-${filter.label}`} className="sr-only">{filter.label}</label>
                  <select
                    id={`filter-${filter.label}`}
                    value={filter.value}
                    onChange={(e) => filter.setter(e.target.value)}
                    className="field !py-3"
                  >
                    {filter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="section-wrapper !pt-14 bg-cream-50">
        <div className="container-main">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[14px] text-ink-600" aria-live="polite">
              Showing <strong className="font-semibold text-ink-900">{filtered.length}</strong> position{filtered.length !== 1 ? 's' : ''}
            </p>
            {filtersActive && (
              <button
                onClick={() => { setQuery(''); setCategory('All'); setType('All Types'); setLocation('All Locations'); setPage(1) }}
                className="link-arrow !text-[11px]"
              >
                Clear filters
              </button>
            )}
          </div>

          {paginated.length > 0 ? (
            <ul className="border-t border-ink-900/15">
              {paginated.map((job) => <JobRow key={job.id} job={job} />)}
            </ul>
          ) : (
            <div className="border-t border-ink-900/15 py-24 text-center">
              <p className="font-display text-3xl text-ink-700">No results found</p>
              <p className="mt-2 text-[15px] text-ink-600">Try adjusting your search or filters.</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination current={currentPage} total={totalPages} onChange={setPage} />
          )}
        </div>
      </section>
    </>
  )
}

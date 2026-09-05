import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { jobs, jobCategories, jobTypes, jobLocations } from '../data'
import Badge from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import PageHeaderImage from '../components/PageHeaderImage'
import jobsHero from '../assets/stock/jobs-videocall.jpg'

function PageHeader() {
  return (
    <PageHeaderImage
      image={jobsHero}
      label="Career Opportunities"
      title="Find Your Next"
      highlight="Career Role"
      subtitle="Browse roles across various industries, engineering, compliance, and beyond. Updated weekly with curated opportunities from trusted clients."
    />
  )
}

function JobCard({ job }) {
  const typeVariant = {
    'Full-Time': 'success',
    'Contract':  'warning',
    'Part-Time': 'outline',
    'Seasonal':  'default',
  }

  return (
    <Card className="p-6 group hover:border-forest-300 cursor-pointer">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-forest-900 mb-1
                         group-hover:text-forest-700 transition-colors">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-body text-forest-600">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-forest-400" />
              <span className="text-forest-400 text-xs">{job.posted}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={typeVariant[job.type] || 'default'}>{job.type}</Badge>
        </div>
      </div>

      <p className="font-body text-sm text-forest-700/70 leading-relaxed mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span key={tag}
                  className="font-body text-xs px-2.5 py-1 bg-forest-50 text-forest-700
                             border border-forest-100 rounded-full">
              {tag}
            </span>
          ))}
        </div>
       <Link to="/submit-resume" className="flex items-center justify-between w-full sm:w-auto gap-4">
    <span className="font-body text-sm font-semibold text-forest-800">
        {job.salary}
    </span>

    <span className="inline-flex items-center gap-1.5 text-xs font-medium font-body
                     text-forest-600 hover:text-forest-800 transition-colors group/btn">
        Apply Now
        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
    </span>
</Link>
      </div>
      
    </Card>
  )
}

function Pagination({ current, total, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1.5 text-sm font-body border border-forest-200 rounded-sm
                   text-forest-700 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        Prev
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-8 h-8 text-sm font-body rounded-sm transition-colors ${
            page === current
              ? 'bg-forest-700 text-white'
              : 'border border-forest-200 text-forest-700 hover:bg-forest-50'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="px-3 py-1.5 text-sm font-body border border-forest-200 rounded-sm
                   text-forest-700 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        Next
      </button>
    </div>
  )
}

export default function JobsPage() {
  const [query,         setQuery]    = useState('')
  const [category,      setCategory] = useState('All')
  const [type,          setType]     = useState('All Types')
  const [location,      setLocation] = useState('All Locations')
  const [currentPage,   setPage]     = useState(1)
  const [showFilters,   setShowFilters] = useState(false)

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

  function handleFilter(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  return (
    <>
      <PageHeader />

      {/* Search bar */}
      <div className="bg-white border-b border-forest-100 sticky top-16 lg:top-20 z-30">
        <div className="container-base py-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
              <input
                type="text"
                placeholder="Job title, skill, or keyword..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2.5 text-sm font-body border border-forest-200 rounded-sm
                           focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent
                           bg-forest-50"
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body border rounded-sm
                          transition-colors ${showFilters
                            ? 'bg-forest-700 text-white border-forest-700'
                            : 'border-forest-200 text-forest-700 hover:bg-forest-50'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Category', value: category, options: jobCategories, setter: handleFilter(setCategory) },
                { label: 'Type',     value: type,     options: jobTypes,     setter: handleFilter(setType)     },
                { label: 'Location', value: location, options: jobLocations, setter: handleFilter(setLocation)  },
              ].map((filter) => (
                <select
                  key={filter.label}
                  value={filter.value}
                  onChange={(e) => filter.setter(e.target.value)}
                  className="px-3 py-2.5 text-sm font-body border border-forest-200 rounded-sm
                             focus:outline-none focus:ring-2 focus:ring-forest-400 bg-white text-forest-800"
                >
                  {filter.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="section-wrapper bg-cream-50">
        <div className="container-base">
          <div className="flex items-center justify-between mb-6">
            <p className="font-body text-sm text-forest-600">
              Showing <strong className="text-forest-900">{filtered.length}</strong> position{filtered.length !== 1 ? 's' : ''}
            </p>
            {(category !== 'All' || type !== 'All Types' || location !== 'All Locations' || query) && (
              <button
                onClick={() => { setQuery(''); setCategory('All'); setType('All Types'); setLocation('All Locations'); setPage(1) }}
                className="text-xs font-body text-forest-500 hover:text-forest-700 transition-colors underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {paginated.length > 0 ? (
            <div className="space-y-4">
              {paginated.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-forest-300 mb-2">No results found</p>
              <p className="font-body text-sm text-forest-500">Try adjusting your search or filters.</p>
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

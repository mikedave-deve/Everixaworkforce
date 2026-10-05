import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { PageHead, Panel, TableWrap, th, td, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { downloadFile, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'
import { cn } from '../../lib/utils'

const prettySize = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

export default function PortalDocuments() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/documents')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')

  const docs = useMemo(() => data?.documents ?? [], [data])
  const categories = useMemo(() => ['All', ...new Set(docs.map((d) => d.category))], [docs])
  const shown = docs.filter((d) => (cat === 'All' || d.category === cat) && d.title.toLowerCase().includes(query.toLowerCase()))

  const [download] = useAction(async (d) => {
    await downloadFile(`/files/${d.fileId}`, d.fileName || d.title)
    notify(`${d.title} downloaded.`)
  })

  return (
    <div>
      <PageHead
        eyebrow="Documents"
        title="Your records, in one place."
        description="Documents HR has shared with you — offer letters, policies, payroll and tax paperwork. Download any of them any time."
      />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : docs.length === 0 ? (
        <EmptyState title="No documents yet" body="When HR shares a document with you, it will appear here ready to download." />
      ) : (
        <Panel flush>
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-72">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <label htmlFor="doc-search" className="sr-only">Search documents</label>
              <input id="doc-search" type="search" placeholder="Search documents" value={query} onChange={(e) => setQuery(e.target.value)} className="field !py-2.5 pl-11" />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn('px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors', cat === c ? 'bg-ink-800 text-cream-50' : 'border border-ink-900/20 text-ink-700 hover:bg-ink-100')}>{c}</button>
              ))}
            </div>
          </div>

          <div className="border-t border-ink-900/10 px-6 pb-4">
            {shown.length === 0 ? (
              <div className="py-8"><EmptyState title="No documents found" body="Try a different search or category." /></div>
            ) : (
              <TableWrap min="38rem">
                <thead>
                  <tr className="border-b border-ink-900/10">
                    <th scope="col" className={th}>Name</th>
                    <th scope="col" className={th}>Category</th>
                    <th scope="col" className={th}>Added</th>
                    <th scope="col" className={th}>Size</th>
                    <th scope="col" className={th}><span className="sr-only">Download</span></th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((d) => (
                    <tr key={d.id} className="border-b border-ink-900/10 last:border-0">
                      <td className={`${td} font-medium`}>{d.title}</td>
                      <td className={`${td} text-ink-600`}>{d.category}</td>
                      <td className={`${td} text-ink-600`}>{fmtDate(d.createdAt)}</td>
                      <td className={`${td} text-ink-600`}>{prettySize(d.size)}</td>
                      <td className={`${td} text-right`}><button onClick={() => download(d)} className="link-arrow !text-[11px]" aria-label={`Download ${d.title}`}><Download size={13} /> Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        </Panel>
      )}
    </div>
  )
}

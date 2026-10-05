import { useMemo, useState } from 'react'
import { Download, Search, Upload } from 'lucide-react'
import { PageHead, Panel, Pill, TableWrap, th, td, EmptyState, useToast } from '../../components/portal/ui'
import { documents as seedDocs } from '../../data/employeePortal'
import { downloadText, fmtDate, isoDay, logActivity, usePortalState } from '../../lib/portalStore'
import { getSession } from '../../lib/auth'
import { cn } from '../../lib/utils'

const CATEGORIES = ['Onboarding', 'Policies', 'Payroll', 'Tax', 'Benefits', 'Other']

export default function PortalDocuments() {
  const notify = useToast()
  const session = getSession()
  const [uploads, setUploads] = usePortalState('docUploads', [])
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [upCat, setUpCat] = useState('Other')

  const all = useMemo(() => [...uploads, ...seedDocs], [uploads])
  const shown = all.filter((d) => (cat === 'All' || d.category === cat) && d.name.toLowerCase().includes(query.toLowerCase()))

  function download(d) {
    downloadText(`${d.name.replace(/[^\w]+/g, '-')}.txt`, `EVERIXA WORKFORCE — ${d.name}\nCategory: ${d.category}\nEmployee: ${session?.name}\n\nPlaceholder copy. The signed original will be served here once document storage is connected.`)
    logActivity('doc', 'Document downloaded', d.name)
    notify(`${d.name} downloaded.`)
  }

  function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { notify('File is larger than 10 MB.'); return }
    setUploads((cur) => [{ id: `up-${Date.now()}`, name: file.name, category: upCat, date: isoDay(), size: `${Math.max(1, Math.round(file.size / 1024))} KB`, uploaded: true }, ...cur])
    logActivity('doc', 'Document uploaded', file.name)
    notify(`${file.name} added to your documents.`)
    e.target.value = ''
  }

  return (
    <div>
      <PageHead
        eyebrow="Documents"
        title="Your records, in one place."
        description="Offer letters, policies, payroll and tax documents. Upload anything HR has asked you to provide."
      />

      <Panel flush>
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-72">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <label htmlFor="doc-search" className="sr-only">Search documents</label>
            <input id="doc-search" type="search" placeholder="Search documents" value={query} onChange={(e) => setQuery(e.target.value)} className="field !py-2.5 pl-11" />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {['All', ...CATEGORIES].map((c) => (
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
                    <td className={`${td} font-medium`}>{d.name} {d.uploaded && <Pill tone="info" className="ml-2">Uploaded</Pill>}</td>
                    <td className={`${td} text-ink-600`}>{d.category}</td>
                    <td className={`${td} text-ink-600`}>{fmtDate(d.date)}</td>
                    <td className={`${td} text-ink-600`}>{d.size}</td>
                    <td className={`${td} text-right`}><button onClick={() => download(d)} className="link-arrow !text-[11px]" aria-label={`Download ${d.name}`}><Download size={13} /> Download</button></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      </Panel>

      <Panel className="mt-6" title="Upload a document" description="PDF, JPG or PNG up to 10 MB. Demo: only the file name is stored.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="sm:w-56">
            <label htmlFor="up-cat" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Category</label>
            <select id="up-cat" className="field" value={upCat} onChange={(e) => setUpCat(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <label className="btn-primary cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brass-600 has-[:focus-visible]:ring-offset-2">
            <Upload size={16} /> Choose file
            <input type="file" accept=".pdf,image/*" onChange={onUpload} className="sr-only" />
          </label>
        </div>
      </Panel>
    </div>
  )
}

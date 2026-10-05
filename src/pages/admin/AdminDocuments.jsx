import { useState } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { PageHead, Panel, Field, TableWrap, th, td, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { api, downloadFile, useApi } from '../../lib/api'
import { fmtDate } from '../../lib/format'

const CATEGORIES = ['Onboarding', 'Policies', 'Payroll', 'Tax', 'Benefits', 'Other']
const MAX = 4 * 1024 * 1024

export default function AdminDocuments() {
  const notify = useToast()
  const emps = useApi('/admin/employees?status=approved')
  const docs = useApi('/admin/documents')
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Onboarding')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const employees = emps.data?.employees ?? []

  const [send, sending] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    if (!userId) return setError('Choose an employee.')
    if (!file) return setError('Choose a file to send.')
    if (file.size > MAX) return setError('That file is larger than 4 MB.')
    try {
      await api.upload(`/admin/documents?userId=${userId}&title=${encodeURIComponent(title || file.name)}&category=${encodeURIComponent(category)}`, file)
      notify('Document sent. The employee can download it from their Documents page.')
      setTitle(''); setFile(null); e.target.reset?.()
      docs.reload()
    } catch (err) {
      setError(err.message)
    }
  })

  const [remove] = useAction(async (d) => {
    if (!window.confirm(`Remove "${d.title}" for ${d.employee}?`)) return
    await api.del(`/admin/documents/${d.id}`)
    notify('Document removed.')
    docs.reload()
  })

  return (
    <div>
      <PageHead eyebrow="Documents" title="Send documents to employees." description="Upload a PDF, image or Word file for an employee. It appears on their Documents page, ready to download." />

      <Panel title="Send a document" className="mb-6">
        <form onSubmit={send} className="grid gap-5 md:grid-cols-2" noValidate>
          <Field id="d-emp" label="Employee">
            <select id="d-emp" className="field" value={userId} onChange={(e) => setUserId(e.target.value)}><option value="">Select an employee…</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.employeeId}</option>)}</select>
          </Field>
          <Field id="d-cat" label="Category"><select id="d-cat" className="field" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field id="d-title" label="Title" className="md:col-span-2"><input id="d-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Offer letter" /></Field>
          <div className="md:col-span-2">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">File</span>
            <label className="flex cursor-pointer items-center gap-4 border border-dashed border-ink-900/30 bg-ink-50 px-5 py-5 transition-colors hover:border-ink-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brass-600">
              <Upload className="h-5 w-5 text-brass-600" />
              <span className="text-[14px] text-ink-800">{file ? `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB` : 'Choose a PDF, image or Word file (up to 4 MB)'}</span>
              <input type="file" accept=".pdf,.doc,.docx,image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800 md:col-span-2">{error}</p>}
          <div className="md:col-span-2"><button className="btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send to employee'}</button></div>
        </form>
      </Panel>

      <Panel title="Sent documents" flush>
        <div className="px-6 pb-4">
          {docs.loading ? <Loading /> : docs.error ? <ErrorState error={docs.error} onRetry={docs.reload} /> : docs.data.documents.length === 0 ? <EmptyState title="Nothing sent yet" /> : (
            <TableWrap min="40rem">
              <thead><tr className="border-b border-ink-900/10"><th scope="col" className={th}>Document</th><th scope="col" className={th}>Employee</th><th scope="col" className={th}>Category</th><th scope="col" className={th}>Sent</th><th scope="col" className={th}><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {docs.data.documents.map((d) => (
                  <tr key={d.id} className="border-b border-ink-900/10 last:border-0">
                    <td className={`${td} font-medium`}>{d.title}</td><td className={td}>{d.employee}</td><td className={`${td} text-ink-600`}>{d.category}</td><td className={`${td} text-ink-600`}>{fmtDate(d.createdAt)}</td>
                    <td className={`${td} text-right`}><div className="flex justify-end gap-4"><button onClick={() => downloadFile(`/files/${d.fileId}`, d.fileName || d.title)} className="link-arrow !text-[11px]"><Download size={12} /> Open</button><button onClick={() => remove(d)} aria-label={`Remove ${d.title}`} className="link-arrow !text-[11px] !text-red-700"><Trash2 size={12} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      </Panel>
    </div>
  )
}

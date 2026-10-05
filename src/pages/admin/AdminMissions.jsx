import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHead, Panel, Pill, Field, EmptyState, Loading, ErrorState, useAction, useToast } from '../../components/portal/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet'
import { api, useApi } from '../../lib/api'

const BLANK = { title: '', client: '', status: 'Active', site: '', schedule: '', supName: '', supRole: '', supPhone: '', summary: '', instructions: '', safety: '', dress: '', assignAll: true, assignees: [] }
const tone = { Active: 'success', Upcoming: 'brass', Completed: 'neutral' }
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean)

function MissionForm({ mission, employees, onDone }) {
  const notify = useToast()
  const [f, setF] = useState(
    mission
      ? { ...BLANK, ...mission, supName: mission.supervisor?.name ?? '', supRole: mission.supervisor?.role ?? '', supPhone: mission.supervisor?.phone ?? '', instructions: mission.instructions.join('\n'), safety: (mission.safety ?? []).join('\n') }
      : BLANK
  )
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const toggle = (id) => setF((x) => ({ ...x, assignees: x.assignees.includes(id) ? x.assignees.filter((i) => i !== id) : [...x.assignees, id] }))

  const [save, saving] = useAction(async (e) => {
    e.preventDefault()
    setError('')
    const body = {
      title: f.title, client: f.client, status: f.status, site: f.site, schedule: f.schedule,
      supervisor: { name: f.supName, role: f.supRole, phone: f.supPhone }, summary: f.summary,
      instructions: lines(f.instructions), safety: lines(f.safety), dress: f.dress, assignAll: f.assignAll, assignees: f.assignees,
    }
    try {
      if (mission) await api.put(`/admin/missions/${mission.id}`, body)
      else await api.post('/admin/missions', body)
      notify(mission ? 'Mission updated. Employees were notified in their activity feed.' : 'Mission sent to your team.')
      onDone()
    } catch (err) {
      setError(err.message)
    }
  })

  return (
    <form onSubmit={save} className="space-y-5">
      <Field id="m-title" label="Mission title"><input id="m-title" required className="field" value={f.title} onChange={set('title')} placeholder="e.g. Front desk coverage — Portland" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="m-client" label="Client"><input id="m-client" className="field" value={f.client} onChange={set('client')} /></Field>
        <Field id="m-status" label="Status"><select id="m-status" className="field" value={f.status} onChange={set('status')}><option>Active</option><option>Upcoming</option><option>Completed</option></select></Field>
        <Field id="m-site" label="Location"><input id="m-site" className="field" value={f.site} onChange={set('site')} /></Field>
        <Field id="m-sched" label="Schedule"><input id="m-sched" className="field" value={f.schedule} onChange={set('schedule')} placeholder="Mon–Fri · 8:00 AM – 4:30 PM" /></Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="m-sn" label="Supervisor"><input id="m-sn" className="field" value={f.supName} onChange={set('supName')} /></Field>
        <Field id="m-sr" label="Supervisor role"><input id="m-sr" className="field" value={f.supRole} onChange={set('supRole')} /></Field>
        <Field id="m-sp" label="Supervisor phone"><input id="m-sp" className="field" value={f.supPhone} onChange={set('supPhone')} /></Field>
      </div>
      <Field id="m-sum" label="Summary"><textarea id="m-sum" rows={3} className="field resize-none" value={f.summary} onChange={set('summary')} /></Field>
      <Field id="m-ins" label="Instructions" hint="One instruction per line. Employees tick each one off."><textarea id="m-ins" required rows={6} className="field" value={f.instructions} onChange={set('instructions')} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="m-saf" label="Safety notes" hint="One per line."><textarea id="m-saf" rows={3} className="field resize-none" value={f.safety} onChange={set('safety')} /></Field>
        <Field id="m-dress" label="Dress code"><textarea id="m-dress" rows={3} className="field resize-none" value={f.dress} onChange={set('dress')} /></Field>
      </div>

      <fieldset className="border border-ink-900/10 bg-white p-4">
        <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Who is this for?</legend>
        <label className="flex items-center gap-3 py-1 text-[14px] text-ink-900"><input type="checkbox" className="h-4 w-4 accent-ink-800" checked={f.assignAll} onChange={(e) => setF((x) => ({ ...x, assignAll: e.target.checked }))} /> Everyone</label>
        {!f.assignAll && (
          <div className="mt-2 max-h-44 space-y-1 overflow-y-auto border-t border-ink-900/10 pt-2">
            {employees.length === 0 && <p className="text-[13px] text-ink-600">No active employees yet.</p>}
            {employees.map((e) => (
              <label key={e.id} className="flex items-center gap-3 py-1 text-[14px] text-ink-900"><input type="checkbox" className="h-4 w-4 accent-ink-800" checked={f.assignees.includes(e.id)} onChange={() => toggle(e.id)} /> {e.name} <span className="text-[12px] text-ink-500">{e.employeeId}</span></label>
            ))}
          </div>
        )}
      </fieldset>

      {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">{error}</p>}
      <button className="btn-primary w-full" disabled={saving}>{saving ? 'Sending…' : mission ? 'Save changes' : 'Send mission to team'}</button>
    </form>
  )
}

export default function AdminMissions() {
  const notify = useToast()
  const { data, error, loading, reload } = useApi('/admin/missions')
  const emps = useApi('/admin/employees?status=approved')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, object = edit

  const [remove] = useAction(async (m) => {
    if (!window.confirm(`Remove "${m.title}"? Employees will no longer see it.`)) return
    await api.del(`/admin/missions/${m.id}`)
    notify('Mission removed.')
    reload()
  })

  return (
    <div>
      <PageHead
        eyebrow="Missions"
        title="Send missions & instructions."
        description="Whatever you create here appears on the employee's Missions & Instructions page, with a checklist they must acknowledge."
        actions={<button onClick={() => setEditing(null)} className="btn-primary"><Plus size={16} /> New mission</button>}
      />

      {loading ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : data.missions.length === 0 ? (
        <EmptyState title="No missions yet" body="Create your first mission and choose who should receive it." />
      ) : (
        <div className="space-y-5">
          {data.missions.map((m) => (
            <Panel key={m.id} title={m.title} description={m.client} action={<Pill tone={tone[m.status]}>{m.status}</Pill>}>
              <p className="max-w-2xl text-[14px] leading-relaxed text-ink-700/85">{m.summary || m.site}</p>
              <p className="mt-3 text-[13px] text-ink-600">{m.instructions.length} instruction{m.instructions.length === 1 ? '' : 's'} · {m.assignAll ? 'Everyone' : `${m.assignees.length} employee${m.assignees.length === 1 ? '' : 's'}`} · {m.acknowledgedBy} acknowledged</p>
              <div className="mt-5 flex gap-5">
                <button onClick={() => setEditing(m)} className="link-arrow !text-[11px]"><Pencil size={13} /> Edit</button>
                <button onClick={() => remove(m)} className="link-arrow !text-[11px] !text-red-700"><Trash2 size={13} /> Remove</button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Sheet open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto bg-cream-50 p-0 sm:max-w-2xl">
          {editing !== undefined && (
            <div className="p-7">
              <SheetHeader className="p-0 pb-6">
                <p className="eyebrow">Mission</p>
                <SheetTitle className="font-display text-[1.9rem] font-medium leading-tight text-ink-900">{editing ? 'Edit mission' : 'New mission'}</SheetTitle>
              </SheetHeader>
              <MissionForm mission={editing} employees={emps.data?.employees ?? []} onDone={() => { setEditing(undefined); reload() }} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

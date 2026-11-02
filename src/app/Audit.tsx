import { useMemo, useState } from 'react'
import { Check, Download, Minus } from 'lucide-react'
import { ACTIONS, ACTION_LABEL, DEMO_USERS, ROLE_LABEL, can, userById, type DemoRole } from '../lib/access'
import { usePlanner } from '../state/PlannerContext'
import { Button } from '../components/ui/Button'
import { RoleNote } from './RoleNote'

const ROLES: DemoRole[] = ['manager', 'planner', 'grader', 'viewer']
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export function AuditPage() {
  const { audit, can: allowed, user } = usePlanner()
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return [...audit].reverse().filter((e) => !t || `${userById(e.userId).name} ${e.action} ${e.detail}`.toLowerCase().includes(t))
  }, [audit, q])
  const exportCsv = () => {
    const text = [['Time', 'Person', 'Action', 'Detail'], ...rows.map((e) => [e.at, userById(e.userId).name, e.action, e.detail])].map((r) => r.map(csvCell).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'paperhaven-audit-log.csv'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate">Who can do what in this demo workspace, and an append-only record of every change made in this browser. Switch user under “Demo as” to try each role.</p>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-sm font-semibold">Roles and permissions</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] text-slate"><th className="py-2 pr-3 font-medium">Action</th>{ROLES.map((r) => <th key={r} className="px-2 py-2 text-center font-medium">{ROLE_LABEL[r]}</th>)}</tr></thead>
                <tbody>
                  {ACTIONS.map((a) => (
                    <tr key={a} className="border-t border-line">
                      <td className="py-2 pr-3">{ACTION_LABEL[a]}</td>
                      {ROLES.map((r) => <td key={r} className="px-2 py-2 text-center">{can(r, a) ? <Check size={15} className="mx-auto text-forest" aria-label="Allowed" /> : <Minus size={15} className="mx-auto text-line-strong" aria-label="Not allowed" />}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate">Exploring a blend in the planner is open to everyone; saving it is not. Resetting the demo only clears this browser. In production, roles come from your identity provider and are enforced on the server.</p>
          </section>
          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-sm font-semibold">People in this demo</h2>
            <ul className="mt-2 divide-y divide-line">
              {DEMO_USERS.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-mono text-[11px] text-paper">{u.initials}</span><span><span className="block">{u.name}</span><span className="block text-[11px] text-slate">{u.title}</span></span></span>
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px]">{ROLE_LABEL[u.role]}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section className="min-w-0 rounded-lg border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Audit log ({audit.length})</h2>
            {allowed('audit') && <Button size="sm" variant="secondary" icon={<Download size={13} />} onClick={exportCsv}>Export CSV</Button>}
          </div>
          <div className="mt-3">
            {!allowed('audit') ? (
              <RoleNote>Acting as {ROLE_LABEL[user.role].toLowerCase()}: only the quality manager can read the audit log. Switch to Chidi Okeke under “Demo as”.</RoleNote>
            ) : (
              <>
                <label htmlFor="audit-q" className="sr-only">Filter the audit log</label>
                <input id="audit-q" className="mb-3 w-full rounded-md border border-line px-3 py-2 text-sm focus:border-forest focus:outline-none" placeholder="Filter by person, action or record…" value={q} onChange={(e) => setQ(e.target.value)} />
                <ol className="divide-y divide-line">
                  {rows.map((e) => (
                    <li key={e.id} className="py-2.5 text-[13px]">
                      <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-medium">{userById(e.userId).name}</span><span className="font-mono text-[11px] text-slate">{fmt(e.at)}</span></div>
                      <div className="text-graphite"><span className="mr-1.5 rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] uppercase text-slate">{e.action}</span>{e.detail}</div>
                    </li>
                  ))}
                  {!rows.length && <li className="py-3 text-sm text-slate">No changes yet. Save a scenario or edit a batch, and it will appear here.</li>}
                </ol>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

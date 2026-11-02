import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft, ClipboardList, FileBarChart, Info, LayoutDashboard, Layers, ListChecks, Lock, Menu, Settings, Sparkles, X } from 'lucide-react'
import { DEMO_USERS, ROLE_LABEL } from '../lib/access'
import { usePlanner } from '../state/PlannerContext'
import { RoleNote } from './RoleNote'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/site/Logo'
import { Button } from '../components/ui/Button'
import { AiPanel } from './AiPanel'
import { cx } from '../lib/format'
import { usePageMeta } from '../lib/usePageMeta'

const NAV = [
  { to: '/planner', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/planner/batches', label: 'Incoming Batches', icon: ClipboardList },
  { to: '/planner/blend', label: 'Blend Planner', icon: Layers },
  { to: '/planner/specifications', label: 'Specifications', icon: ListChecks },
  { to: '/planner/reports', label: 'Reports', icon: FileBarChart },
  { to: '/planner/audit', label: 'Audit & roles', icon: Lock },
  { to: '/planner/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  usePageMeta('Blend Planner demo', 'Interactive Paperhaven demonstration with fictional recovered-paper batches.', '/planner')
  const [navOpen, setNavOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, setUser } = usePlanner()
  useEffect(() => setNavOpen(false), [pathname])

  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))

  return (
    <div className="flex min-h-screen bg-paper">
      <aside
        className={cx(
          'no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink/20 bg-ink text-paper/80 transition-transform lg:static lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Planner navigation"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-paper/10 px-5">
          <Link to="/planner" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-semibold text-paper">Paperhaven</span>
          </Link>
          <button className="rounded p-1 hover:bg-paper/10 lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end}
                  className={({ isActive }) => cx('flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', isActive ? 'bg-forest text-paper' : 'hover:bg-paper/5 hover:text-paper')}>
                  <n.icon size={16} /> {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-paper/10 p-4 text-xs text-paper/50">
          <label htmlFor="demo-as" className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-paper/50">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-kraft text-[9px] text-ink" aria-hidden>{user.initials}</span>
            Demo as
          </label>
          <select id="demo-as" aria-label="Demo as user" className="mb-4 w-full rounded-md border border-paper/15 bg-ink px-2 py-1.5 text-xs text-paper focus:border-kraft focus:outline-none" value={user.id} onChange={(e) => setUser(e.target.value)}>
            {DEMO_USERS.map((u) => <option key={u.id} value={u.id}>{u.name} · {ROLE_LABEL[u.role]}</option>)}
          </select>
          <p className="flex items-center gap-1.5 font-medium text-kraft-soft"><Info size={12} /> Demonstration workspace</p>
          <p className="mt-1">Fictional data, stored in this browser only.</p>
          <Link to="/" className="mt-3 inline-flex items-center gap-1 text-paper/70 hover:text-paper"><ArrowLeft size={12} /> Back to website</Link>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setNavOpen(false)} aria-hidden />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded p-1.5 text-graphite hover:bg-paper-2 lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-ink">{current?.label ?? 'Planner'}</h1>
            <span className="hidden rounded border border-ochre/30 bg-ochre-soft px-1.5 py-0.5 text-[11px] font-medium text-ochre sm:inline">Demo values</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAiOpen(true)} icon={<Sparkles size={14} className="text-ai" />}>
            AI assistance <span className="hidden text-slate sm:inline">(simulated)</span>
          </Button>
        </header>
        <main className="flex-1 bg-grid-fine p-4 sm:p-6">
          {user.role === 'viewer' && <div className="mb-5"><RoleNote>Viewing as {user.name} ({ROLE_LABEL[user.role].toLowerCase()}): you can explore blends and export reports, but not save changes. Switch user under “Demo as”.</RoleNote></div>}
          <Suspense fallback={<p className="p-6 text-sm text-slate" role="status">Loading…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}

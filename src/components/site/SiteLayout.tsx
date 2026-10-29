import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, Mail, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { ButtonLink } from '../ui/Button'
import { cx } from '../../lib/format'

const NAV = [
  { to: '/product', label: 'Product' },
  { to: '/blend-planner', label: 'Blend Planner' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/solutions', label: 'Industry Solutions' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => {
    setOpen(false)
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) => cx('rounded-md px-2.5 py-1.5 text-sm transition-colors', isActive ? 'text-forest font-medium' : 'text-graphite hover:text-ink hover:bg-paper-2')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink to="/planner/blend" size="sm" className="hidden sm:inline-flex" icon={<ArrowRight size={14} />}>
              Open Blend Planner
            </ButtonLink>
            <button type="button" className="rounded-md p-2 text-graphite hover:bg-paper-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Primary mobile" className="border-t border-line bg-paper px-4 py-3 lg:hidden">
            <ul className="grid gap-1">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} className={({ isActive }) => cx('block rounded-md px-3 py-2 text-sm', isActive ? 'bg-forest-soft text-forest' : 'text-graphite hover:bg-paper-2')}>
                    {n.label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-2">
                <ButtonLink to="/planner/blend" className="w-full" icon={<ArrowRight size={14} />}>Open Blend Planner</ButtonLink>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink text-paper/80">
        <div className="bg-grid-dark">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo inverse />
              <p className="mt-4 max-w-xs text-sm text-paper/65">Make every recovered-paper batch count.</p>
              <a href="mailto:ifeoma@paperhaven.top" className="mt-5 inline-flex items-center gap-2 text-sm text-paper hover:text-kraft-soft">
                <Mail size={14} /> ifeoma@paperhaven.top
              </a>
            </div>
            <FooterCol title="Platform" links={[['/product', 'Product'], ['/blend-planner', 'Blend Planner'], ['/how-it-works', 'How It Works'], ['/pricing', 'Pricing']]} />
            <FooterCol title="Industries" links={[['/solutions#mills', 'Paper mills'], ['/solutions#processors', 'Recycling processors'], ['/solutions#suppliers', 'Recovered-fibre suppliers']]} />
            <FooterCol title="Company" links={[['/about', 'About'], ['/contact', 'Contact'], ['/planner', 'Interactive demo']]} />
          </div>
          <div className="border-t border-paper/10">
            <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-paper/50 sm:px-6">
              <span>© {new Date().getFullYear()} Paperhaven · paperhaven.top</span>
              <span>Product demonstration uses fictional sample data.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] uppercase tracking-widest text-paper/45">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([to, label]) => (
          <li key={to}><Link to={to} className="hover:text-paper">{label}</Link></li>
        ))}
      </ul>
    </div>
  )
}

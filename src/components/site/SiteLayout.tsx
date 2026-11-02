import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, Mail, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { ButtonLink } from '../ui/Button'
import { cx } from '../../lib/format'
import { useRevealOnScroll } from '../../lib/motion'
import { FOUNDERS, SITE } from '../../config/site'

const NAV = [
  { to: '/#problem', label: 'Problem' },
  { to: '/product', label: 'Platform' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/technology', label: 'Technology' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'Team' },
  { to: '/security', label: 'Security' },
]

export function SiteLayout() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()
  useRevealOnScroll(pathname)
  useEffect(() => {
    setOpen(false)
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    // Pages load on demand, so keep looking for the anchor briefly, then align again once charts settle.
    let tries = 0
    let t = 0
    const find = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView()
        t = window.setTimeout(() => el.scrollIntoView(), 450)
      } else if (tries++ < 40) t = window.setTimeout(find, 50)
    }
    find()
    return () => window.clearTimeout(t)
  }, [pathname, hash])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <header className={cx('sticky top-0 z-40 border-b backdrop-blur transition-all duration-300', scrolled ? 'border-line bg-paper/95 shadow-[0_10px_30px_-22px_rgba(25,29,27,0.45)]' : 'border-transparent bg-paper/60')}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) => cx('relative rounded-md px-2.5 py-1.5 text-sm transition-colors after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-px after:origin-left after:bg-forest after:transition-transform', isActive && !n.to.includes('#') ? 'font-medium text-forest after:scale-x-100' : 'text-graphite after:scale-x-0 hover:text-ink hover:after:scale-x-100')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden md:block"><ButtonLink to="/planner" size="sm" variant="ghost">Live demo</ButtonLink></span>
            <span className="hidden sm:block">
              <ButtonLink to="/contact" size="sm" icon={<ArrowRight size={14} />}>Request early access</ButtonLink>
            </span>
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
                <ButtonLink to="/contact" className="w-full" icon={<ArrowRight size={14} />}>Request early access</ButtonLink>
              </li>
              <li>
                <ButtonLink to="/planner" variant="secondary" className="w-full">Explore the live demo</ButtonLink>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-forest" aria-hidden /><span className="sr-only">Loading…</span></div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="relative overflow-hidden bg-ink text-paper/80">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-kraft/10 blur-3xl" aria-hidden />
        <div className="relative bg-grid-dark">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr]">
            <div>
              <Logo inverse />
              <p className="mt-4 max-w-xs text-sm text-paper/65">Make every recovered-paper batch count. Assessment and blend planning for recycling businesses and paper mills.</p>
              <a href={`mailto:${SITE.email}`} className="mt-5 inline-flex items-center gap-2 text-sm text-paper hover:text-kraft-soft"><Mail size={14} /> {SITE.email}</a>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/5 px-3 py-1.5 text-xs text-paper/70"><span className="live-dot" aria-hidden /> Early access open · pilots on one yard or mill</div>
            </div>
            <FooterCol title="Platform" links={[['/product', 'Platform overview'], ['/blend-planner', 'Blend Planner'], ['/planner', 'Live demo'], ['/pricing', 'Pricing']]} />
            <FooterCol title="Solutions" links={[['/#problem', 'Problems we solve'], ['/solutions#mills', 'Paper mills'], ['/solutions#processors', 'Recycling processors'], ['/#compare', 'Why Paperhaven'], ['/#roadmap', 'Roadmap']]} />
            <FooterCol title="Company" links={[['/about', 'About & team'], ['/technology', 'Technology (AWS)'], ['/security', 'Security & safeguards'], ['/contact', 'Request early access'], ['/#faq', 'FAQ']]} />
            <FooterCol title="Legal" links={[['/privacy', 'Privacy notice'], ['/terms', 'Terms of use']]} />
          </div>
          <div className="border-t border-paper/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-paper/50 sm:px-6 md:flex-row md:items-center md:justify-between">
              <span>
                © {new Date().getFullYear()} Paperhaven · Founded by{' '}
                {FOUNDERS.map((f, i) => <span key={f.name}>{i > 0 && ' & '}<Link to="/about#team" className="text-paper/75 hover:text-paper">{f.name}</Link></span>)}
              </span>
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

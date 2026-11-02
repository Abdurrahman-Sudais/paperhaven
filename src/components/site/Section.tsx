import type { CSSProperties, ReactNode } from 'react'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../ui/Button'
import { cx } from '../../lib/format'

export function Section({ id, children, className, tone = 'paper' }: { id?: string; children: ReactNode; className?: string; tone?: 'paper' | 'paper-2' | 'ink' | 'white' }) {
  const tones = { paper: 'bg-paper', 'paper-2': 'bg-paper-2', ink: 'bg-ink text-paper', white: 'bg-white/60' }
  return (
    <section id={id} className={cx('scroll-mt-20', tones[tone], className)}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">{children}</div>
    </section>
  )
}

export function Eyebrow({ children, inverse }: { children: ReactNode; inverse?: boolean }) {
  return (
    <p className={cx('reveal flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em]', inverse ? 'text-kraft-soft' : 'text-forest')}>
      <span className={cx('h-px w-6', inverse ? 'bg-kraft-soft/60' : 'bg-forest/60')} />
      {children}
    </p>
  )
}

export function SectionHeading({ eyebrow, title, children, inverse, center }: { eyebrow?: string; title: ReactNode; children?: ReactNode; inverse?: boolean; center?: boolean }) {
  return (
    <div className={cx('max-w-3xl', center && 'mx-auto text-center [&_p]:justify-center')}>
      {eyebrow && <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow>}
      <h2 className={cx('reveal mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl', inverse ? 'text-paper' : 'text-ink')} style={d(60)}>{title}</h2>
      {children && <div className={cx('reveal mt-4 text-lg leading-relaxed', inverse ? 'text-paper/70' : 'text-slate')} style={d(120)}>{children}</div>}
    </div>
  )
}

export function PageHero({ eyebrow, title, children, aside }: { eyebrow: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="relative border-b border-line bg-paper">
      <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className={cx('relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-20', !!aside && 'lg:grid-cols-[1.1fr_1fr] lg:items-center')}>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="reveal mt-4 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl" style={d(80)}>{title}</h1>
          {children && <div className="reveal mt-5 max-w-2xl text-lg leading-relaxed text-slate" style={d(160)}>{children}</div>}
        </div>
        {aside && <div className="reveal" style={d(220)}>{aside}</div>}
      </div>
    </section>
  )
}

export function CtaBand({ title = 'Plan your next blend with better visibility.', body = 'Open the interactive Blend Planner with fictional sample batches, or talk to us about your yard and mill.' }: { title?: string; body?: string }) {
  return (
    <section className="relative overflow-hidden bg-forest text-paper">
      <div className="absolute inset-0 bg-grid-dark" aria-hidden />
      <div className="hero-glow pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-kraft/25 blur-3xl" aria-hidden />
      <div className="reveal relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="mt-3 text-lg text-paper/75">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/contact" variant="inverse" size="lg" icon={<ArrowRight size={16} />}>Request early access</ButtonLink>
          <ButtonLink to="/planner/blend" size="lg" className="border border-paper/30 bg-transparent hover:bg-paper/10">Explore the live demo</ButtonLink>
        </div>
      </div>
    </section>
  )
}

export function FeatureCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="reveal lift spot rounded-lg border border-line bg-white/70 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-forest/20 bg-forest-soft text-forest">{icon}</div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate">{children}</div>
    </div>
  )
}

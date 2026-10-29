import type { ReactNode } from 'react'
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
    <p className={cx('flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em]', inverse ? 'text-kraft-soft' : 'text-forest')}>
      <span className={cx('h-px w-6', inverse ? 'bg-kraft-soft/60' : 'bg-forest/60')} />
      {children}
    </p>
  )
}

export function SectionHeading({ eyebrow, title, children, inverse, center }: { eyebrow?: string; title: ReactNode; children?: ReactNode; inverse?: boolean; center?: boolean }) {
  return (
    <div className={cx('max-w-3xl', center && 'mx-auto text-center [&_p]:justify-center')}>
      {eyebrow && <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow>}
      <h2 className={cx('mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl', inverse ? 'text-paper' : 'text-ink')}>{title}</h2>
      {children && <div className={cx('mt-4 text-lg leading-relaxed', inverse ? 'text-paper/70' : 'text-slate')}>{children}</div>}
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
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">{title}</h1>
          {children && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">{children}</div>}
        </div>
        {aside}
      </div>
    </section>
  )
}

export function CtaBand({ title = 'Plan your next blend with better visibility.', body = 'Open the interactive Blend Planner with fictional sample batches, or talk to us about your yard and mill.' }: { title?: string; body?: string }) {
  return (
    <section className="relative overflow-hidden bg-forest text-paper">
      <div className="absolute inset-0 bg-grid-dark" aria-hidden />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="mt-3 text-lg text-paper/75">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/planner/blend" variant="inverse" size="lg" icon={<ArrowRight size={16} />}>Open Blend Planner</ButtonLink>
          <ButtonLink to="/contact" size="lg" className="border border-paper/30 bg-transparent hover:bg-paper/10">Contact Paperhaven</ButtonLink>
        </div>
      </div>
    </section>
  )
}

export function FeatureCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white/70 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-forest/20 bg-forest-soft text-forest">{icon}</div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate">{children}</div>
    </div>
  )
}

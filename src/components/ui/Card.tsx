import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/format'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('rounded-lg border border-line bg-white/80 shadow-[0_1px_0_rgb(0_0_0/0.03)]', className)} {...rest} />
}

export function CardHeader({ title, description, actions, icon }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 text-forest">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export type Tone = 'neutral' | 'forest' | 'kraft' | 'ochre' | 'rust' | 'steel' | 'ai'

const tones: Record<Tone, string> = {
  neutral: 'bg-paper-2 text-graphite border-line',
  forest: 'bg-forest-soft text-forest border-forest/20',
  kraft: 'bg-kraft-soft text-kraft-dark border-kraft/30',
  ochre: 'bg-ochre-soft text-ochre border-ochre/25',
  rust: 'bg-rust-soft text-rust border-rust/25',
  steel: 'bg-steel-soft text-steel border-steel/20',
  ai: 'bg-ai-soft text-ai border-ai/25',
}

export function Badge({ tone = 'neutral', children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap', tones[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

export function Stat({ label, value, sub, tag }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tag?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate">{label}</span>
        {tag}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate">{sub}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-paper/60 px-6 py-10 text-center">
      {icon && <div className="mb-3 text-fibre">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-slate">{children}</div>}
    </div>
  )
}

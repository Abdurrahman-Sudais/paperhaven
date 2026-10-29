import { Calculator, Gauge, Sparkles, UserPen } from 'lucide-react'
import type { Provenance } from '../../types'
import { cx } from '../../lib/format'

export const PROVENANCE_META: Record<Provenance, { label: string; short: string; className: string; Icon: typeof Gauge; description: string }> = {
  measured: {
    label: 'Measured property',
    short: 'Measured',
    className: 'bg-forest-soft text-forest border-forest/25',
    Icon: Gauge,
    description: 'Recorded from a physical test of a sample, with a date and method.',
  },
  operator: {
    label: 'Operator-entered',
    short: 'Operator',
    className: 'bg-paper-2 text-graphite border-line-strong',
    Icon: UserPen,
    description: 'Typed in by a person — commercial terms, stock levels, notes and statuses.',
  },
  ai: {
    label: 'AI-generated suggestion',
    short: 'AI suggestion',
    className: 'bg-ai-soft text-ai border-ai/30 border-dashed',
    Icon: Sparkles,
    description: 'Simulated suggestion for review. Never written to a record automatically.',
  },
  calculated: {
    label: 'Calculated value',
    short: 'Calculated',
    className: 'bg-steel-soft text-steel border-steel/25',
    Icon: Calculator,
    description: 'Derived by a deterministic formula from the values above.',
  },
}

export function ProvenanceTag({ kind, compact = false, className }: { kind: Provenance; compact?: boolean; className?: string }) {
  const m = PROVENANCE_META[kind]
  return (
    <span title={m.description}
      className={cx('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap', m.className, className)}>
      <m.Icon size={11} aria-hidden />
      {compact ? <span className="sr-only">{m.label}</span> : m.short}
    </span>
  )
}

export function ProvenanceLegend({ className }: { className?: string }) {
  return (
    <div className={cx('flex flex-wrap gap-x-4 gap-y-2', className)} aria-label="Value provenance legend">
      {(Object.keys(PROVENANCE_META) as Provenance[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5 text-xs text-slate">
          <ProvenanceTag kind={k} />
          <span className="hidden sm:inline">{PROVENANCE_META[k].description}</span>
        </div>
      ))}
    </div>
  )
}

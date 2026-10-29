import { AlertTriangle, CheckCircle2, CircleDashed } from 'lucide-react'
import { DEMO_BATCHES, DEMO_SCENARIOS } from '../../data/demo'
import { calculateBlend } from '../../lib/calculations'
import { fmtPct, fmtUsd, fmtUsd2 } from '../../lib/format'
import { ProvenanceTag } from '../ui/Provenance'

export const BLEND_COLORS = ['#1f4d3a', '#b48a5e', '#5f6661', '#2f5a7a', '#8a6640', '#9a6b12']

/** Static, data-driven preview of the planner used on marketing pages. Values are live calculations on demo data. */
export function ProductPreview() {
  const scenario = DEMO_SCENARIOS[1]
  const calc = calculateBlend(scenario, DEMO_BATCHES)

  return (
    <div className="relative rounded-xl border border-line-strong bg-white shadow-[0_24px_60px_-24px_rgb(25_29_27/0.35)]" aria-label="Product preview using demonstration data" role="img">
      <div className="flex items-center justify-between border-b border-line bg-paper-2 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate">Blend planner · demo data</span>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.35fr_1fr]">
        <div className="border-b border-line p-4 md:border-r md:border-b-0">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Incoming batches</span>
            <ProvenanceTag kind="measured" />
          </div>
          <table className="w-full text-[11px] tabular">
            <thead>
              <tr className="text-left text-slate">
                <th className="py-1 font-medium">Batch</th>
                <th className="py-1 font-medium">Grade</th>
                <th className="py-1 text-right font-medium">$/t</th>
                <th className="py-1 text-right font-medium">Moisture</th>
                <th className="py-1 text-right font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_BATCHES.map((b) => {
                const complete = b.moisture.value !== null && b.nonPaper.value !== null
                return (
                  <tr key={b.id} className="border-t border-line/70">
                    <td className="py-1.5 font-mono text-[10px] text-ink">{b.id}</td>
                    <td className="max-w-[110px] truncate py-1.5 text-graphite">{b.grade.split(' (')[0]}</td>
                    <td className="py-1.5 text-right">{b.costPerTonne}</td>
                    <td className="py-1.5 text-right">
                      {b.moisture.value === null ? <span className="font-medium text-ochre">Missing</span> : fmtPct(b.moisture.value)}
                    </td>
                    <td className="py-1.5 text-right">
                      {complete ? (
                        <CheckCircle2 size={13} className="ml-auto text-forest" aria-label="Measurements complete" />
                      ) : (
                        <CircleDashed size={13} className="ml-auto text-ochre" aria-label="Measurements incomplete" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Blend proportions</span>
              <span className="text-slate tabular">{scenario.targetTonnes} t</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-sm">
              {calc.lines.map((l, i) => (
                <div key={l.batchId} style={{ width: `${l.proportionPct}%`, background: BLEND_COLORS[i] }} />
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-graphite">
              {calc.lines.map((l, i) => (
                <span key={l.batchId} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: BLEND_COLORS[i] }} />
                  {l.batchId.replace('DEMO-', '')} {l.proportionPct}%
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-line bg-paper/60 p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-slate">Material cost</div>
              <div className="mt-0.5 text-base font-semibold tabular">{calc.totalCost.status === 'ok' ? fmtUsd(calc.totalCost.value) : '—'}</div>
            </div>
            <div className="rounded-md border border-line bg-paper/60 p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-slate">Per tonne</div>
              <div className="mt-0.5 text-base font-semibold tabular">{calc.costPerTonne.status === 'ok' ? fmtUsd2(calc.costPerTonne.value) : '—'}</div>
            </div>
          </div>
          <div className="rounded-md border border-ochre/30 bg-ochre-soft p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ochre">
              <AlertTriangle size={12} /> Blend moisture unavailable
            </div>
            <p className="mt-0.5 text-[10px] leading-snug text-graphite">DEMO-B103 has no moisture measurement. The weighted value is withheld until it is supplied.</p>
          </div>
          <div className="rounded-md border border-line bg-paper/60 p-2.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate">
              Non-paper components <ProvenanceTag kind="calculated" />
            </div>
            <div className="mt-0.5 text-base font-semibold tabular">{calc.nonPaper.status === 'ok' ? fmtPct(calc.nonPaper.value, 2) : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

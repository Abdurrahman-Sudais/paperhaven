import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BlendScenario } from '../types'
import { usePlanner } from '../state/PlannerContext'
import { calculateBlend } from '../lib/calculations'
import { checkSpecification, summariseSpecCheck, type SpecSummary } from '../lib/specCheck'
import { Badge, type Tone } from '../components/ui/Card'
import { formatCalc } from './CalcValue'
import { MissingValue } from './BatchStatus'

const SUMMARY: Record<SpecSummary, { tone: Tone; label: string }> = {
  'all-within': { tone: 'forest', label: 'Within configured ranges' },
  'has-outside': { tone: 'rust', label: 'Outside a configured range' },
  incomplete: { tone: 'ochre', label: 'Incomplete — missing inputs' },
  'none-configured': { tone: 'neutral', label: 'No ranges configured' },
}

export function SpecSummaryBadge({ summary }: { summary: SpecSummary }) {
  return <Badge tone={SUMMARY[summary].tone}>{SUMMARY[summary].label}</Badge>
}

export function useScenarioRows(scenarios: BlendScenario[]) {
  const { batches, specification } = usePlanner()
  return scenarios.map((s) => {
    const calc = calculateBlend(s, batches)
    const spec = checkSpecification(specification, calc)
    return { scenario: s, calc, spec, summary: summariseSpecCheck(spec) }
  })
}

export function ScenarioComparison({ scenarios }: { scenarios: BlendScenario[] }) {
  const rows = useScenarioRows(scenarios)
  if (rows.length === 0) return <p className="p-4 text-sm text-slate">Select scenarios to compare.</p>

  const metrics: { label: string; get: (r: (typeof rows)[number]) => ReactNode }[] = [
    { label: 'Batches', get: (r) => r.scenario.components.map((c) => `${c.batchId} ${c.proportionPct}%`).join(', ') },
    { label: 'Total blend quantity', get: (r) => formatCalc(r.calc.totalTonnes) },
    { label: 'Total material cost', get: (r) => formatCalc(r.calc.totalCost) },
    { label: 'Weighted cost per tonne', get: (r) => formatCalc(r.calc.costPerTonne) },
    { label: 'Weighted moisture', get: (r) => (r.calc.moisture.status === 'ok' ? formatCalc(r.calc.moisture) : <MissingValue label="Unavailable — missing input" />) },
    { label: 'Weighted non-paper', get: (r) => (r.calc.nonPaper.status === 'ok' ? formatCalc(r.calc.nonPaper) : <MissingValue label="Unavailable — missing input" />) },
    { label: 'Stock and configuration', get: (r) => (r.calc.isPlannable ? <Badge tone="forest">OK</Badge> : <Badge tone="rust">{r.calc.issues.filter((i) => i.severity === 'error').length} error(s)</Badge>) },
    { label: 'Specification check', get: (r) => <SpecSummaryBadge summary={r.summary} /> },
  ]

  const chartData = rows.map((r) => ({
    name: r.scenario.name.length > 22 ? `${r.scenario.name.slice(0, 21)}…` : r.scenario.name,
    costPerTonne: r.calc.costPerTonne.status === 'ok' ? Number(r.calc.costPerTonne.value.toFixed(2)) : null,
  }))

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm tabular">
          <caption className="sr-only">Scenario comparison</caption>
          <thead>
            <tr className="border-b border-line bg-paper-2/70 text-left">
              <th scope="col" className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate">Metric</th>
              {rows.map((r) => <th key={r.scenario.id} scope="col" className="px-3 py-2.5 text-sm font-semibold text-ink">{r.scenario.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.label} className="border-b border-line/70 last:border-0">
                <th scope="row" className="px-3 py-2.5 text-left font-normal text-slate">{m.label}</th>
                {rows.map((r) => <td key={r.scenario.id} className="px-3 py-2.5 align-top text-ink">{m.get(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-56" aria-label="Weighted cost per tonne by scenario" role="img">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9d1bf" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5f6661' }} />
            <YAxis tick={{ fontSize: 11, fill: '#5f6661' }} tickFormatter={(v) => `$${v}`} width={48} />
            <Tooltip formatter={(v) => [`$${v}/t`, 'Weighted cost per tonne']} cursor={{ fill: '#efeadd' }} />
            <Bar dataKey="costPerTonne" fill="#1f4d3a" radius={[3, 3, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

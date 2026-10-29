import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePlanner } from '../state/PlannerContext'
import { Card, CardHeader, Stat } from '../components/ui/Card'
import { ButtonLink } from '../components/ui/Button'
import { ProvenanceLegend, ProvenanceTag } from '../components/ui/Provenance'
import { getBatchGaps, hasCompleteMeasurements } from '../lib/batches'
import { fmtTonnes, fmtUsd, fmtUsd2 } from '../lib/format'
import { useScenarioRows, SpecSummaryBadge } from './ScenarioComparison'
import { formatCalc } from './CalcValue'

export function OverviewPage() {
  const { batches, scenarios } = usePlanner()
  const totalTonnes = batches.reduce((s, b) => s + b.availableTonnes, 0)
  const stockValue = batches.reduce((s, b) => s + b.availableTonnes * b.costPerTonne, 0)
  const incomplete = batches.filter((b) => !hasCompleteMeasurements(b))
  const rows = useScenarioRows(scenarios)

  const byGrade = Object.values(
    batches.reduce<Record<string, { grade: string; tonnes: number }>>((acc, b) => {
      const g = b.grade.split(' (')[0]
      acc[g] ??= { grade: g, tonnes: 0 }
      acc[g].tonnes += b.availableTonnes
      return acc
    }, {}),
  )

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Batches" value={batches.length} sub="In inventory" tag={<ProvenanceTag kind="operator" compact />} />
        <Stat label="Available stock" value={fmtTonnes(totalTonnes)} sub="Sum of available tonnes" tag={<ProvenanceTag kind="calculated" compact />} />
        <Stat label="Stock value" value={fmtUsd(stockValue)} sub={`Avg ${totalTonnes > 0 ? fmtUsd2(stockValue / totalTonnes) : '—'}/t`} tag={<ProvenanceTag kind="calculated" compact />} />
        <Stat label="Missing measurements" value={incomplete.length} sub="Batches lacking moisture or non-paper" tag={<ProvenanceTag kind="calculated" compact />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Available stock by grade" description="Tonnes, from operator-entered quantities." />
          <div className="h-64 p-4" role="img" aria-label="Bar chart of available tonnes by grade">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byGrade} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9d1bf" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#5f6661' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6661' }} width={40} />
                <Tooltip formatter={(v) => [`${v} t`, 'Available']} cursor={{ fill: '#efeadd' }} />
                <Bar dataKey="tonnes" fill="#b48a5e" radius={[3, 3, 0, 0]} maxBarSize={64} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Records needing attention" actions={<Link to="/planner/batches" className="text-xs font-medium text-forest hover:underline">View inventory</Link>} />
          <ul className="divide-y divide-line/70">
            {batches.filter((b) => getBatchGaps(b).length > 0).map((b) => (
              <li key={b.id} className="px-5 py-3 text-sm">
                <p className="flex items-center gap-2 font-mono text-xs font-semibold text-ink"><AlertTriangle size={13} className="text-ochre" />{b.id}</p>
                <p className="mt-0.5 text-xs text-slate">Missing: {getBatchGaps(b).map((g) => g.label.toLowerCase()).join(', ')}</p>
              </li>
            ))}
            {batches.every((b) => getBatchGaps(b).length === 0) && <li className="px-5 py-6 text-sm text-slate">All records are complete.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Saved scenarios" actions={<ButtonLink to="/planner/blend" size="sm" icon={<ArrowRight size={14} />}>Open Blend Planner</ButtonLink>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm tabular">
            <caption className="sr-only">Saved scenarios summary</caption>
            <thead><tr className="border-b border-line bg-paper-2/70 text-left text-xs uppercase tracking-wide text-slate">
              <th className="px-4 py-2.5">Scenario</th><th className="px-4 py-2.5 text-right">Quantity</th><th className="px-4 py-2.5 text-right">Cost / t</th><th className="px-4 py-2.5 text-right">Moisture</th><th className="px-4 py-2.5">Specification</th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.scenario.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-ink">{r.scenario.name}</td>
                  <td className="px-4 py-2.5 text-right">{formatCalc(r.calc.totalTonnes)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCalc(r.calc.costPerTonne)}</td>
                  <td className={`px-4 py-2.5 text-right ${r.calc.moisture.status !== 'ok' ? 'text-ochre font-medium' : ''}`}>{formatCalc(r.calc.moisture)}</td>
                  <td className="px-4 py-2.5"><SpecSummaryBadge summary={r.summary} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <ProvenanceLegend className="px-1" />
    </div>
  )
}

import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { usePlanner } from '../state/PlannerContext'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, EmptyState } from '../components/ui/Card'
import { ScenarioComparison, useScenarioRows } from './ScenarioComparison'
import { formatCalc } from './CalcValue'

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function ReportsPage() {
  const { scenarios } = usePlanner()
  const [ids, setIds] = useState<string[]>(() => scenarios.map((s) => s.id))
  const selected = scenarios.filter((s) => ids.includes(s.id))
  const rows = useScenarioRows(selected)

  const exportCsv = () => {
    const header = ['Scenario', 'Batches', 'Total quantity', 'Total cost', 'Cost per tonne', 'Weighted moisture', 'Weighted non-paper', 'Issues']
    const lines = rows.map((r) => [
      r.scenario.name,
      r.scenario.components.map((c) => `${c.batchId} ${c.proportionPct}%`).join('; '),
      formatCalc(r.calc.totalTonnes),
      formatCalc(r.calc.totalCost),
      formatCalc(r.calc.costPerTonne),
      formatCalc(r.calc.moisture),
      formatCalc(r.calc.nonPaper),
      r.calc.issues.map((i) => i.message).join(' | '),
    ])
    const csv = [header, ...lines].map((l) => l.map(csvEscape).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'paperhaven-scenario-comparison.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Card className="no-print">
        <CardHeader title="Scenarios in this report" description="Choose which saved scenarios to include."
          actions={<>
            <Button size="sm" variant="secondary" icon={<Download size={14} />} disabled={!selected.length} onClick={exportCsv}>Export CSV</Button>
            <Button size="sm" variant="secondary" icon={<Printer size={14} />} disabled={!selected.length} onClick={() => window.print()}>Print</Button>
          </>} />
        <div className="flex flex-wrap gap-2 p-5">
          {scenarios.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-md border border-line bg-white/70 px-3 py-1.5 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[#1f4d3a]" checked={ids.includes(s.id)}
                onChange={() => setIds((x) => (x.includes(s.id) ? x.filter((y) => y !== s.id) : [...x, s.id]))} />
              {s.name}
            </label>
          ))}
          {scenarios.length === 0 && <p className="text-sm text-slate">No saved scenarios yet.</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Scenario comparison" description="Calculated from current batch records and the active specification. Demonstration values." />
        <div className="p-5">
          {selected.length ? <ScenarioComparison scenarios={selected} /> : <EmptyState title="Nothing selected">Select at least one scenario.</EmptyState>}
        </div>
      </Card>

      {rows.map((r) => r.calc.issues.length > 0 && (
        <Card key={r.scenario.id}>
          <CardHeader title={`${r.scenario.name} — issues and missing inputs`} />
          <ul className="space-y-1 p-5 text-sm">
            {r.calc.issues.map((i, k) => <li key={k} className={i.severity === 'error' ? 'text-rust' : 'text-ochre'}>• {i.message}</li>)}
          </ul>
        </Card>
      ))}
    </div>
  )
}

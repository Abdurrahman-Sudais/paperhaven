import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Copy, Divide, FilePlus2, FolderOpen, GitCompareArrows, Info, Save, Trash2, XCircle } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { BlendScenario } from '../types'
import { usePlanner, newWorkingScenario } from '../state/PlannerContext'
import { calculateBlend, evenProportions, proportionsTotalIsValid, round } from '../lib/calculations'
import { checkSpecification, describeRange, summariseSpecCheck } from '../lib/specCheck'
import { Button } from '../components/ui/Button'
import { Badge, Card, CardHeader, EmptyState } from '../components/ui/Card'
import { TextAreaField, TextField } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { ProvenanceTag } from '../components/ui/Provenance'
import { BLEND_COLORS } from '../components/site/ProductPreview'
import { CalcValue } from './CalcValue'
import { InspectionBadge, MissingValue } from './BatchStatus'
import { ScenarioComparison, SpecSummaryBadge } from './ScenarioComparison'
import { cx, fmtDate, fmtPct, fmtTonnes, fmtUsd, fmtUsd2, uid } from '../lib/format'

export function BlendPlannerPage() {
  const { batches, scenarios, specification, working, setWorking, saveScenario, deleteScenario } = usePlanner()
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [nameError, setNameError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const calc = useMemo(() => calculateBlend(working, batches), [working, batches])
  const specResults = useMemo(() => checkSpecification(specification, calc), [specification, calc])
  const saved = scenarios.find((s) => s.id === working.id)
  const dirty = !saved || JSON.stringify({ ...saved, updatedAt: '' }) !== JSON.stringify({ ...working, updatedAt: '' })

  const update = (patch: Partial<BlendScenario>) => setWorking((w) => ({ ...w, ...patch }))
  const selectedIds = new Set(working.components.map((c) => c.batchId))

  const toggleBatch = (id: string) => {
    setWorking((w) =>
      w.components.some((c) => c.batchId === id)
        ? { ...w, components: w.components.filter((c) => c.batchId !== id) }
        : { ...w, components: [...w.components, { batchId: id, proportionPct: 0 }] },
    )
  }
  const setProportion = (id: string, v: number) =>
    setWorking((w) => ({ ...w, components: w.components.map((c) => (c.batchId === id ? { ...c, proportionPct: v } : c)) }))
  const splitEvenly = () => {
    const p = evenProportions(working.components.length)
    setWorking((w) => ({ ...w, components: w.components.map((c, i) => ({ ...c, proportionPct: p[i] })) }))
  }

  const doSave = (asNew: boolean) => {
    if (!working.name.trim()) return setNameError('Give the scenario a name before saving.')
    setNameError('')
    const now = new Date().toISOString()
    const s: BlendScenario = asNew
      ? { ...working, id: uid('scn'), name: saved && working.name === saved.name ? `${working.name} (copy)` : working.name, createdAt: now, isDemo: false }
      : { ...working, isDemo: saved?.isDemo }
    saveScenario(s)
    setWorking({ ...s, updatedAt: now })
    setSavedMsg(asNew ? 'Saved as a new scenario.' : 'Scenario saved.')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  const errors = calc.issues.filter((i) => i.severity === 'error')
  const warnings = calc.issues.filter((i) => i.severity === 'warning')
  const pieData = calc.lines.filter((l) => l.proportionPct > 0).map((l) => ({ name: l.batchId, value: l.proportionPct }))
  const totalOk = proportionsTotalIsValid(calc.proportionTotal)
  const missingMoisture = calc.moisture.status === 'unavailable' && calc.moisture.missing.length > 0

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Scenario header */}
      <Card>
        <div className="grid gap-4 p-5 md:grid-cols-[1.4fr_0.6fr_auto] md:items-start">
          <TextField label="Scenario name" value={working.name} error={nameError} onChange={(e) => update({ name: e.target.value })} />
          <TextField label="Planned blend quantity (t)" type="number" min={0} step="1" inputMode="decimal"
            value={Number.isFinite(working.targetTonnes) ? working.targetTonnes : ''}
            onChange={(e) => update({ targetTonnes: e.target.value === '' ? NaN : Number(e.target.value) })}
            error={calc.issues.some((i) => i.code === 'invalid-target') ? 'Enter a quantity greater than 0.' : undefined} />
          <div className="flex flex-wrap gap-2 md:pt-6">
            <Button icon={<Save size={14} />} onClick={() => doSave(false)} disabled={!!saved && !dirty}>{saved ? 'Save' : 'Save scenario'}</Button>
            {saved && <Button variant="secondary" icon={<Copy size={14} />} onClick={() => doSave(true)}>Save as new</Button>}
            <Button variant="ghost" icon={<FilePlus2 size={14} />} onClick={() => setWorking(newWorkingScenario())}>New</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-2.5 text-xs text-slate" aria-live="polite">
          {saved ? (dirty ? <Badge tone="ochre">Unsaved changes</Badge> : <Badge tone="forest">Saved</Badge>) : <Badge>Not saved yet</Badge>}
          {working.isDemo && <Badge tone="ochre">Demonstration scenario</Badge>}
          {savedMsg && <span className="font-medium text-forest">{savedMsg}</span>}
          {working.notes && <span className="truncate">· {working.notes}</span>}
        </div>
      </Card>

      {missingMoisture && (
        <div role="alert" className="flex gap-3 rounded-lg border border-ochre/40 bg-ochre-soft p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-ochre" />
          <div>
            <p className="font-semibold text-ochre">Blend moisture is unavailable because a measurement is missing.</p>
            <p className="mt-1 text-graphite">
              {calc.moisture.status === 'unavailable' && calc.moisture.missing.map((m) => m.batchId).join(', ')} {calc.moisture.status === 'unavailable' && calc.moisture.missing.length === 1 ? 'has' : 'have'} no recorded moisture value.
              A weighted average needs a value for every batch that contributes to the blend. Treating the missing value as 0% would understate the blend’s moisture, so Paperhaven withholds the result.
              Record the measurement in <Link to="/planner/batches" className="font-medium text-forest underline">Incoming Batches</Link>, or remove the batch from the blend.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        {/* Left: batches and proportions */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="1. Select batches" description="Choose the batches to include. Only operator-entered stock is available for planning." />
            <ul className="divide-y divide-line/70">
              {batches.map((b) => {
                const checked = selectedIds.has(b.id)
                return (
                  <li key={b.id}>
                    <label className={cx('flex cursor-pointer items-start gap-3 px-5 py-3 hover:bg-paper-2/50', checked && 'bg-forest-soft/40')}>
                      <input type="checkbox" className="mt-1 h-4 w-4 accent-[#1f4d3a]" checked={checked} onChange={() => toggleBatch(b.id)} aria-describedby={`b-${b.id}-desc`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-ink">{b.id}</span>
                          <span className="text-sm text-graphite">{b.grade}</span>
                          <InspectionBadge status={b.inspectionStatus} />
                        </div>
                        <div id={`b-${b.id}-desc`} className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate tabular">
                          <span>{b.supplier}</span>
                          <span>{fmtTonnes(b.availableTonnes)} available</span>
                          <span>{fmtUsd2(b.costPerTonne)}/t</span>
                          <span>Moisture {b.moisture.value === null ? <MissingValue /> : fmtPct(b.moisture.value)}</span>
                          <span>Non-paper {b.nonPaper.value === null ? <MissingValue /> : fmtPct(b.nonPaper.value)}</span>
                        </div>
                      </div>
                    </label>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="2. Set proportions" description="Proportion of the blend by as-received mass. Must total 100%."
              actions={working.components.length > 1 && <Button size="sm" variant="secondary" icon={<Divide size={14} />} onClick={splitEvenly}>Split evenly</Button>} />
            {working.components.length === 0 ? (
              <div className="p-5"><EmptyState title="No batches selected">Select one or more batches above to build a blend.</EmptyState></div>
            ) : (
              <div className="space-y-1 p-5">
                {calc.lines.map((l, i) => {
                  const b = l.batch
                  return (
                    <div key={l.batchId} className="grid items-center gap-3 rounded-md py-2 sm:grid-cols-[150px_1fr_110px_120px]">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-[2px]" style={{ background: BLEND_COLORS[i % BLEND_COLORS.length] }} />
                        <span className="font-mono text-xs font-semibold">{l.batchId}</span>
                      </div>
                      <input type="range" min={0} max={100} step={1} value={Number.isFinite(l.proportionPct) ? l.proportionPct : 0}
                        onChange={(e) => setProportion(l.batchId, Number(e.target.value))} className="w-full accent-[#1f4d3a]"
                        aria-label={`${l.batchId} proportion slider`} />
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} max={100} step="0.1" inputMode="decimal" aria-label={`${l.batchId} proportion percent`}
                          className="w-20 rounded-md border border-line-strong bg-white px-2 py-1.5 text-right text-sm tabular focus:border-forest-2 focus:outline-none"
                          value={Number.isFinite(l.proportionPct) ? l.proportionPct : ''}
                          onChange={(e) => setProportion(l.batchId, e.target.value === '' ? NaN : Number(e.target.value))} />
                        <span className="text-sm text-slate">%</span>
                      </div>
                      <div className={cx('text-right text-xs tabular', l.exceedsStock ? 'font-semibold text-rust' : 'text-slate')}>
                        {l.tonnes !== null ? `${round(l.tonnes, 2)} t` : '—'}
                        <span className="block">of {b ? fmtTonnes(b.availableTonnes) : '?'}{l.exceedsStock && ' · exceeds stock'}</span>
                      </div>
                    </div>
                  )
                })}
                <div className={cx('mt-3 flex items-center justify-between rounded-md border px-3 py-2 text-sm', totalOk ? 'border-forest/25 bg-forest-soft text-forest' : 'border-rust/30 bg-rust-soft text-rust')} aria-live="polite">
                  <span className="flex items-center gap-1.5 font-medium">
                    {totalOk ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Proportions total {round(calc.proportionTotal, 2)}%
                  </span>
                  {!totalOk && <span className="text-xs">{calc.proportionTotal < 100 ? `${round(100 - calc.proportionTotal, 2)}% unallocated` : `${round(calc.proportionTotal - 100, 2)}% over`}</span>}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <div className="p-5">
              <TextAreaField label="Scenario notes" rows={2} value={working.notes} onChange={(e) => update({ notes: e.target.value })} />
            </div>
          </Card>
        </div>

        {/* Right: results */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="3. Calculated results" description="Deterministic calculations from the batch records. Expand a result to see its inputs." />
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <CalcValue label="Total blend quantity" result={calc.totalTonnes} />
              <CalcValue label="Total material cost" result={calc.totalCost} />
              <CalcValue label="Weighted cost per tonne" result={calc.costPerTonne} />
              <CalcValue label="Weighted moisture" result={calc.moisture} />
              <div className="sm:col-span-2"><CalcValue label="Weighted non-paper components" result={calc.nonPaper} /></div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Share of each batch" icon={<ProvenanceTag kind="calculated" />} />
            {pieData.length === 0 ? (
              <p className="p-5 text-sm text-slate">No batch has a positive proportion yet.</p>
            ) : (
              <div className="grid items-center gap-4 p-5 sm:grid-cols-[160px_1fr]">
                <div className="h-40" role="img" aria-label="Blend share pie chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} stroke="#f6f3ea" strokeWidth={2} isAnimationActive={false}>
                        {pieData.map((d) => <Cell key={d.name} fill={BLEND_COLORS[calc.lines.findIndex((l) => l.batchId === d.name) % BLEND_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-sm tabular">
                  <caption className="sr-only">Share of each batch</caption>
                  <thead><tr className="text-left text-xs text-slate"><th className="py-1 font-medium">Batch</th><th className="py-1 text-right font-medium">Share</th><th className="py-1 text-right font-medium">Tonnes</th><th className="py-1 text-right font-medium">Cost</th></tr></thead>
                  <tbody>
                    {calc.lines.map((l, i) => (
                      <tr key={l.batchId} className="border-t border-line/70">
                        <td className="py-1.5"><span className="mr-1.5 inline-block h-2 w-2 rounded-[2px]" style={{ background: BLEND_COLORS[i % BLEND_COLORS.length] }} />{l.batchId}</td>
                        <td className="py-1.5 text-right">{Number.isFinite(l.proportionPct) ? `${l.proportionPct}%` : '—'}</td>
                        <td className="py-1.5 text-right">{l.tonnes !== null ? round(l.tonnes, 2) : '—'}</td>
                        <td className="py-1.5 text-right">{l.cost !== null ? fmtUsd(l.cost) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Specification check" description={specification.name}
              actions={<><SpecSummaryBadge summary={summariseSpecCheck(specResults)} /><Link to="/planner/specifications" className="text-xs font-medium text-forest hover:underline">Edit</Link></>} />
            <ul className="divide-y divide-line/70">
              {specResults.map((r) => (
                <li key={r.parameter} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{r.label}</p>
                    <p className="text-xs text-slate">{r.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {r.status === 'within' && <Badge tone="forest">Within</Badge>}
                    {r.status === 'outside' && <Badge tone="rust">Outside</Badge>}
                    {r.status === 'unavailable' && <Badge tone="ochre">Unavailable</Badge>}
                    {r.status === 'not-configured' && <Badge>Not configured</Badge>}
                    <p className="mt-1 text-[11px] text-slate">{describeRange(r.min, r.max, r.unit)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-1.5 border-t border-line px-5 py-3 text-xs text-slate">
              <Info size={12} className="mt-0.5 shrink-0" /> Compares only calculated values against thresholds configured by your team. No industry standard is assumed.
            </p>
          </Card>

          {(errors.length > 0 || warnings.length > 0) && (
            <Card>
              <CardHeader title="Issues and missing inputs" />
              <ul className="space-y-2 p-5 text-sm">
                {errors.map((i, k) => <li key={`e${k}`} className="flex gap-2 text-rust"><XCircle size={14} className="mt-0.5 shrink-0" />{i.message}</li>)}
                {warnings.map((i, k) => <li key={`w${k}`} className="flex gap-2 text-ochre"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{i.message}</li>)}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Saved scenarios */}
      <Card>
        <CardHeader title="Saved scenarios" description="Stored in this browser. Select two or more to compare."
          actions={<Button size="sm" variant="secondary" icon={<GitCompareArrows size={14} />} disabled={compareIds.length < 2} onClick={() => setCompareOpen(true)}>Compare ({compareIds.length})</Button>} />
        {scenarios.length === 0 ? (
          <div className="p-5"><EmptyState title="No saved scenarios">Save the current scenario to keep it.</EmptyState></div>
        ) : (
          <ul className="divide-y divide-line/70">
            {scenarios.map((s) => {
              const c = calculateBlend(s, batches)
              return (
                <li key={s.id} className={cx('flex flex-wrap items-center gap-3 px-5 py-3', s.id === working.id && 'bg-forest-soft/40')}>
                  <input type="checkbox" className="h-4 w-4 accent-[#1f4d3a]" aria-label={`Compare ${s.name}`} checked={compareIds.includes(s.id)}
                    onChange={() => setCompareIds((ids) => (ids.includes(s.id) ? ids.filter((x) => x !== s.id) : [...ids, s.id]))} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                      {s.name} {s.isDemo && <Badge tone="ochre">Demo</Badge>} {s.id === working.id && <Badge tone="forest">Open</Badge>}
                    </p>
                    <p className="text-xs text-slate tabular">
                      {s.components.length} batches · {Number.isFinite(s.targetTonnes) ? s.targetTonnes : '—'} t · {c.costPerTonne.status === 'ok' ? `${fmtUsd2(c.costPerTonne.value)}/t` : 'cost unavailable'} · moisture {c.moisture.status === 'ok' ? fmtPct(c.moisture.value, 2) : 'unavailable'} · updated {fmtDate(s.updatedAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" icon={<FolderOpen size={14} />} onClick={() => setWorking(structuredClone(s))}>Open</Button>
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} aria-label={`Delete ${s.name}`}
                    onClick={() => { if (confirm(`Delete scenario “${s.name}”?`)) { deleteScenario(s.id); setCompareIds((ids) => ids.filter((x) => x !== s.id)) } }}>
                    <span className="sr-only sm:not-sr-only">Delete</span>
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} size="xl" title="Compare scenarios" description="All values calculated from current batch records.">
        <ScenarioComparison scenarios={scenarios.filter((s) => compareIds.includes(s.id))} />
      </Modal>
    </div>
  )
}

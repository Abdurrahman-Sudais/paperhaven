import { useEffect, useState } from 'react'
import { Info, RotateCcw, Save } from 'lucide-react'
import type { ProductionSpecification, SpecRange } from '../types'
import { usePlanner } from '../state/PlannerContext'
import { DEMO_SPECIFICATION } from '../data/demo'
import { SPEC_PARAMETERS, validateSpecRange } from '../lib/specCheck'
import { Button } from '../components/ui/Button'
import { Badge, Card, CardHeader } from '../components/ui/Card'
import { TextAreaField, TextField } from '../components/ui/Field'
import { ProvenanceTag } from '../components/ui/Provenance'
import { fmtDate } from '../lib/format'

export function SpecificationsPage() {
  const { specification, updateSpecification, can } = usePlanner()
  const [draft, setDraft] = useState<ProductionSpecification>(specification)
  const [nameError, setNameError] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => setDraft(specification), [specification])

  const errors = draft.ranges.map(validateSpecRange)
  const hasErrors = errors.some(Boolean) || !draft.name.trim()
  const dirty = JSON.stringify(draft) !== JSON.stringify(specification)

  const setRange = (i: number, patch: Partial<SpecRange>) =>
    setDraft((d) => ({ ...d, ranges: d.ranges.map((r, k) => (k === i ? { ...r, ...patch } : r)) }))
  const parse = (v: string) => (v.trim() === '' ? null : Number(v))

  const save = () => {
    if (!draft.name.trim()) return setNameError('Name is required.')
    setNameError('')
    if (hasErrors) return
    updateSpecification(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex gap-3 rounded-lg border border-steel/25 bg-steel-soft p-4 text-sm text-graphite">
        <Info size={18} className="mt-0.5 shrink-0 text-steel" />
        <p>
          Paperhaven does not supply technical acceptance standards. Configure the target ranges your team has agreed for this product.
          The demo thresholds below are illustrative only. Ranges are inclusive; leave a bound blank for no limit.
        </p>
      </div>

      <Card>
        <CardHeader title="Production specification" description={`Last updated ${fmtDate(specification.updatedAt)}`}
          actions={<ProvenanceTag kind="operator" />} />
        <div className="grid gap-4 p-5">
          <TextField label="Specification name" required value={draft.name} error={nameError} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <TextAreaField label="Description" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Target ranges" description="Each enabled check compares one calculated blend value with your bounds." />
        <ul className="divide-y divide-line/70">
          {draft.ranges.map((r, i) => {
            const meta = SPEC_PARAMETERS[r.parameter]
            return (
              <li key={r.parameter} className="grid gap-4 px-5 py-4 md:grid-cols-[1.3fr_1fr_1fr] md:items-start">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-ink">
                    <input type="checkbox" className="h-4 w-4 accent-[#1f4d3a]" checked={r.enabled} onChange={(e) => setRange(i, { enabled: e.target.checked })} />
                    {meta.label}
                    {!r.enabled && <Badge>Not checked</Badge>}
                  </label>
                  <p className="mt-1 pl-6 text-xs text-slate">{meta.hint}</p>
                  {errors[i] && <p role="alert" className="mt-1 pl-6 text-xs font-medium text-rust">{errors[i]}</p>}
                </div>
                <TextField label={`Minimum (${meta.unit})`} type="number" step="0.1" disabled={!r.enabled}
                  value={r.min ?? ''} onChange={(e) => setRange(i, { min: parse(e.target.value) })} />
                <TextField label={`Maximum (${meta.unit})`} type="number" step="0.1" disabled={!r.enabled}
                  value={r.max ?? ''} onChange={(e) => setRange(i, { max: parse(e.target.value) })} />
              </li>
            )
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-paper-2/50 px-5 py-3">
          {saved && <span className="mr-auto text-sm font-medium text-forest" role="status">Specification saved.</span>}
          <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={() => setDraft(structuredClone(DEMO_SPECIFICATION))}>Restore demo values</Button>
          <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(specification)}>Discard changes</Button>
          <Button icon={<Save size={14} />} disabled={!can('spec') || !dirty || hasErrors} title={can('spec') ? undefined : 'Only the quality manager can change the specification'} onClick={save}>Save specification</Button>
        </div>
      </Card>
    </div>
  )
}

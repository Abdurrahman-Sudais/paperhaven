import { useEffect, useState, type FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import type { Batch } from '../types'
import { INSPECTION_STATUS_LABELS, RECOVERED_GRADES, type InspectionStatus } from '../types'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { SelectField, TextAreaField, TextField } from '../components/ui/Field'
import { ProvenanceTag } from '../components/ui/Provenance'
import { batchFromDraft, draftFromBatch, emptyDraft, validateBatchDraft, type BatchDraft, type BatchDraftErrors } from '../lib/batches'
import { usePlanner } from '../state/PlannerContext'

interface Props {
  open: boolean
  onClose: () => void
  batch?: Batch
  /** Values suggested by the (simulated) AI panel. Shown highlighted; only saved if the user saves the form. */
  suggested?: Partial<BatchDraft>
  onSaved?: (b: Batch) => void
}

export function BatchForm({ open, onClose, batch, suggested, onSaved }: Props) {
  const { batches, addBatch, updateBatch } = usePlanner()
  const [draft, setDraft] = useState<BatchDraft>(emptyDraft)
  const [errors, setErrors] = useState<BatchDraftErrors>({})

  useEffect(() => {
    if (open) {
      setDraft({ ...(batch ? draftFromBatch(batch) : emptyDraft()), ...suggested })
      setErrors({})
    }
  }, [open, batch, suggested])

  const set = <K extends keyof BatchDraft>(k: K) => (e: { target: { value: string } }) => {
    setDraft((d) => ({ ...d, [k]: e.target.value as BatchDraft[K] }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const isSuggested = (k: keyof BatchDraft) => suggested && k in suggested && suggested[k] === draft[k]
  const aiNote = (k: keyof BatchDraft) =>
    isSuggested(k) ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai"><Sparkles size={11} /> AI-suggested — verify against the source document</span>
    ) : undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateBatchDraft(draft, batches.map((b) => b.id), batch?.id)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const next = batchFromDraft(draft, batch)
    if (batch) updateBatch(batch.id, next)
    else addBatch(next)
    onSaved?.(next)
    onClose()
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <Modal open={open} onClose={onClose} size="xl" title={batch ? `Edit ${batch.id}` : 'Add batch'}
      description="Fields marked * are required. Leave a measurement blank if it has not been measured — it will be flagged, not assumed."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="batch-form">{batch ? 'Save changes' : 'Add batch'}</Button></>}>
      <form id="batch-form" noValidate onSubmit={submit} className="space-y-6">
        {errorCount > 0 && (
          <div role="alert" className="rounded-md border border-rust/30 bg-rust-soft px-3 py-2 text-sm text-rust">
            Please fix {errorCount} field{errorCount > 1 ? 's' : ''} below.
          </div>
        )}
        <fieldset className="space-y-4">
          <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">Batch information <ProvenanceTag kind="operator" /></legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label="Batch ID" required value={draft.id} onChange={set('id')} error={errors.id} placeholder="e.g. B-2026-0142" />
            <SelectField label="Recovered-paper grade" required value={draft.grade} onChange={set('grade')} error={errors.grade}>
              <option value="">Select grade…</option>
              {RECOVERED_GRADES.map((g) => <option key={g}>{g}</option>)}
            </SelectField>
            <TextField label="Supplier" required value={draft.supplier} onChange={set('supplier')} error={errors.supplier} />
            <TextField label="Source / yard location" value={draft.sourceLocation} onChange={set('sourceLocation')} />
            <TextField label="Received date" required type="date" value={draft.receivedDate} onChange={set('receivedDate')} error={errors.receivedDate} adornment={aiNote('receivedDate')} />
            <SelectField label="Inspection status" value={draft.inspectionStatus} onChange={set('inspectionStatus')}>
              {(Object.keys(INSPECTION_STATUS_LABELS) as InspectionStatus[]).map((s) => <option key={s} value={s}>{INSPECTION_STATUS_LABELS[s]}</option>)}
            </SelectField>
            <TextField label="Available quantity (t)" required type="number" inputMode="decimal" min={0} step="0.1" value={draft.availableTonnes} onChange={set('availableTonnes')} error={errors.availableTonnes} adornment={aiNote('availableTonnes')} />
            <TextField label="Cost per tonne (USD)" required type="number" inputMode="decimal" min={0} step="0.01" value={draft.costPerTonne} onChange={set('costPerTonne')} error={errors.costPerTonne} />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">Measured properties <ProvenanceTag kind="measured" /></legend>
          <p className="-mt-2 text-xs text-slate">Enter only values from a physical test of a sample. Visual impressions and photographs are not measurements.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Moisture (%)" type="number" inputMode="decimal" min={0} max={100} step="0.1" value={draft.moistureValue} onChange={set('moistureValue')} error={errors.moistureValue} hint="Blank = not measured" adornment={aiNote('moistureValue')} />
            <TextField label="Moisture measured on" type="date" value={draft.moistureDate} onChange={set('moistureDate')} error={errors.moistureDate} />
            <TextField label="Moisture method" value={draft.moistureMethod} onChange={set('moistureMethod')} placeholder="e.g. oven-dry, 5 bales" />
            <TextField label="Non-paper components (%)" type="number" inputMode="decimal" min={0} max={100} step="0.1" value={draft.nonPaperValue} onChange={set('nonPaperValue')} error={errors.nonPaperValue} hint="Blank = not measured" adornment={aiNote('nonPaperValue')} />
            <TextField label="Non-paper measured on" type="date" value={draft.nonPaperDate} onChange={set('nonPaperDate')} error={errors.nonPaperDate} adornment={aiNote('nonPaperDate')} />
            <TextField label="Non-paper method" value={draft.nonPaperMethod} onChange={set('nonPaperMethod')} placeholder="e.g. hand sort, 25 kg" adornment={aiNote('nonPaperMethod')} />
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">Notes <ProvenanceTag kind="operator" /></legend>
          <TextAreaField label="Contamination notes" rows={3} value={draft.contaminationNotes} onChange={set('contaminationNotes')} />
          <TextAreaField label="Inspection notes" rows={3} value={draft.inspectionNotes} onChange={set('inspectionNotes')} />
        </fieldset>
      </form>
    </Modal>
  )
}

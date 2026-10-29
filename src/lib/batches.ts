/**
 * Batch record helpers: completeness checks, form validation, filtering and sorting.
 */
import type { Batch, InspectionStatus, MeasuredProperty, RecoveredGrade } from '../types'
import { RECOVERED_GRADES } from '../types'

export interface CompletenessGap {
  field: string
  label: string
  kind: 'measurement' | 'record' | 'document'
}

/** Lists the fields a buyer or planner would need that are not yet recorded. */
export function getBatchGaps(batch: Batch): CompletenessGap[] {
  const gaps: CompletenessGap[] = []
  const measured: [MeasuredProperty, string][] = [
    ['moisture', 'Moisture measurement'],
    ['nonPaper', 'Non-paper components measurement'],
  ]
  for (const [prop, label] of measured) {
    const m = batch[prop]
    if (m.value === null) gaps.push({ field: prop, label, kind: 'measurement' })
    else if (!m.measuredAt) gaps.push({ field: `${prop}.measuredAt`, label: `${label} date`, kind: 'measurement' })
  }
  if (!batch.inspectionNotes.trim()) gaps.push({ field: 'inspectionNotes', label: 'Inspection notes', kind: 'record' })
  if (!batch.contaminationNotes.trim())
    gaps.push({ field: 'contaminationNotes', label: 'Contamination notes', kind: 'record' })
  if (!batch.documents.some((d) => d.kind === 'inspection-report'))
    gaps.push({ field: 'documents', label: 'Inspection report attachment', kind: 'document' })
  return gaps
}

export function hasCompleteMeasurements(batch: Batch): boolean {
  return batch.moisture.value !== null && batch.nonPaper.value !== null
}

/** Fraction (0–1) of tracked fields that are recorded. */
export function completenessScore(batch: Batch): number {
  const tracked = 7 // 2 values + 2 dates + 2 notes + 1 report
  let missing = 0
  for (const g of getBatchGaps(batch)) {
    missing += g.field === 'moisture' || g.field === 'nonPaper' ? 2 : 1 // missing value implies missing date
  }
  return Math.max(0, (tracked - missing) / tracked)
}

/** Most recent measurement date across measured properties, or null. */
export function latestMeasurementDate(batch: Batch): string | null {
  const dates = [batch.moisture.measuredAt, batch.nonPaper.measuredAt].filter((d): d is string => !!d)
  return dates.length ? dates.sort().at(-1)! : null
}

// ——— Form validation ———

export interface BatchDraft {
  id: string
  grade: RecoveredGrade | ''
  supplier: string
  sourceLocation: string
  receivedDate: string
  availableTonnes: string
  costPerTonne: string
  moistureValue: string
  moistureDate: string
  moistureMethod: string
  nonPaperValue: string
  nonPaperDate: string
  nonPaperMethod: string
  inspectionStatus: InspectionStatus
  contaminationNotes: string
  inspectionNotes: string
}

export type BatchDraftErrors = Partial<Record<keyof BatchDraft, string>>

export function draftFromBatch(b: Batch): BatchDraft {
  return {
    id: b.id,
    grade: b.grade,
    supplier: b.supplier,
    sourceLocation: b.sourceLocation,
    receivedDate: b.receivedDate,
    availableTonnes: String(b.availableTonnes),
    costPerTonne: String(b.costPerTonne),
    moistureValue: b.moisture.value === null ? '' : String(b.moisture.value),
    moistureDate: b.moisture.measuredAt ?? '',
    moistureMethod: b.moisture.method ?? '',
    nonPaperValue: b.nonPaper.value === null ? '' : String(b.nonPaper.value),
    nonPaperDate: b.nonPaper.measuredAt ?? '',
    nonPaperMethod: b.nonPaper.method ?? '',
    inspectionStatus: b.inspectionStatus,
    contaminationNotes: b.contaminationNotes,
    inspectionNotes: b.inspectionNotes,
  }
}

export function emptyDraft(): BatchDraft {
  return {
    id: '',
    grade: '',
    supplier: '',
    sourceLocation: '',
    receivedDate: new Date().toISOString().slice(0, 10),
    availableTonnes: '',
    costPerTonne: '',
    moistureValue: '',
    moistureDate: '',
    moistureMethod: '',
    nonPaperValue: '',
    nonPaperDate: '',
    nonPaperMethod: '',
    inspectionStatus: 'not-inspected',
    contaminationNotes: '',
    inspectionNotes: '',
  }
}

const parseNum = (s: string): number | null => {
  if (s.trim() === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))

export function validateBatchDraft(d: BatchDraft, existingIds: string[], editingId?: string): BatchDraftErrors {
  const e: BatchDraftErrors = {}
  const id = d.id.trim()
  if (!id) e.id = 'Batch ID is required.'
  else if (!/^[A-Za-z0-9][A-Za-z0-9-_.]{1,31}$/.test(id))
    e.id = 'Use 2–32 letters, numbers, dashes, dots or underscores.'
  else if (id !== editingId && existingIds.includes(id)) e.id = 'A batch with this ID already exists.'

  if (!d.grade || !RECOVERED_GRADES.includes(d.grade)) e.grade = 'Select a recovered-paper grade.'
  if (!d.supplier.trim()) e.supplier = 'Supplier is required.'
  if (!d.receivedDate || !isIsoDate(d.receivedDate)) e.receivedDate = 'Enter a valid received date.'

  const qty = parseNum(d.availableTonnes)
  if (qty === null) e.availableTonnes = 'Available quantity is required.'
  else if (Number.isNaN(qty) || qty < 0) e.availableTonnes = 'Enter a quantity of 0 tonnes or more.'
  else if (qty > 100000) e.availableTonnes = 'Quantity looks too large — check the unit (tonnes).'

  const cost = parseNum(d.costPerTonne)
  if (cost === null) e.costPerTonne = 'Cost per tonne is required.'
  else if (Number.isNaN(cost) || cost < 0) e.costPerTonne = 'Enter a cost of 0 or more.'

  for (const [valKey, dateKey, label] of [
    ['moistureValue', 'moistureDate', 'Moisture'],
    ['nonPaperValue', 'nonPaperDate', 'Non-paper content'],
  ] as const) {
    const v = parseNum(d[valKey])
    if (v !== null) {
      if (Number.isNaN(v) || v < 0 || v > 100) e[valKey] = `${label} must be between 0 and 100%.`
      if (!d[dateKey]) e[dateKey] = 'Enter the measurement date for this value.'
    }
    if (d[dateKey] && !isIsoDate(d[dateKey])) e[dateKey] = 'Enter a valid date.'
    if (d[dateKey] && v === null) e[valKey] = 'A measurement date was entered without a value.'
  }
  return e
}

export function batchFromDraft(d: BatchDraft, previous?: Batch): Batch {
  const num = (s: string) => (s.trim() === '' ? null : Number(s))
  return {
    id: d.id.trim(),
    grade: d.grade as RecoveredGrade,
    supplier: d.supplier.trim(),
    sourceLocation: d.sourceLocation.trim(),
    receivedDate: d.receivedDate,
    availableTonnes: Number(d.availableTonnes),
    costPerTonne: Number(d.costPerTonne),
    moisture: {
      value: num(d.moistureValue),
      measuredAt: d.moistureDate || null,
      method: d.moistureMethod.trim() || undefined,
    },
    nonPaper: {
      value: num(d.nonPaperValue),
      measuredAt: d.nonPaperDate || null,
      method: d.nonPaperMethod.trim() || undefined,
    },
    inspectionStatus: d.inspectionStatus,
    contaminationNotes: d.contaminationNotes.trim(),
    inspectionNotes: d.inspectionNotes.trim(),
    documents: previous?.documents ?? [],
    isDemo: previous?.isDemo,
  }
}

// ——— Filtering and sorting ———

export type CompletenessFilter = 'all' | 'complete' | 'missing-measurements' | 'missing-any'
export type SortKey = 'id' | 'costPerTonne' | 'availableTonnes' | 'moisture'
export type SortDir = 'asc' | 'desc'

export interface BatchFilters {
  search: string
  grade: RecoveredGrade | 'all'
  supplier: string | 'all'
  completeness: CompletenessFilter
}

export function filterBatches(batches: Batch[], f: BatchFilters): Batch[] {
  const q = f.search.trim().toLowerCase()
  return batches.filter((b) => {
    if (f.grade !== 'all' && b.grade !== f.grade) return false
    if (f.supplier !== 'all' && b.supplier !== f.supplier) return false
    if (f.completeness === 'complete' && getBatchGaps(b).length > 0) return false
    if (f.completeness === 'missing-measurements' && hasCompleteMeasurements(b)) return false
    if (f.completeness === 'missing-any' && getBatchGaps(b).length === 0) return false
    if (q) {
      const hay = [b.id, b.grade, b.supplier, b.sourceLocation, b.contaminationNotes, b.inspectionNotes]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

/** Sorts a copy. Batches without a moisture value always sort last, regardless of direction. */
export function sortBatches(batches: Batch[], key: SortKey, dir: SortDir): Batch[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...batches].sort((a, b) => {
    if (key === 'id') return sign * a.id.localeCompare(b.id)
    if (key === 'moisture') {
      const av = a.moisture.value
      const bv = b.moisture.value
      if (av === null && bv === null) return a.id.localeCompare(b.id)
      if (av === null) return 1
      if (bv === null) return -1
      return sign * (av - bv)
    }
    return sign * (a[key] - b[key])
  })
}

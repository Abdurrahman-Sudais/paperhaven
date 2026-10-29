/**
 * Core domain types for Paperhaven.
 *
 * Every value shown in the product carries a provenance so users can tell
 * measured properties apart from operator-entered information, AI-generated
 * suggestions and calculated values.
 */

export type Provenance = 'measured' | 'operator' | 'ai' | 'calculated'

export const RECOVERED_GRADES = [
  'OCC (old corrugated containers)',
  'Mixed paper',
  'Sorted office paper',
  'Old newspapers',
  'Kraft sacks and wrapping',
  'Other / unclassified',
] as const

export type RecoveredGrade = (typeof RECOVERED_GRADES)[number]

export type InspectionStatus = 'inspected' | 'awaiting' | 'review' | 'not-inspected'

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  inspected: 'Inspected',
  awaiting: 'Awaiting measurement',
  review: 'Requires review',
  'not-inspected': 'Not inspected',
}

/** A measured property. `value: null` means not yet measured — never zero. */
export interface Measurement {
  value: number | null
  /** ISO date (YYYY-MM-DD) the sample was measured. */
  measuredAt: string | null
  /** Free-text description of the method, as entered by the operator. */
  method?: string
}

export interface DocumentPlaceholder {
  id: string
  name: string
  kind: 'inspection-report' | 'weighbridge-ticket' | 'supplier-declaration' | 'photo' | 'other'
  addedAt: string
}

export interface Batch {
  /** Batch ID, unique within the workspace. */
  id: string
  grade: RecoveredGrade
  supplier: string
  sourceLocation: string
  receivedDate: string
  /** Operator-entered stock available for planning, in tonnes. */
  availableTonnes: number
  /** Operator-entered purchase cost per tonne, in USD. */
  costPerTonne: number
  /** Measured moisture, % by mass of the as-received sample. */
  moisture: Measurement
  /** Measured non-paper components (prohibitive materials), % by mass. */
  nonPaper: Measurement
  inspectionStatus: InspectionStatus
  contaminationNotes: string
  inspectionNotes: string
  documents: DocumentPlaceholder[]
  /** True for the bundled sample batches so the UI can label them. */
  isDemo?: boolean
}

export type MeasuredProperty = 'moisture' | 'nonPaper'

export const MEASURED_PROPERTY_LABELS: Record<MeasuredProperty, string> = {
  moisture: 'Moisture',
  nonPaper: 'Non-paper components',
}

export interface BlendComponent {
  batchId: string
  /** Proportion of the blend by as-received mass, in percent (0–100). */
  proportionPct: number
}

export interface BlendScenario {
  id: string
  name: string
  /** Planned total blend quantity in tonnes. */
  targetTonnes: number
  components: BlendComponent[]
  notes: string
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

/** Parameters the specification checker can compare. */
export type SpecParameter = 'moisture' | 'nonPaper' | 'costPerTonne' | 'totalTonnes'

export interface SpecRange {
  parameter: SpecParameter
  enabled: boolean
  /** Inclusive lower bound, or null for no lower bound. */
  min: number | null
  /** Inclusive upper bound, or null for no upper bound. */
  max: number | null
}

export interface ProductionSpecification {
  id: string
  name: string
  description: string
  ranges: SpecRange[]
  updatedAt: string
}

export interface AiSuggestion {
  id: string
  kind: 'summary' | 'extraction' | 'completeness' | 'question'
  batchId?: string
  title: string
  body: string
  createdAt: string
}

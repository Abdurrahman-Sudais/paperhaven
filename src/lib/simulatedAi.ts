/**
 * Simulated AI assistance.
 *
 * No model is called. These deterministic, rule-based functions stand in for
 * an AI service so the interface can demonstrate how suggestions would be
 * presented. Their output is always a suggestion: nothing here writes to a
 * batch record. They never estimate physical properties (moisture, fibre
 * strength, composition) — they only reorganise text that people entered.
 */
import type { Batch } from '../types'
import { MEASURED_PROPERTY_LABELS } from '../types'
import { getBatchGaps } from './batches'

const THEMES: { theme: string; words: RegExp }[] = [
  { theme: 'Plastics and non-paper items', words: /plastic|film|tape|strapping|sleeve|staple|clip|twine|insert|label/i },
  { theme: 'Moisture-related observations', words: /damp|wet|rain|dry|moist|humid/i },
  { theme: 'Soiling', words: /food|soil|grease|oil/i },
  { theme: 'Bale condition', words: /bale|dust|yellow|well formed/i },
  { theme: 'Measurement and follow-up', words: /test|scheduled|sample|confirm|asked|recorded/i },
]

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export interface NoteSummary {
  themes: { theme: string; points: string[] }[]
  caveat: string
}

/** Groups sentences from inspection and contamination notes by theme. */
export function summariseInspectionNotes(batch: Batch): NoteSummary {
  const all = [...sentences(batch.inspectionNotes), ...sentences(batch.contaminationNotes)]
  const used = new Set<string>()
  const themes = THEMES.map(({ theme, words }) => {
    const points = all.filter((s) => words.test(s) && !used.has(s))
    points.forEach((p) => used.add(p))
    return { theme, points }
  }).filter((t) => t.points.length > 0)
  const rest = all.filter((s) => !used.has(s))
  if (rest.length) themes.push({ theme: 'Other notes', points: rest })
  return {
    themes,
    caveat:
      'Grouped from operator-entered notes only. Observations such as "damp" or "dry to the touch" are not measurements and are not used in any calculation.',
  }
}

export interface ExtractedField {
  field: string
  label: string
  value: string | null
  sourceLine: string | null
  /** Batch field this value could be reviewed against, if any. */
  target?: 'nonPaper' | 'moisture' | 'availableTonnes' | 'receivedDate'
  numeric?: number
}

const EXTRACTORS: { field: string; label: string; re: RegExp; target?: ExtractedField['target']; numeric?: boolean }[] =
  [
    { field: 'batchRef', label: 'Batch reference', re: /batch reference:\s*(.+)/i },
    { field: 'material', label: 'Material description', re: /material description:\s*(.+)/i },
    { field: 'received', label: 'Date received', re: /date received:\s*(.+)/i, target: 'receivedDate' },
    { field: 'sampled', label: 'Sampling date', re: /sampling date:\s*(.+)/i },
    { field: 'netWeight', label: 'Net weight', re: /net weight[^:]*:\s*([\d.]+)\s*t/i, target: 'availableTonnes', numeric: true },
    { field: 'nonPaper', label: 'Non-paper components', re: /non-paper components[^:]*:\s*([\d.]+)\s*%/i, target: 'nonPaper', numeric: true },
    { field: 'moisture', label: 'Moisture', re: /moisture[^:]*:\s*([\d.]+)\s*%/i, target: 'moisture', numeric: true },
  ]

/** Pulls labelled fields out of a plain-text inspection document. */
export function extractInspectionFields(text: string): ExtractedField[] {
  const lines = text.split('\n')
  return EXTRACTORS.map(({ field, label, re, target, numeric }) => {
    for (const line of lines) {
      const m = line.match(re)
      if (m) {
        const raw = m[1].trim()
        return { field, label, value: raw, sourceLine: line.trim(), target, numeric: numeric ? Number(raw) : undefined }
      }
    }
    const mention = lines.find((l) => l.toLowerCase().includes(label.toLowerCase()))
    return { field, label, value: null, sourceLine: mention?.trim() ?? null, target }
  })
}

export interface IncompleteRecord {
  batchId: string
  gaps: string[]
}

export function highlightIncompleteRecords(batches: Batch[]): IncompleteRecord[] {
  return batches
    .map((b) => ({ batchId: b.id, gaps: getBatchGaps(b).map((g) => g.label) }))
    .filter((r) => r.gaps.length > 0)
}

/** Questions a buyer might raise with the supplier or the inspection team. */
export function suggestBuyerQuestions(batch: Batch): string[] {
  const q: string[] = []
  for (const prop of ['moisture', 'nonPaper'] as const) {
    const m = batch[prop]
    const label = MEASURED_PROPERTY_LABELS[prop].toLowerCase()
    if (m.value === null) q.push(`When will a ${label} measurement be available, and which method will be used?`)
    else if (!m.method) q.push(`Which method and sample size were used for the recorded ${label} value?`)
  }
  const notes = `${batch.inspectionNotes} ${batch.contaminationNotes}`.toLowerCase()
  if (/rain|damp|wet/.test(notes))
    q.push('How was the material stored and transported, and were affected bales sampled separately?')
  if (/film|plastic/.test(notes)) q.push('Can the supplier describe how film plastics are removed before baling?')
  if (/food|soil/.test(notes)) q.push('What proportion of the load came from sources likely to include food-soiled material?')
  if (batch.inspectionStatus === 'review') q.push('Who is responsible for closing the open review, and by what date?')
  if (!batch.documents.some((d) => d.kind === 'inspection-report'))
    q.push('Can the inspection report be attached to this record so the measurements can be traced?')
  q.push(`Is the available quantity (${batch.availableTonnes} t) based on a weighbridge ticket or an estimate?`)
  q.push('How many bales were sampled relative to the total in this batch?')
  return q
}

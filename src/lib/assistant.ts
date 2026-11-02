/**
 * Simulated, record-grounded assistant for the demo workspace.
 * Answers only from current batches, saved scenarios and the production specification, and lists the records used.
 * Refuses to predict paper quality or machine performance, or to fill in missing measurements.
 * No model or external API is called.
 */
import type { Batch, BlendScenario, ProductionSpecification } from '../types'
import { getBatchGaps } from './batches'
import { calculateBlend, type CalcResult } from './calculations'
import { checkSpecification, summariseSpecCheck } from './specCheck'
import { fmtPct, fmtTonnes, fmtUsd } from './format'

export interface AssistantContext {
  batches: Batch[]
  scenarios: BlendScenario[]
  specification: ProductionSpecification
}

export interface AssistantAnswer {
  kind: 'answer' | 'refusal' | 'help'
  title: string
  lines: string[]
  sources: string[]
  links: { label: string; to: string }[]
}

export const EXAMPLE_QUESTIONS = ['Which batches are missing measurements?', 'Compare the saved scenarios', 'Tell me about DEMO-B101', 'Which scenarios meet the specification?', 'What will the sheet strength be?'] as const

const REFUSAL_RE = /\b(strength|tensile|burst|brightness|runnab\w*|break(s|age)?|machine (speed|performance)|predict\w*|forecast\w*|guess|estimate (the )?(moisture|non-paper|contamination)|assume)\b/i

const REFUSAL: AssistantAnswer = {
  kind: 'refusal',
  title: 'That needs mill testing, not a guess',
  lines: [
    'Paperhaven calculates weighted cost, moisture and non-paper content from measured batch values, and checks them against the ranges you configure. It does not predict sheet strength, brightness or machine performance, and it never fills in a missing measurement.',
    'I can show which batches are missing readings and how each saved scenario compares with your specification.',
  ],
  sources: [],
  links: [{ label: 'Open the Blend Planner', to: '/planner/blend' }],
}

const show = (r: CalcResult, d = 1) => (r.status === 'ok' ? (r.unit === 'USD/t' || r.unit === '$/t' ? fmtUsd(r.value) + '/t' : r.unit === '%' ? fmtPct(r.value, d) : `${r.value.toFixed(d)} ${r.unit}`) : `unavailable (${r.reason})`)

function batchSummary(b: Batch): AssistantAnswer {
  const gaps = getBatchGaps(b)
  return {
    kind: 'answer',
    title: `${b.id} · ${b.grade}`,
    lines: [
      `${b.supplier}, ${b.sourceLocation}. Received ${b.receivedDate}; ${fmtTonnes(b.availableTonnes)} available at ${fmtUsd(b.costPerTonne)}/t.`,
      `Moisture: ${b.moisture.value === null ? 'not measured' : `${fmtPct(b.moisture.value)} (measured ${b.moisture.measuredAt ?? 'date not recorded'})`}. Non-paper: ${b.nonPaper.value === null ? 'not measured' : fmtPct(b.nonPaper.value)}.`,
      `Inspection: ${b.inspectionStatus.replace('-', ' ')}.${b.contaminationNotes ? ` Notes: ${b.contaminationNotes}` : ''}`,
      gaps.length ? `Still missing: ${gaps.map((g) => g.label.toLowerCase()).join(', ')}.` : 'No gaps in the recorded fields.',
    ],
    sources: [b.id],
    links: [{ label: 'Open incoming batches', to: '/planner/batches' }],
  }
}

function missing(c: AssistantContext): AssistantAnswer {
  const rows = c.batches.filter((b) => b.moisture.value === null || b.nonPaper.value === null)
  return {
    kind: 'answer',
    title: rows.length ? `${rows.length} batch${rows.length === 1 ? ' is' : 'es are'} missing measurements` : 'Every batch has moisture and non-paper readings',
    lines: [
      ...rows.map((b) => `${b.id} (${b.grade}, ${b.supplier}): ${[b.moisture.value === null ? 'moisture' : '', b.nonPaper.value === null ? 'non-paper content' : ''].filter(Boolean).join(' and ')} not measured.`),
      ...(rows.length ? ['Any blend that uses these batches shows those weighted values as unavailable rather than assuming zero.'] : []),
    ],
    sources: rows.map((b) => b.id),
    links: [{ label: 'Open incoming batches', to: '/planner/batches' }],
  }
}

function scenarios(c: AssistantContext, onlyPassing = false): AssistantAnswer {
  const rows = c.scenarios.map((s) => {
    const calc = calculateBlend(s, c.batches)
    const summary = summariseSpecCheck(checkSpecification(c.specification, calc))
    return { s, calc, summary }
  })
  const list = onlyPassing ? rows.filter((r) => r.summary === 'all-within') : rows
  const label = { 'all-within': 'within every configured range', 'has-outside': 'outside at least one range', incomplete: 'not fully checkable — a value is unavailable', 'none-configured': 'no ranges configured' } as const
  return {
    kind: 'answer',
    title: onlyPassing ? `${list.length} of ${rows.length} saved scenario${rows.length === 1 ? '' : 's'} meet the specification` : `${rows.length} saved scenario${rows.length === 1 ? '' : 's'}`,
    lines: list.map((r) => `${r.s.name}: ${show(r.calc.costPerTonne, 0)} · moisture ${show(r.calc.moisture)} · non-paper ${show(r.calc.nonPaper)} — ${label[r.summary]}.`),
    sources: list.map((r) => r.s.name),
    links: [{ label: 'Open reports', to: '/planner/reports' }],
  }
}

const HELP: AssistantAnswer = {
  kind: 'help',
  title: 'What I can answer',
  lines: ['Ask about a batch (for example “DEMO-B101”), which batches are missing measurements, how the saved scenarios compare, or which meet the specification.', 'I answer from the records in this workspace and list the ones I used.'],
  sources: [],
  links: [],
}

export function answer(question: string, c: AssistantContext): AssistantAnswer {
  const q = question.trim()
  if (!q) return HELP
  if (REFUSAL_RE.test(q)) return REFUSAL
  const id = q.toUpperCase().match(/\b[A-Z]+-[A-Z]?\d{2,}\b/)?.[0]
  if (id) {
    const b = c.batches.find((x) => x.id.toUpperCase() === id)
    return b ? batchSummary(b) : { kind: 'answer', title: `No batch called ${id}`, lines: ['That ID is not in this workspace.'], sources: [], links: [{ label: 'Open incoming batches', to: '/planner/batches' }] }
  }
  if (/\b(missing|not measured|gap|incomplete|unmeasured)/i.test(q)) return missing(c)
  if (/\b(meet|pass|within|spec)/i.test(q)) return scenarios(c, true)
  if (/\b(scenario|compare|blend|cost)/i.test(q)) return scenarios(c)
  return HELP
}

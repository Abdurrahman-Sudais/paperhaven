/**
 * Deterministic blend calculations.
 *
 * These functions are pure: they take batches and a scenario and return
 * results with a full trace of the inputs used. They never substitute zero
 * (or any other default) for a missing measurement — a result that depends
 * on a missing value is returned as `unavailable` with the reason and the
 * inputs that need to be supplied.
 */
import type { Batch, BlendScenario, MeasuredProperty, Provenance } from '../types'

/** Proportions must total 100% within this tolerance (percentage points). */
export const PROPORTION_TOLERANCE = 0.01

export interface TraceInput {
  label: string
  batchId?: string
  value: number
  unit: string
  provenance: Provenance
  /** Weight applied to this input in a weighted average (percent of blend). */
  weightPct?: number
}

export interface MissingInput {
  batchId?: string
  field: string
  message: string
}

export type CalcResult =
  | {
      status: 'ok'
      value: number
      unit: string
      formula: string
      inputs: TraceInput[]
    }
  | {
      status: 'unavailable'
      unit: string
      formula: string
      reason: string
      missing: MissingInput[]
    }

export interface BlendIssue {
  severity: 'error' | 'warning'
  code:
    | 'no-components'
    | 'unknown-batch'
    | 'duplicate-batch'
    | 'invalid-proportion'
    | 'proportion-total'
    | 'invalid-target'
    | 'exceeds-stock'
    | 'zero-proportion'
    | 'missing-measurement'
    | 'invalid-measurement'
  message: string
  batchId?: string
}

export interface ComponentLine {
  batchId: string
  batch: Batch | undefined
  proportionPct: number
  /** Tonnes drawn from this batch: target × proportion / 100. Null when the line is invalid. */
  tonnes: number | null
  /** Material cost for this line, in USD. Null when the line is invalid. */
  cost: number | null
  exceedsStock: boolean
}

export interface BlendCalculation {
  lines: ComponentLine[]
  proportionTotal: number
  proportionsValid: boolean
  totalTonnes: CalcResult
  totalCost: CalcResult
  costPerTonne: CalcResult
  moisture: CalcResult
  nonPaper: CalcResult
  issues: BlendIssue[]
  /** True when no error-severity issues were found. */
  isPlannable: boolean
}

const isFiniteNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

/** Sum of proportions in percent. Non-finite entries are ignored here and reported as issues elsewhere. */
export function sumProportions(scenario: Pick<BlendScenario, 'components'>): number {
  return scenario.components.reduce((s, c) => (isFiniteNumber(c.proportionPct) ? s + c.proportionPct : s), 0)
}

export function proportionsTotalIsValid(total: number): boolean {
  return Math.abs(total - 100) <= PROPORTION_TOLERANCE
}

export interface WeightedItem {
  label: string
  batchId?: string
  weightPct: number
  value: number | null
}

/**
 * Weighted arithmetic mean: Σ(wᵢ·vᵢ) / Σ(wᵢ).
 *
 * Items with a weight of zero do not contribute and are not required to have
 * a value. If any item with a positive weight has a missing or non-finite
 * value the result is `unavailable` — it is never computed from partial data.
 */
export function weightedAverage(
  items: WeightedItem[],
  opts: { unit: string; field: string; provenance: Provenance; validRange?: [number, number] },
): CalcResult {
  const formula = `Σ(proportionᵢ × ${opts.field}ᵢ) ÷ Σ(proportionᵢ)`
  const contributing = items.filter((i) => isFiniteNumber(i.weightPct) && i.weightPct > 0)
  if (contributing.length === 0) {
    return {
      status: 'unavailable',
      unit: opts.unit,
      formula,
      reason: 'No batch has a positive proportion, so there is nothing to average.',
      missing: [],
    }
  }
  const missing: MissingInput[] = []
  for (const item of contributing) {
    if (item.value === null || !isFiniteNumber(item.value)) {
      missing.push({
        batchId: item.batchId,
        field: opts.field,
        message: `${item.label} has no recorded ${opts.field} measurement.`,
      })
    } else if (opts.validRange && (item.value < opts.validRange[0] || item.value > opts.validRange[1])) {
      missing.push({
        batchId: item.batchId,
        field: opts.field,
        message: `${item.label} has an out-of-range ${opts.field} value (${item.value}${opts.unit}).`,
      })
    }
  }
  if (missing.length > 0) {
    return {
      status: 'unavailable',
      unit: opts.unit,
      formula,
      reason: `The weighted ${opts.field} cannot be calculated reliably until ${
        missing.length === 1 ? 'the missing value is' : `${missing.length} missing values are`
      } supplied. Substituting zero or an estimate would understate or misstate the blend.`,
      missing,
    }
  }
  const totalWeight = contributing.reduce((s, i) => s + i.weightPct, 0)
  const weighted = contributing.reduce((s, i) => s + i.weightPct * (i.value as number), 0)
  return {
    status: 'ok',
    value: weighted / totalWeight,
    unit: opts.unit,
    formula,
    inputs: contributing.map((i) => ({
      label: i.label,
      batchId: i.batchId,
      value: i.value as number,
      unit: opts.unit,
      provenance: opts.provenance,
      weightPct: i.weightPct,
    })),
  }
}

function unavailable(unit: string, formula: string, reason: string, missing: MissingInput[] = []): CalcResult {
  return { status: 'unavailable', unit, formula, reason, missing }
}

/**
 * Calculate a blend scenario against the current batch records.
 *
 * Quantities: tonnesᵢ = target × proportionᵢ / 100.
 * Cost:       total = Σ(tonnesᵢ × costPerTonneᵢ); per tonne = total ÷ Σ tonnesᵢ.
 * Measured:   weighted by proportion, only when every contributing batch has a valid measurement.
 */
export function calculateBlend(scenario: BlendScenario, batches: Batch[]): BlendCalculation {
  const issues: BlendIssue[] = []
  const byId = new Map(batches.map((b) => [b.id, b]))
  const proportionTotal = sumProportions(scenario)
  const targetValid = isFiniteNumber(scenario.targetTonnes) && scenario.targetTonnes > 0

  if (scenario.components.length === 0) {
    issues.push({ severity: 'error', code: 'no-components', message: 'Select at least one batch to build a blend.' })
  }
  if (!targetValid) {
    issues.push({
      severity: 'error',
      code: 'invalid-target',
      message: 'Enter a planned blend quantity greater than 0 tonnes.',
    })
  }

  const seen = new Set<string>()
  let proportionsWellFormed = true
  for (const c of scenario.components) {
    if (seen.has(c.batchId)) {
      issues.push({
        severity: 'error',
        code: 'duplicate-batch',
        batchId: c.batchId,
        message: `${c.batchId} appears more than once in this blend.`,
      })
    }
    seen.add(c.batchId)
    if (!byId.has(c.batchId)) {
      issues.push({
        severity: 'error',
        code: 'unknown-batch',
        batchId: c.batchId,
        message: `${c.batchId} is not in the batch inventory. It may have been removed.`,
      })
    }
    if (!isFiniteNumber(c.proportionPct) || c.proportionPct < 0 || c.proportionPct > 100) {
      proportionsWellFormed = false
      issues.push({
        severity: 'error',
        code: 'invalid-proportion',
        batchId: c.batchId,
        message: `${c.batchId} needs a proportion between 0% and 100%.`,
      })
    } else if (c.proportionPct === 0) {
      issues.push({
        severity: 'warning',
        code: 'zero-proportion',
        batchId: c.batchId,
        message: `${c.batchId} is selected at 0% and does not contribute to the blend.`,
      })
    }
  }

  const proportionsValid =
    proportionsWellFormed && scenario.components.length > 0 && proportionsTotalIsValid(proportionTotal)
  if (scenario.components.length > 0 && proportionsWellFormed && !proportionsValid) {
    issues.push({
      severity: 'error',
      code: 'proportion-total',
      message: `Proportions total ${round(proportionTotal, 2)}%. Adjust them to total exactly 100%.`,
    })
  }

  const structuralError = issues.some((i) =>
    ['no-components', 'unknown-batch', 'duplicate-batch', 'invalid-proportion', 'proportion-total', 'invalid-target'].includes(
      i.code,
    ),
  )

  const lines: ComponentLine[] = scenario.components.map((c) => {
    const batch = byId.get(c.batchId)
    const lineValid = !!batch && targetValid && isFiniteNumber(c.proportionPct) && c.proportionPct >= 0
    const tonnes = lineValid ? (scenario.targetTonnes * c.proportionPct) / 100 : null
    const cost = tonnes !== null && batch ? tonnes * batch.costPerTonne : null
    const exceedsStock = tonnes !== null && !!batch && tonnes > batch.availableTonnes + 1e-9
    if (exceedsStock && batch && tonnes !== null) {
      issues.push({
        severity: 'error',
        code: 'exceeds-stock',
        batchId: c.batchId,
        message: `${c.batchId} would need ${round(tonnes, 2)} t but only ${batch.availableTonnes} t is available.`,
      })
    }
    return { batchId: c.batchId, batch, proportionPct: c.proportionPct, tonnes, cost, exceedsStock }
  })

  const blockedReason = structuralError
    ? issues.find((i) => i.severity === 'error')?.message ?? 'The blend configuration is incomplete.'
    : ''

  // Quantity and cost.
  let totalTonnes: CalcResult
  let totalCost: CalcResult
  let costPerTonne: CalcResult
  if (structuralError) {
    totalTonnes = unavailable('t', 'Σ tonnesᵢ', blockedReason)
    totalCost = unavailable('USD', 'Σ(tonnesᵢ × cost per tonneᵢ)', blockedReason)
    costPerTonne = unavailable('USD/t', 'Total material cost ÷ total blend quantity', blockedReason)
  } else {
    const t = lines.reduce((s, l) => s + (l.tonnes ?? 0), 0)
    const cost = lines.reduce((s, l) => s + (l.cost ?? 0), 0)
    totalTonnes = {
      status: 'ok',
      value: t,
      unit: 't',
      formula: 'Σ tonnesᵢ, where tonnesᵢ = planned quantity × proportionᵢ ÷ 100',
      inputs: lines.map((l) => ({
        label: `${l.batchId} quantity`,
        batchId: l.batchId,
        value: l.tonnes ?? 0,
        unit: 't',
        provenance: 'calculated' as const,
        weightPct: l.proportionPct,
      })),
    }
    totalCost = {
      status: 'ok',
      value: cost,
      unit: 'USD',
      formula: 'Σ(tonnesᵢ × cost per tonneᵢ)',
      inputs: lines.map((l) => ({
        label: `${l.batchId} cost per tonne`,
        batchId: l.batchId,
        value: l.batch?.costPerTonne ?? 0,
        unit: 'USD/t',
        provenance: 'operator' as const,
        weightPct: l.proportionPct,
      })),
    }
    costPerTonne =
      t > 0
        ? {
            status: 'ok',
            value: cost / t,
            unit: 'USD/t',
            formula: 'Total material cost ÷ total blend quantity',
            inputs: [
              { label: 'Total material cost', value: cost, unit: 'USD', provenance: 'calculated' },
              { label: 'Total blend quantity', value: t, unit: 't', provenance: 'calculated' },
            ],
          }
        : unavailable('USD/t', 'Total material cost ÷ total blend quantity', 'Total blend quantity is zero.')
  }

  // Measured properties.
  const measuredAverage = (prop: MeasuredProperty, field: string): CalcResult => {
    const formula = `Σ(proportionᵢ × ${field}ᵢ) ÷ Σ(proportionᵢ)`
    if (structuralError) return unavailable('%', formula, blockedReason)
    return weightedAverage(
      lines.map((l) => ({
        label: l.batchId,
        batchId: l.batchId,
        weightPct: l.proportionPct,
        value: l.batch ? l.batch[prop].value : null,
      })),
      { unit: '%', field, provenance: 'measured', validRange: [0, 100] },
    )
  }
  const moisture = measuredAverage('moisture', 'moisture')
  const nonPaper = measuredAverage('nonPaper', 'non-paper content')

  for (const [result, label] of [
    [moisture, 'Moisture'],
    [nonPaper, 'Non-paper components'],
  ] as const) {
    if (result.status === 'unavailable') {
      for (const m of result.missing) {
        issues.push({
          severity: 'warning',
          code: m.message.includes('out-of-range') ? 'invalid-measurement' : 'missing-measurement',
          batchId: m.batchId,
          message: `${label}: ${m.message}`,
        })
      }
    }
  }

  return {
    lines,
    proportionTotal,
    proportionsValid,
    totalTonnes,
    totalCost,
    costPerTonne,
    moisture,
    nonPaper,
    issues,
    isPlannable: !issues.some((i) => i.severity === 'error'),
  }
}

/** Split 100% evenly across n components, putting any rounding remainder on the first. */
export function evenProportions(n: number, decimals = 1): number[] {
  if (n <= 0) return []
  const factor = 10 ** decimals
  const base = Math.floor((100 / n) * factor) / factor
  const out = Array.from({ length: n }, () => base)
  out[0] = round(100 - base * (n - 1), decimals)
  return out
}

export function round(n: number, decimals = 2): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

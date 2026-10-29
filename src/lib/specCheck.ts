/**
 * Specification checker.
 *
 * Compares calculated blend values against thresholds the user has explicitly
 * configured. It does not contain or imply any industry acceptance standard:
 * a parameter with no enabled bound is reported as "not configured", and a
 * parameter whose value cannot be calculated is reported as "unavailable".
 */
import type { ProductionSpecification, SpecParameter, SpecRange } from '../types'
import type { BlendCalculation, CalcResult } from './calculations'

export const SPEC_PARAMETERS: Record<
  SpecParameter,
  { label: string; unit: string; hint: string; bounds: [number, number] }
> = {
  moisture: {
    label: 'Blend moisture',
    unit: '%',
    hint: 'Weighted average of measured moisture, by proportion.',
    bounds: [0, 100],
  },
  nonPaper: {
    label: 'Blend non-paper components',
    unit: '%',
    hint: 'Weighted average of measured non-paper content, by proportion.',
    bounds: [0, 100],
  },
  costPerTonne: {
    label: 'Weighted cost per tonne',
    unit: 'USD/t',
    hint: 'Total material cost divided by total blend quantity.',
    bounds: [0, 100000],
  },
  totalTonnes: {
    label: 'Total blend quantity',
    unit: 't',
    hint: 'Sum of tonnes drawn from each selected batch.',
    bounds: [0, 1000000],
  },
}

export type SpecCheckStatus = 'within' | 'outside' | 'unavailable' | 'not-configured'

export interface SpecCheckResult {
  parameter: SpecParameter
  label: string
  unit: string
  status: SpecCheckStatus
  value: number | null
  min: number | null
  max: number | null
  message: string
}

export function isRangeConfigured(r: SpecRange): boolean {
  return r.enabled && (r.min !== null || r.max !== null)
}

function resultFor(calc: BlendCalculation, p: SpecParameter): CalcResult {
  switch (p) {
    case 'moisture':
      return calc.moisture
    case 'nonPaper':
      return calc.nonPaper
    case 'costPerTonne':
      return calc.costPerTonne
    case 'totalTonnes':
      return calc.totalTonnes
  }
}

export function describeRange(min: number | null, max: number | null, unit: string): string {
  if (min !== null && max !== null) return `${min}–${max} ${unit}`
  if (min !== null) return `≥ ${min} ${unit}`
  if (max !== null) return `≤ ${max} ${unit}`
  return 'No bounds set'
}

export function checkSpecification(spec: ProductionSpecification, calc: BlendCalculation): SpecCheckResult[] {
  return spec.ranges.map((r) => {
    const meta = SPEC_PARAMETERS[r.parameter]
    const base = { parameter: r.parameter, label: meta.label, unit: meta.unit, min: r.min, max: r.max }
    if (!isRangeConfigured(r)) {
      return { ...base, status: 'not-configured', value: null, message: 'No target range configured — not checked.' }
    }
    const res = resultFor(calc, r.parameter)
    if (res.status !== 'ok') {
      return { ...base, status: 'unavailable', value: null, message: `Not checked: ${res.reason}` }
    }
    const v = res.value
    const belowMin = r.min !== null && v < r.min
    const aboveMax = r.max !== null && v > r.max
    if (belowMin || aboveMax) {
      return {
        ...base,
        status: 'outside',
        value: v,
        message: `${v.toFixed(2)} ${meta.unit} is ${belowMin ? 'below' : 'above'} the configured range (${describeRange(
          r.min,
          r.max,
          meta.unit,
        )}).`,
      }
    }
    return {
      ...base,
      status: 'within',
      value: v,
      message: `Within the configured range (${describeRange(r.min, r.max, meta.unit)}).`,
    }
  })
}

export type SpecSummary = 'all-within' | 'has-outside' | 'incomplete' | 'none-configured'

export function summariseSpecCheck(results: SpecCheckResult[]): SpecSummary {
  const configured = results.filter((r) => r.status !== 'not-configured')
  if (configured.length === 0) return 'none-configured'
  if (configured.some((r) => r.status === 'outside')) return 'has-outside'
  if (configured.some((r) => r.status === 'unavailable')) return 'incomplete'
  return 'all-within'
}

/** Validate a single range as edited by the user. Returns an error message or null. */
export function validateSpecRange(r: SpecRange): string | null {
  const [lo, hi] = SPEC_PARAMETERS[r.parameter].bounds
  for (const [name, v] of [
    ['Minimum', r.min],
    ['Maximum', r.max],
  ] as const) {
    if (v === null) continue
    if (!Number.isFinite(v)) return `${name} must be a number.`
    if (v < lo || v > hi) return `${name} must be between ${lo} and ${hi}.`
  }
  if (r.min !== null && r.max !== null && r.min > r.max) return 'Minimum cannot be greater than maximum.'
  if (r.enabled && r.min === null && r.max === null) return 'Set a minimum, a maximum, or both — or disable this check.'
  return null
}

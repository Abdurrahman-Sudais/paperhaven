import { describe, expect, it } from 'vitest'
import { calculateBlend, evenProportions, weightedAverage } from './calculations'
import { checkSpecification, summariseSpecCheck, validateSpecRange } from './specCheck'
import { filterBatches, sortBatches, validateBatchDraft, emptyDraft, getBatchGaps } from './batches'
import { extractInspectionFields } from './simulatedAi'
import { DEMO_BATCHES, DEMO_INSPECTION_DOCUMENT, DEMO_SCENARIOS, DEMO_SPECIFICATION } from '../data/demo'
import type { BlendScenario } from '../types'

const scenario = (components: BlendScenario['components'], targetTonnes = 100): BlendScenario => ({
  id: 't',
  name: 't',
  targetTonnes,
  components,
  notes: '',
  createdAt: '',
  updatedAt: '',
})

describe('calculateBlend — valid data', () => {
  const calc = calculateBlend(DEMO_SCENARIOS[0], DEMO_BATCHES) // 60/25/15 of B101/B102/B104, 100 t

  it('derives tonnes per batch from the proportions', () => {
    expect(calc.lines.map((l) => l.tonnes)).toEqual([60, 25, 15])
  })

  it('totals quantity and cost', () => {
    expect(calc.totalTonnes).toMatchObject({ status: 'ok', value: 100 })
    // 60×95 + 25×62 + 15×71 = 5700 + 1550 + 1065 = 8315
    expect(calc.totalCost).toMatchObject({ status: 'ok', value: 8315 })
    expect(calc.costPerTonne.status).toBe('ok')
    if (calc.costPerTonne.status === 'ok') expect(calc.costPerTonne.value).toBeCloseTo(83.15, 10)
  })

  it('calculates weighted moisture when every batch is measured', () => {
    // (60×9.4 + 25×11.2 + 15×8.1) / 100 = (564 + 280 + 121.5) / 100 = 9.655
    expect(calc.moisture.status).toBe('ok')
    if (calc.moisture.status === 'ok') {
      expect(calc.moisture.value).toBeCloseTo(9.655, 10)
      expect(calc.moisture.inputs).toHaveLength(3)
    }
  })

  it('has no errors', () => {
    expect(calc.isPlannable).toBe(true)
    expect(calc.issues.filter((i) => i.severity === 'error')).toEqual([])
  })
})

describe('calculateBlend — missing measurement', () => {
  const calc = calculateBlend(DEMO_SCENARIOS[1], DEMO_BATCHES) // includes DEMO-B103 without moisture

  it('does not substitute zero for missing moisture', () => {
    expect(calc.moisture.status).toBe('unavailable')
    if (calc.moisture.status === 'unavailable') {
      expect(calc.moisture.missing).toEqual([expect.objectContaining({ batchId: 'DEMO-B103', field: 'moisture' })])
    }
  })

  it('still calculates cost and quantity, and other measured properties', () => {
    expect(calc.totalTonnes).toMatchObject({ status: 'ok', value: 80 })
    // 40×95 + 24×148 + 16×62 = 3800 + 3552 + 992 = 8344
    expect(calc.totalCost).toMatchObject({ status: 'ok', value: 8344 })
    expect(calc.nonPaper.status).toBe('ok')
  })

  it('reports the gap as a warning issue', () => {
    expect(calc.issues).toContainEqual(expect.objectContaining({ code: 'missing-measurement', batchId: 'DEMO-B103' }))
  })
})

describe('calculateBlend — invalid configurations', () => {
  it('refuses to calculate when proportions do not total 100%', () => {
    const c = calculateBlend(
      scenario([
        { batchId: 'DEMO-B101', proportionPct: 50 },
        { batchId: 'DEMO-B102', proportionPct: 40 },
      ]),
      DEMO_BATCHES,
    )
    expect(c.proportionsValid).toBe(false)
    expect(c.totalCost.status).toBe('unavailable')
    expect(c.moisture.status).toBe('unavailable')
    expect(c.issues).toContainEqual(expect.objectContaining({ code: 'proportion-total' }))
  })

  it('flags requirements beyond available stock', () => {
    const c = calculateBlend(scenario([{ batchId: 'DEMO-B103', proportionPct: 100 }], 50), DEMO_BATCHES)
    expect(c.lines[0].exceedsStock).toBe(true)
    expect(c.isPlannable).toBe(false)
  })

  it('handles empty, unknown and zero-target scenarios', () => {
    expect(calculateBlend(scenario([]), DEMO_BATCHES).totalTonnes.status).toBe('unavailable')
    expect(
      calculateBlend(scenario([{ batchId: 'NOPE', proportionPct: 100 }]), DEMO_BATCHES).issues,
    ).toContainEqual(expect.objectContaining({ code: 'unknown-batch' }))
    expect(
      calculateBlend(scenario([{ batchId: 'DEMO-B101', proportionPct: 100 }], 0), DEMO_BATCHES).totalCost.status,
    ).toBe('unavailable')
  })

  it('ignores a 0% batch with a missing measurement in the weighted average', () => {
    const c = calculateBlend(
      scenario([
        { batchId: 'DEMO-B101', proportionPct: 100 },
        { batchId: 'DEMO-B103', proportionPct: 0 },
      ]),
      DEMO_BATCHES,
    )
    expect(c.moisture).toMatchObject({ status: 'ok', value: 9.4 })
  })
})

describe('weightedAverage', () => {
  it('weights by proportion', () => {
    const r = weightedAverage(
      [
        { label: 'a', weightPct: 75, value: 10 },
        { label: 'b', weightPct: 25, value: 20 },
      ],
      { unit: '%', field: 'x', provenance: 'measured' },
    )
    expect(r).toMatchObject({ status: 'ok', value: 12.5 })
  })
  it('is unavailable when a value is missing', () => {
    const r = weightedAverage(
      [
        { label: 'a', weightPct: 50, value: 10 },
        { label: 'b', weightPct: 50, value: null },
      ],
      { unit: '%', field: 'x', provenance: 'measured' },
    )
    expect(r.status).toBe('unavailable')
  })
})

describe('evenProportions', () => {
  it('always totals 100', () => {
    for (const n of [1, 2, 3, 6, 7]) expect(evenProportions(n).reduce((a, b) => a + b, 0)).toBeCloseTo(100, 6)
  })
})

describe('specification checker', () => {
  it('only checks configured ranges and reports unavailable values', () => {
    const results = checkSpecification(DEMO_SPECIFICATION, calculateBlend(DEMO_SCENARIOS[1], DEMO_BATCHES))
    const byParam = Object.fromEntries(results.map((r) => [r.parameter, r.status]))
    expect(byParam.moisture).toBe('unavailable')
    expect(byParam.totalTonnes).toBe('not-configured')
    expect(byParam.costPerTonne).toBe('outside') // 104.30 > 100
    expect(summariseSpecCheck(results)).toBe('has-outside')
  })

  it('reports within / outside against explicit bounds', () => {
    const results = checkSpecification(DEMO_SPECIFICATION, calculateBlend(DEMO_SCENARIOS[0], DEMO_BATCHES))
    const byParam = Object.fromEntries(results.map((r) => [r.parameter, r.status]))
    expect(byParam.moisture).toBe('within') // 9.655 ≤ 10
    expect(byParam.costPerTonne).toBe('within') // 83.15 ≤ 100
  })

  it('validates ranges', () => {
    expect(validateSpecRange({ parameter: 'moisture', enabled: true, min: 12, max: 10 })).toMatch(/greater/)
    expect(validateSpecRange({ parameter: 'moisture', enabled: true, min: null, max: null })).toMatch(/disable/)
    expect(validateSpecRange({ parameter: 'moisture', enabled: true, min: 0, max: 101 })).toMatch(/between/)
    expect(validateSpecRange({ parameter: 'moisture', enabled: false, min: null, max: null })).toBeNull()
  })
})

describe('batch helpers', () => {
  it('sorts missing moisture last in both directions', () => {
    expect(sortBatches(DEMO_BATCHES, 'moisture', 'asc').at(-1)?.id).toBe('DEMO-B103')
    expect(sortBatches(DEMO_BATCHES, 'moisture', 'desc').at(-1)?.id).toBe('DEMO-B103')
  })
  it('filters by measurement completeness', () => {
    const r = filterBatches(DEMO_BATCHES, { search: '', grade: 'all', supplier: 'all', completeness: 'missing-measurements' })
    expect(r.map((b) => b.id)).toEqual(['DEMO-B103'])
  })
  it('identifies record gaps', () => {
    const gaps = getBatchGaps(DEMO_BATCHES[2]).map((g) => g.field)
    expect(gaps).toContain('moisture')
    expect(gaps).toContain('documents')
  })
  it('validates a draft', () => {
    const errs = validateBatchDraft({ ...emptyDraft(), id: 'DEMO-B101', moistureValue: '140' }, ['DEMO-B101'])
    expect(errs.id).toBeDefined()
    expect(errs.grade).toBeDefined()
    expect(errs.moistureValue).toBeDefined()
    expect(errs.moistureDate).toBeDefined()
  })
})

describe('simulated extraction', () => {
  it('extracts present fields and leaves absent ones null', () => {
    const fields = extractInspectionFields(DEMO_INSPECTION_DOCUMENT.text)
    const get = (f: string) => fields.find((x) => x.field === f)
    expect(get('nonPaper')?.numeric).toBe(0.9)
    expect(get('netWeight')?.numeric).toBe(45.2)
    expect(get('moisture')?.value).toBeNull()
    expect(get('moisture')?.sourceLine).toMatch(/scheduled/)
  })
})

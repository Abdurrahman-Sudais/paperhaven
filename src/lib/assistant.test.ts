import { describe, expect, it } from 'vitest'
import { answer, EXAMPLE_QUESTIONS } from './assistant'
import { ACTIONS, DEMO_USERS, can } from './access'
import { DEMO_BATCHES, DEMO_SCENARIOS, DEMO_SPECIFICATION } from '../data/demo'

describe('grounded assistant', () => {
  const c = { batches: DEMO_BATCHES, scenarios: DEMO_SCENARIOS, specification: DEMO_SPECIFICATION }
  it('answers every example question', () => {
    for (const q of EXAMPLE_QUESTIONS) expect(answer(q, c).lines.length).toBeGreaterThan(0)
  })
  it('refuses quality predictions and guessed measurements', () => {
    for (const q of ['What will the sheet strength be?', 'Predict the brightness of this blend', 'Estimate the moisture of DEMO-B103']) expect(answer(q, c).kind).toBe('refusal')
  })
  it('summarises a batch and cites it', () => {
    expect(answer('Tell me about DEMO-B101', c).sources).toEqual(['DEMO-B101'])
  })
  it('falls back to help', () => {
    expect(answer('What is the weather?', c).kind).toBe('help')
  })
})

describe('demo roles', () => {
  it('gives the quality manager everything and the viewer nothing', () => {
    for (const a of ACTIONS) {
      expect(can('manager', a)).toBe(true)
      expect(can('viewer', a)).toBe(false)
    }
  })
  it('keeps the specification and audit log with the quality manager', () => {
    for (const r of ['planner', 'grader'] as const) {
      expect(can(r, 'spec')).toBe(false)
      expect(can(r, 'audit')).toBe(false)
    }
    expect(can('planner', 'scenarios')).toBe(true)
    expect(can('grader', 'batches')).toBe(true)
  })
  it('has one demo user per role', () => {
    expect(new Set(DEMO_USERS.map((u) => u.role)).size).toBe(4)
  })
})

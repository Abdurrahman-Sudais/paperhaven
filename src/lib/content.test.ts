import { describe, expect, it } from 'vitest'
import { PROBLEM_STATS } from '../pages/Home'
import { FAQS, ROADMAP } from '../pages/HomeSections'
import { FOUNDERS } from '../config/site'

describe('home content', () => {
  it('links every published statistic to its source', () => {
    for (const s of PROBLEM_STATS) {
      expect(s.url).toMatch(/^https:\/\//)
      expect(s.source.length).toBeGreaterThan(5)
    }
  })
  it('credits both founders with their roles', () => {
    expect(FOUNDERS.map((f) => `${f.name} · ${f.role}`)).toEqual(['Ifeoma Ezeani · Founder/CEO', 'Yusuf Abdulhamid · Co-founder/CTO'])
  })
  it('never promises quality predictions', () => {
    expect(FAQS[0]?.[1]).toMatch(/^No\./)
    expect(JSON.stringify(ROADMAP)).not.toMatch(/predict/i)
  })
})

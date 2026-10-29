/**
 * Demonstration data. All batches, suppliers, values and documents below are
 * fictional and exist only to illustrate the product.
 */
import type { Batch, BlendScenario, ProductionSpecification } from '../types'

export const DEMO_BATCHES: Batch[] = [
  {
    id: 'DEMO-B101',
    grade: 'OCC (old corrugated containers)',
    supplier: 'Northgate Fibre Recovery (demo)',
    sourceLocation: 'Yard 2, Bay C',
    receivedDate: '2026-10-12',
    availableTonnes: 120,
    costPerTonne: 95,
    moisture: { value: 9.4, measuredAt: '2026-10-14', method: 'Oven-dry sample, 5 bales (demo)' },
    nonPaper: { value: 1.8, measuredAt: '2026-10-14', method: 'Hand-sort of 25 kg sample (demo)' },
    inspectionStatus: 'inspected',
    contaminationNotes: 'Plastic strapping and packing tape observed on bale faces. No wet bales found.',
    inspectionNotes:
      'Bales well formed and consistent in size. Light surface dust. Two bales showed tape residue on outer layers. Sampled bales were dry to the touch on opening; moisture recorded from oven-dry test.',
    documents: [
      { id: 'doc-101-a', name: 'DEMO-B101 inspection report.pdf', kind: 'inspection-report', addedAt: '2026-10-14' },
      { id: 'doc-101-b', name: 'Weighbridge ticket 44871.pdf', kind: 'weighbridge-ticket', addedAt: '2026-10-12' },
    ],
    isDemo: true,
  },
  {
    id: 'DEMO-B102',
    grade: 'Mixed paper',
    supplier: 'Riverside Materials Co. (demo)',
    sourceLocation: 'Yard 1, Bay A',
    receivedDate: '2026-10-08',
    availableTonnes: 80,
    costPerTonne: 62,
    moisture: { value: 11.2, measuredAt: '2026-10-10', method: 'Oven-dry sample, 4 bales (demo)' },
    nonPaper: { value: 3.6, measuredAt: '2026-10-10', method: 'Hand-sort of 25 kg sample (demo)' },
    inspectionStatus: 'review',
    contaminationNotes: 'Film plastic and some food-soiled board in sampled bales.',
    inspectionNotes:
      'Mixed composition with visible glossy magazine stock. Film plastic found in three of four opened bales. One bale had damp outer layers after rain exposure during transport. Supplier asked to confirm storage conditions.',
    documents: [
      { id: 'doc-102-a', name: 'DEMO-B102 inspection report.pdf', kind: 'inspection-report', addedAt: '2026-10-10' },
    ],
    isDemo: true,
  },
  {
    id: 'DEMO-B103',
    grade: 'Sorted office paper',
    supplier: 'Calder Office Recycling (demo)',
    sourceLocation: 'Warehouse 3, Rack 4',
    receivedDate: '2026-10-19',
    availableTonnes: 45,
    costPerTonne: 148,
    // Deliberately missing: moisture has not been measured for this batch.
    moisture: { value: null, measuredAt: null },
    nonPaper: { value: 0.9, measuredAt: '2026-10-20', method: 'Hand-sort of 20 kg sample (demo)' },
    inspectionStatus: 'awaiting',
    contaminationNotes: 'Staples and paper clips present. No adhesive labels noted in the sample.',
    inspectionNotes:
      'Visually clean, predominantly white office grades. Some coloured paper. Moisture test scheduled but not yet completed — oven capacity was unavailable on receipt.',
    documents: [],
    isDemo: true,
  },
  {
    id: 'DEMO-B104',
    grade: 'Old newspapers',
    supplier: 'Eastline Collection Services (demo)',
    sourceLocation: 'Yard 2, Bay A',
    receivedDate: '2026-10-05',
    availableTonnes: 60,
    costPerTonne: 71,
    moisture: { value: 8.1, measuredAt: '2026-10-09', method: 'Oven-dry sample, 3 bales (demo)' },
    nonPaper: { value: 2.4, measuredAt: '2026-10-09', method: 'Hand-sort of 25 kg sample (demo)' },
    inspectionStatus: 'inspected',
    contaminationNotes: 'Some plastic sleeves and inserts. Occasional twine.',
    inspectionNotes:
      'Bales of mixed age; outer sheets of older bales slightly yellowed. Inserts and plastic sleeves present in low amounts.',
    documents: [
      { id: 'doc-104-a', name: 'DEMO-B104 inspection report.pdf', kind: 'inspection-report', addedAt: '2026-10-09' },
      { id: 'doc-104-b', name: 'Supplier declaration Q4.pdf', kind: 'supplier-declaration', addedAt: '2026-10-05' },
    ],
    isDemo: true,
  },
]

export const DEMO_SCENARIOS: BlendScenario[] = [
  {
    id: 'scn-demo-liner',
    name: 'Liner trial — complete measurements',
    targetTonnes: 100,
    components: [
      { batchId: 'DEMO-B101', proportionPct: 60 },
      { batchId: 'DEMO-B102', proportionPct: 25 },
      { batchId: 'DEMO-B104', proportionPct: 15 },
    ],
    notes: 'Demonstration scenario. All selected batches have moisture and non-paper measurements.',
    createdAt: '2026-10-21T09:00:00.000Z',
    updatedAt: '2026-10-21T09:00:00.000Z',
    isDemo: true,
  },
  {
    id: 'scn-demo-office',
    name: 'Office-grade upgrade — missing moisture',
    targetTonnes: 80,
    components: [
      { batchId: 'DEMO-B101', proportionPct: 50 },
      { batchId: 'DEMO-B103', proportionPct: 30 },
      { batchId: 'DEMO-B102', proportionPct: 20 },
    ],
    notes:
      'Demonstration scenario. DEMO-B103 has no moisture measurement, so the blend moisture cannot be calculated until it is supplied.',
    createdAt: '2026-10-22T14:30:00.000Z',
    updatedAt: '2026-10-22T14:30:00.000Z',
    isDemo: true,
  },
]

export const DEMO_SPECIFICATION: ProductionSpecification = {
  id: 'spec-demo',
  name: 'Demo production specification',
  description:
    'Illustrative thresholds configured for this demonstration. They are not industry standards — replace them with the targets your mill has agreed.',
  ranges: [
    { parameter: 'moisture', enabled: true, min: null, max: 10 },
    { parameter: 'nonPaper', enabled: true, min: null, max: 2.5 },
    { parameter: 'costPerTonne', enabled: true, min: null, max: 100 },
    { parameter: 'totalTonnes', enabled: false, min: null, max: null },
  ],
  updatedAt: '2026-10-20T08:00:00.000Z',
}

/** A fictional inspection document used by the simulated AI extraction demo. */
export const DEMO_INSPECTION_DOCUMENT = {
  batchId: 'DEMO-B103',
  title: 'Incoming material inspection — DEMO-B103 (fictional document)',
  text: `CALDER OFFICE RECYCLING — DEMONSTRATION DOCUMENT
Incoming Material Inspection Sheet

Batch reference: DEMO-B103
Material description: Sorted office paper, baled
Date received: 19 Oct 2026
Sampling date: 20 Oct 2026
Net weight on weighbridge: 45.2 t
Bales sampled: 4 of 38
Non-paper components (hand sort, 20 kg): 0.9 %
Moisture: test scheduled — result not available at time of issue
Observations: staples and clips present; some coloured sheets; no adhesive labels seen.
Inspector: J. Okafor (fictional)`,
}

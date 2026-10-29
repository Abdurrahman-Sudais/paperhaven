import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Batch, BlendScenario, DocumentPlaceholder, ProductionSpecification } from '../types'
import { DEMO_BATCHES, DEMO_SCENARIOS, DEMO_SPECIFICATION } from '../data/demo'
import { clearAll, loadJson, saveJson } from '../lib/storage'
import { uid } from '../lib/format'

const isBatchArray = (v: unknown): v is Batch[] =>
  Array.isArray(v) && v.every((b) => b && typeof b.id === 'string' && b.moisture && b.nonPaper)
const isScenarioArray = (v: unknown): v is BlendScenario[] =>
  Array.isArray(v) && v.every((s) => s && typeof s.id === 'string' && Array.isArray(s.components))
const isSpec = (v: unknown): v is ProductionSpecification =>
  !!v && typeof v === 'object' && Array.isArray((v as ProductionSpecification).ranges)
const isScenario = (v: unknown): v is BlendScenario => isScenarioArray([v])

export const newWorkingScenario = (): BlendScenario => {
  const now = new Date().toISOString()
  return { id: uid('scn'), name: 'Untitled scenario', targetTonnes: 100, components: [], notes: '', createdAt: now, updatedAt: now }
}

interface PlannerState {
  batches: Batch[]
  scenarios: BlendScenario[]
  specification: ProductionSpecification
  /** The scenario currently open in the Blend Planner (may be unsaved). */
  working: BlendScenario
  setWorking: (s: BlendScenario | ((prev: BlendScenario) => BlendScenario)) => void
  addBatch: (b: Batch) => void
  updateBatch: (id: string, b: Batch) => void
  addDocument: (batchId: string, doc: Omit<DocumentPlaceholder, 'id' | 'addedAt'>) => void
  removeDocument: (batchId: string, docId: string) => void
  saveScenario: (s: BlendScenario) => void
  deleteScenario: (id: string) => void
  updateSpecification: (s: ProductionSpecification) => void
  resetDemo: () => void
}

const Ctx = createContext<PlannerState | null>(null)

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState(() => loadJson('batches', DEMO_BATCHES, isBatchArray))
  const [scenarios, setScenarios] = useState(() => loadJson('scenarios', DEMO_SCENARIOS, isScenarioArray))
  const [specification, setSpecification] = useState(() => loadJson('specification', DEMO_SPECIFICATION, isSpec))
  const [working, setWorking] = useState(() =>
    loadJson('working', structuredClone(DEMO_SCENARIOS[1]), isScenario),
  )

  useEffect(() => saveJson('batches', batches), [batches])
  useEffect(() => saveJson('scenarios', scenarios), [scenarios])
  useEffect(() => saveJson('specification', specification), [specification])
  useEffect(() => saveJson('working', working), [working])

  const addBatch = useCallback((b: Batch) => setBatches((prev) => [...prev, b]), [])
  const updateBatch = useCallback(
    (id: string, b: Batch) => {
      setBatches((prev) => prev.map((x) => (x.id === id ? b : x)))
      if (id !== b.id) {
        // Keep scenarios pointing at the renamed batch.
        const rename = (s: BlendScenario) => ({
          ...s,
          components: s.components.map((c) => (c.batchId === id ? { ...c, batchId: b.id } : c)),
        })
        setScenarios((prev) => prev.map(rename))
        setWorking((prev) => rename(prev))
      }
    },
    [],
  )
  const addDocument = useCallback((batchId: string, doc: Omit<DocumentPlaceholder, 'id' | 'addedAt'>) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, documents: [...b.documents, { ...doc, id: uid('doc'), addedAt: new Date().toISOString().slice(0, 10) }] }
          : b,
      ),
    )
  }, [])
  const removeDocument = useCallback((batchId: string, docId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, documents: b.documents.filter((d) => d.id !== docId) } : b)),
    )
  }, [])
  const saveScenario = useCallback((s: BlendScenario) => {
    const stamped = { ...s, updatedAt: new Date().toISOString() }
    setScenarios((prev) =>
      prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? stamped : x)) : [...prev, stamped],
    )
  }, [])
  const deleteScenario = useCallback((id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id)), [])
  const updateSpecification = useCallback(
    (s: ProductionSpecification) => setSpecification({ ...s, updatedAt: new Date().toISOString() }),
    [],
  )
  const resetDemo = useCallback(() => {
    clearAll()
    setBatches(structuredClone(DEMO_BATCHES))
    setScenarios(structuredClone(DEMO_SCENARIOS))
    setSpecification(structuredClone(DEMO_SPECIFICATION))
    setWorking(structuredClone(DEMO_SCENARIOS[1]))
  }, [])

  const value = useMemo(
    () => ({
      batches,
      scenarios,
      specification,
      working,
      setWorking,
      addBatch,
      updateBatch,
      addDocument,
      removeDocument,
      saveScenario,
      deleteScenario,
      updateSpecification,
      resetDemo,
    }),
    [batches, scenarios, specification, working, addBatch, updateBatch, addDocument, removeDocument, saveScenario, deleteScenario, updateSpecification, resetDemo],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePlanner(): PlannerState {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePlanner must be used inside PlannerProvider')
  return v
}

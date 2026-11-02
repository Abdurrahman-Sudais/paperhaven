import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Batch, BlendScenario, DocumentPlaceholder, ProductionSpecification } from '../types'
import { DEMO_BATCHES, DEMO_SCENARIOS, DEMO_SPECIFICATION } from '../data/demo'
import { clearAll, loadJson, saveJson } from '../lib/storage'
import { uid } from '../lib/format'
import { DEMO_USERS, can as roleCan, userById, type Action, type AuditEntry, type DemoUser } from '../lib/access'

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
  /** Exploring a blend in the planner is open to everyone; saving it needs the scenarios permission. */
  setWorking: (s: BlendScenario | ((prev: BlendScenario) => BlendScenario)) => void
  user: DemoUser
  /** Whether the acting user may perform an action. Every mutation below checks this first and returns false when refused. */
  can: (action: Action) => boolean
  setUser: (id: string) => void
  /** Append-only record of changes made in this browser, oldest first. */
  audit: AuditEntry[]
  addBatch: (b: Batch) => boolean
  updateBatch: (id: string, b: Batch) => boolean
  addDocument: (batchId: string, doc: Omit<DocumentPlaceholder, 'id' | 'addedAt'>) => boolean
  removeDocument: (batchId: string, docId: string) => boolean
  saveScenario: (s: BlendScenario) => boolean
  deleteScenario: (id: string) => boolean
  updateSpecification: (s: ProductionSpecification) => boolean
  resetDemo: () => void
}

const isAudit = (v: unknown): v is AuditEntry[] => Array.isArray(v)
const isUser = (v: unknown): v is string => typeof v === 'string' && DEMO_USERS.some((u) => u.id === v)

const Ctx = createContext<PlannerState | null>(null)

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState(() => loadJson('batches', DEMO_BATCHES, isBatchArray))
  const [scenarios, setScenarios] = useState(() => loadJson('scenarios', DEMO_SCENARIOS, isScenarioArray))
  const [specification, setSpecification] = useState(() => loadJson('specification', DEMO_SPECIFICATION, isSpec))
  const [working, setWorking] = useState(() =>
    loadJson('working', structuredClone(DEMO_SCENARIOS[1]), isScenario),
  )

  const [userId, setUserId] = useState(() => loadJson('user', DEMO_USERS[0]!.id, isUser))
  const [audit, setAudit] = useState(() => loadJson('audit', [] as AuditEntry[], isAudit))
  useEffect(() => saveJson('user', userId), [userId])
  useEffect(() => saveJson('audit', audit), [audit])
  const user = userById(userId)
  const allowed = useCallback((a: Action) => roleCan(user.role, a), [user.role])
  /** Run fn only when permitted, and record it in the audit log. */
  const guarded = useCallback(
    (action: Action, detail: string, fn: () => void) => {
      if (!roleCan(user.role, action)) return false
      fn()
      setAudit((prev) => [...prev, { id: uid('a'), at: new Date().toISOString(), userId: user.id, action, detail }])
      return true
    },
    [user],
  )

  useEffect(() => saveJson('batches', batches), [batches])
  useEffect(() => saveJson('scenarios', scenarios), [scenarios])
  useEffect(() => saveJson('specification', specification), [specification])
  useEffect(() => saveJson('working', working), [working])

  const addBatch = useCallback((b: Batch) => guarded('batches', `${b.id}: batch added (${b.grade}).`, () => setBatches((prev) => [...prev, b])), [guarded])
  const updateBatch = useCallback(
    (id: string, b: Batch) => guarded('batches', `${b.id}: batch updated.`, () => {
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
    }),
    [guarded],
  )
  const addDocument = useCallback((batchId: string, doc: Omit<DocumentPlaceholder, 'id' | 'addedAt'>) => guarded('documents', `${batchId}: document “${doc.name}” attached.`, () => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, documents: [...b.documents, { ...doc, id: uid('doc'), addedAt: new Date().toISOString().slice(0, 10) }] }
          : b,
      ),
    )
  }), [guarded])
  const removeDocument = useCallback((batchId: string, docId: string) => guarded('documents', `${batchId}: document removed.`, () => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, documents: b.documents.filter((d) => d.id !== docId) } : b)),
    )
  }), [guarded])
  const saveScenario = useCallback((s: BlendScenario) => guarded('scenarios', `Scenario “${s.name}” saved (${s.components.length} batches, ${s.targetTonnes} t).`, () => {
    const stamped = { ...s, updatedAt: new Date().toISOString() }
    setScenarios((prev) =>
      prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? stamped : x)) : [...prev, stamped],
    )
  }), [guarded])
  const deleteScenario = useCallback((id: string) => guarded('scenarios', `Scenario ${id} deleted.`, () => setScenarios((prev) => prev.filter((s) => s.id !== id))), [guarded])
  const updateSpecification = useCallback(
    (s: ProductionSpecification) => guarded('spec', `Specification “${s.name}” updated.`, () => setSpecification({ ...s, updatedAt: new Date().toISOString() })),
    [guarded],
  )
  const resetDemo = useCallback(() => {
    clearAll()
    setBatches(structuredClone(DEMO_BATCHES))
    setScenarios(structuredClone(DEMO_SCENARIOS))
    setSpecification(structuredClone(DEMO_SPECIFICATION))
    setWorking(structuredClone(DEMO_SCENARIOS[1]))
    setAudit([])
    // Reset only clears this browser's demo data; keep the acting user.
    saveJson('user', userId)
  }, [userId])

  const value = useMemo(
    () => ({
      batches,
      scenarios,
      specification,
      working,
      setWorking,
      user,
      can: allowed,
      setUser: setUserId,
      audit,
      addBatch,
      updateBatch,
      addDocument,
      removeDocument,
      saveScenario,
      deleteScenario,
      updateSpecification,
      resetDemo,
    }),
    [batches, scenarios, specification, working, user, allowed, audit, addBatch, updateBatch, addDocument, removeDocument, saveScenario, deleteScenario, updateSpecification, resetDemo],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePlanner(): PlannerState {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePlanner must be used inside PlannerProvider')
  return v
}

import { useMemo, useState } from 'react'
import { AlertTriangle, FileSearch, HelpCircle, ListTodo, Play, ShieldAlert, Sparkles, Text } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Card'
import { SelectField } from '../components/ui/Field'
import { ProvenanceTag } from '../components/ui/Provenance'
import { usePlanner } from '../state/PlannerContext'
import { DEMO_INSPECTION_DOCUMENT } from '../data/demo'
import {
  extractInspectionFields,
  highlightIncompleteRecords,
  suggestBuyerQuestions,
  summariseInspectionNotes,
  type ExtractedField,
} from '../lib/simulatedAi'
import type { BatchDraft } from '../lib/batches'
import { BatchForm } from './BatchForm'
import { cx } from '../lib/format'

type Tab = 'summary' | 'extract' | 'gaps' | 'questions'
const TABS: { id: Tab; label: string; Icon: typeof Text }[] = [
  { id: 'summary', label: 'Summarise notes', Icon: Text },
  { id: 'extract', label: 'Extract fields', Icon: FileSearch },
  { id: 'gaps', label: 'Incomplete records', Icon: ListTodo },
  { id: 'questions', label: 'Buyer questions', Icon: HelpCircle },
]

const MONTHS: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }
function toIso(s: string): string | null {
  const m = s.match(/(\d{1,2})\s+([A-Za-z]{3})\w*\s+(\d{4})/)
  return m && MONTHS[m[2].toLowerCase()] ? `${m[3]}-${MONTHS[m[2].toLowerCase()]}-${m[1].padStart(2, '0')}` : null
}

export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { batches } = usePlanner()
  const [tab, setTab] = useState<Tab>('summary')
  const [batchId, setBatchId] = useState(batches[0]?.id ?? '')
  const [ran, setRan] = useState<Record<Tab, boolean>>({ summary: false, extract: false, gaps: false, questions: false })
  const [form, setForm] = useState<{ suggested: Partial<BatchDraft> } | null>(null)

  const batch = batches.find((b) => b.id === batchId) ?? batches[0]
  const docBatch = batches.find((b) => b.id === DEMO_INSPECTION_DOCUMENT.batchId)
  const extracted = useMemo(() => extractInspectionFields(DEMO_INSPECTION_DOCUMENT.text), [])
  const run = () => setRan((r) => ({ ...r, [tab]: true }))

  const compare = (f: ExtractedField) => {
    if (!docBatch || !f.target) return { state: 'info' as const, current: '—' }
    if (f.value === null) return { state: 'absent' as const, current: '—' }
    if (f.target === 'receivedDate') {
      const iso = toIso(f.value)
      return { state: iso === docBatch.receivedDate ? ('match' as const) : ('differs' as const), current: docBatch.receivedDate, suggestion: iso }
    }
    if (f.target === 'availableTonnes') {
      return { state: f.numeric === docBatch.availableTonnes ? ('match' as const) : ('differs' as const), current: `${docBatch.availableTonnes} t`, suggestion: f.numeric }
    }
    const m = docBatch[f.target]
    if (m.value === null) return { state: 'empty' as const, current: 'Not measured', suggestion: f.numeric }
    return { state: m.value === f.numeric ? ('match' as const) : ('measured-differs' as const), current: `${m.value}%` }
  }

  const reviewInForm = (f: ExtractedField, suggestion: unknown) => {
    const s: Partial<BatchDraft> = {}
    if (f.target === 'availableTonnes') s.availableTonnes = String(suggestion)
    if (f.target === 'receivedDate') s.receivedDate = String(suggestion)
    if (f.target === 'nonPaper' || f.target === 'moisture') {
      const key = f.target === 'moisture' ? 'moistureValue' : 'nonPaperValue'
      s[key] = String(suggestion)
      const sampled = extracted.find((x) => x.field === 'sampled')?.value
      const iso = sampled ? toIso(sampled) : null
      if (iso) s[f.target === 'moisture' ? 'moistureDate' : 'nonPaperDate'] = iso
    }
    onClose()
    setForm({ suggested: s })
  }

  return (
    <>
      <Modal open={open} onClose={onClose} variant="panel" title={<span className="flex items-center gap-2"><Sparkles size={18} className="text-ai" /> AI assistance <Badge tone="ai">Simulated</Badge></span>}
        description="Demonstration only — no AI model is called. Output is produced by deterministic rules over the records.">
        <div className="space-y-4">
          <div className="flex gap-2 rounded-md border border-ai/25 bg-ai-soft/60 p-3 text-xs text-graphite">
            <ShieldAlert size={14} className="mt-0.5 shrink-0 text-ai" />
            <p>Suggestions never overwrite records or verified measurements. Anything you choose to use opens in the edit form for review. Paperhaven does not estimate moisture, fibre strength or composition from photographs — those require appropriate measurements.</p>
          </div>

          <div role="tablist" aria-label="Assistance tasks" className="grid grid-cols-2 gap-1 rounded-lg bg-paper-2 p-1">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={cx('flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium', tab === t.id ? 'bg-white text-ai shadow-sm' : 'text-graphite hover:text-ink')}>
                <t.Icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="space-y-4">
            {(tab === 'summary' || tab === 'questions') && (
              <SelectField label="Batch" value={batch?.id ?? ''} onChange={(e) => setBatchId(e.target.value)}>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.id} — {b.grade}</option>)}
              </SelectField>
            )}

            {tab === 'extract' && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate">{DEMO_INSPECTION_DOCUMENT.title}</p>
                <pre className="max-h-48 overflow-auto rounded-md border border-line bg-white p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-graphite">{DEMO_INSPECTION_DOCUMENT.text}</pre>
              </div>
            )}

            <Button variant="secondary" icon={<Play size={14} className="text-ai" />} onClick={run}>Run simulated assistance</Button>

            {ran[tab] && batch && (
              <div className="rounded-lg border border-dashed border-ai/40 bg-white/80 p-4" aria-live="polite">
                <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-ink">Suggestion</span><ProvenanceTag kind="ai" /></div>

                {tab === 'summary' && (() => {
                  const s = summariseInspectionNotes(batch)
                  return (
                    <div className="space-y-3 text-sm">
                      {s.themes.length === 0 && <p className="text-slate">No notes recorded for this batch.</p>}
                      {s.themes.map((t) => (
                        <div key={t.theme}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-ai">{t.theme}</p>
                          <ul className="mt-1 space-y-0.5 text-graphite">{t.points.map((p) => <li key={p}>• {p}</li>)}</ul>
                        </div>
                      ))}
                      <p className="text-xs text-slate">{s.caveat}</p>
                    </div>
                  )
                })()}

                {tab === 'extract' && (
                  <table className="w-full text-xs">
                    <caption className="sr-only">Extracted fields</caption>
                    <thead><tr className="text-left text-slate"><th className="py-1">Field</th><th className="py-1">Extracted</th><th className="py-1">Record</th><th className="py-1">Status</th></tr></thead>
                    <tbody>
                      {extracted.map((f) => {
                        const c = compare(f)
                        return (
                          <tr key={f.field} className="border-t border-line/70 align-top">
                            <td className="py-1.5 pr-2 font-medium text-ink">{f.label}</td>
                            <td className="py-1.5 pr-2">{f.value ?? <span className="text-ochre">Not found</span>}</td>
                            <td className="py-1.5 pr-2 text-graphite">{c.current}</td>
                            <td className="py-1.5">
                              {c.state === 'info' && <span className="text-slate">Reference</span>}
                              {c.state === 'match' && <Badge tone="forest">Matches</Badge>}
                              {c.state === 'absent' && (
                                <span className="text-ochre"><AlertTriangle size={11} className="mr-1 inline" />No value in document{f.sourceLine && <span className="block text-slate">“{f.sourceLine}”</span>}</span>
                              )}
                              {c.state === 'measured-differs' && <span className="text-rust">Differs — measured value kept</span>}
                              {(c.state === 'differs' || c.state === 'empty') && (
                                <span className="space-y-1">
                                  <span className="block text-ochre">{c.state === 'empty' ? 'Record empty' : 'Differs — record unchanged'}</span>
                                  <button className="font-medium text-ai underline" onClick={() => reviewInForm(f, c.suggestion)}>Review in edit form</button>
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}

                {tab === 'gaps' && (
                  <ul className="space-y-2 text-sm">
                    {highlightIncompleteRecords(batches).map((r) => (
                      <li key={r.batchId}>
                        <span className="font-mono text-xs font-semibold">{r.batchId}</span>
                        <span className="block text-xs text-graphite">{r.gaps.join(' · ')}</span>
                      </li>
                    ))}
                    {highlightIncompleteRecords(batches).length === 0 && <li className="text-slate">No incomplete records found.</li>}
                  </ul>
                )}

                {tab === 'questions' && (
                  <ul className="space-y-1.5 text-sm text-graphite">
                    {suggestBuyerQuestions(batch).map((q) => <li key={q}>• {q}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
      <BatchForm open={!!form} onClose={() => setForm(null)} batch={docBatch} suggested={form?.suggested} />
    </>
  )
}

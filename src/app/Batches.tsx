import { useMemo, useState, type ReactNode } from 'react'
import { FileText, Paperclip, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import type { Batch, DocumentPlaceholder } from '../types'
import { RECOVERED_GRADES } from '../types'
import { usePlanner } from '../state/PlannerContext'
import { Button } from '../components/ui/Button'
import { Badge, Card } from '../components/ui/Card'
import { DataTable, type Column } from '../components/ui/DataTable'
import { SelectField, inputClass } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { ProvenanceLegend, ProvenanceTag } from '../components/ui/Provenance'
import { BatchForm } from './BatchForm'
import { InspectionBadge, MissingValue } from './BatchStatus'
import {
  completenessScore,
  filterBatches,
  getBatchGaps,
  sortBatches,
  type BatchFilters,
  type SortDir,
  type SortKey,
} from '../lib/batches'
import { fmtDate, fmtPct, fmtTonnes, fmtUsd, fmtUsd2 } from '../lib/format'
import { suggestBuyerQuestions } from '../lib/simulatedAi'

export function BatchesPage() {
  const { batches } = usePlanner()
  const [filters, setFilters] = useState<BatchFilters>({ search: '', grade: 'all', supplier: 'all', completeness: 'all' })
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'id', dir: 'asc' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Batch | undefined>()

  const suppliers = useMemo(() => [...new Set(batches.map((b) => b.supplier))].sort(), [batches])
  const rows = useMemo(() => sortBatches(filterBatches(batches, filters), sort.key, sort.dir), [batches, filters, sort])
  const selected = batches.find((b) => b.id === selectedId)

  const onSort = (key: string) =>
    setSort((s) => ({ key: key as SortKey, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const columns: Column<Batch>[] = [
    { key: 'id', header: 'Batch ID', sortable: true, cell: (b) => <span className="font-mono text-xs font-medium text-ink">{b.id}</span> },
    { key: 'grade', header: 'Grade', cell: (b) => <span className="text-graphite">{b.grade}</span> },
    { key: 'supplier', header: 'Supplier', cell: (b) => <span className="text-graphite">{b.supplier}</span> },
    { key: 'availableTonnes', header: 'Available', align: 'right', sortable: true, cell: (b) => fmtTonnes(b.availableTonnes) },
    { key: 'costPerTonne', header: 'Cost / t', align: 'right', sortable: true, cell: (b) => fmtUsd2(b.costPerTonne) },
    { key: 'moisture', header: 'Moisture', align: 'right', sortable: true, cell: (b) => (b.moisture.value === null ? <MissingValue /> : fmtPct(b.moisture.value)) },
    { key: 'status', header: 'Inspection', cell: (b) => <InspectionBadge status={b.inspectionStatus} /> },
    {
      key: 'complete',
      header: 'Record',
      cell: (b) => {
        const gaps = getBatchGaps(b).length
        return gaps === 0 ? <Badge tone="forest">Complete</Badge> : <Badge tone="ochre">{gaps} gap{gaps > 1 ? 's' : ''}</Badge>
      },
    },
  ]

  const setF = <K extends keyof BatchFilters>(k: K) => (e: { target: { value: string } }) =>
    setFilters((f) => ({ ...f, [k]: e.target.value as BatchFilters[K] }))
  const filtered = filters.search || filters.grade !== 'all' || filters.supplier !== 'all' || filters.completeness !== 'all'

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate">{batches.length} batches in inventory · values are fictional demonstration data</p>
        <Button icon={<Plus size={16} />} onClick={() => { setEditing(undefined); setFormOpen(true) }}>Add batch</Button>
      </div>

      <Card>
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <label htmlFor="batch-search" className="mb-1 block text-sm font-medium text-graphite">Search</label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fibre" aria-hidden />
              <input id="batch-search" type="search" className={`${inputClass} pl-8`} placeholder="ID, supplier, notes…" value={filters.search} onChange={setF('search')} />
            </div>
          </div>
          <SelectField label="Grade" value={filters.grade} onChange={setF('grade')}>
            <option value="all">All grades</option>
            {RECOVERED_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </SelectField>
          <SelectField label="Supplier" value={filters.supplier} onChange={setF('supplier')}>
            <option value="all">All suppliers</option>
            {suppliers.map((s) => <option key={s}>{s}</option>)}
          </SelectField>
          <SelectField label="Measurement completeness" value={filters.completeness} onChange={setF('completeness')}>
            <option value="all">All records</option>
            <option value="complete">Complete records</option>
            <option value="missing-measurements">Missing measurements</option>
            <option value="missing-any">Any gap in record</option>
          </SelectField>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-slate" aria-live="polite">
          <span>Showing {rows.length} of {batches.length}{sort.key === 'moisture' && ' · batches without a moisture measurement sort last'}</span>
          {filtered && (
            <button className="inline-flex items-center gap-1 font-medium text-forest hover:underline" onClick={() => setFilters({ search: '', grade: 'all', supplier: 'all', completeness: 'all' })}>
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
        <DataTable rows={rows} columns={columns} rowKey={(b) => b.id} caption="Batch inventory" sort={sort} onSort={onSort}
          onRowClick={(b) => setSelectedId(b.id)} selectedKey={selectedId ?? undefined} empty="No batches match these filters." />
      </Card>

      <ProvenanceLegend className="px-1" />

      {selected && (
        <BatchDetail batch={selected} onClose={() => setSelectedId(null)} onEdit={() => { setEditing(selected); setFormOpen(true) }} />
      )}
      <BatchForm open={formOpen} onClose={() => setFormOpen(false)} batch={editing} onSaved={(b) => setSelectedId(b.id)} />
    </div>
  )
}

function Row({ label, children, tag }: { label: string; children: ReactNode; tag?: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-start gap-3 border-b border-line/60 py-2 text-sm last:border-0">
      <dt className="text-slate">{label}</dt>
      <dd className="flex flex-wrap items-center justify-between gap-2 text-ink">{children}{tag}</dd>
    </div>
  )
}

const DOC_KINDS: DocumentPlaceholder['kind'][] = ['inspection-report', 'weighbridge-ticket', 'supplier-declaration', 'photo', 'other']
const DOC_LABELS: Record<DocumentPlaceholder['kind'], string> = {
  'inspection-report': 'Inspection report',
  'weighbridge-ticket': 'Weighbridge ticket',
  'supplier-declaration': 'Supplier declaration',
  photo: 'Photograph (reference only)',
  other: 'Other',
}

function BatchDetail({ batch, onClose, onEdit }: { batch: Batch; onClose: () => void; onEdit: () => void }) {
  const { addDocument, removeDocument } = usePlanner()
  const [docName, setDocName] = useState('')
  const [docKind, setDocKind] = useState<DocumentPlaceholder['kind']>('inspection-report')
  const [docError, setDocError] = useState('')
  const gaps = getBatchGaps(batch)
  const score = completenessScore(batch)

  const attach = () => {
    if (!docName.trim()) return setDocError('Enter a document name.')
    addDocument(batch.id, { name: docName.trim(), kind: docKind })
    setDocName('')
    setDocError('')
  }

  return (
    <Modal open onClose={onClose} variant="panel" title={batch.id} description={`${batch.grade} · ${batch.supplier}`}
      footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button icon={<Pencil size={14} />} onClick={onEdit}>Edit batch</Button></>}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <InspectionBadge status={batch.inspectionStatus} />
          {batch.isDemo && <Badge tone="ochre">Demonstration values</Badge>}
        </div>

        <section aria-labelledby="sec-measured">
          <h3 id="sec-measured" className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">Measured properties <ProvenanceTag kind="measured" /></h3>
          <dl>
            {(['moisture', 'nonPaper'] as const).map((p) => {
              const m = batch[p]
              return (
                <Row key={p} label={p === 'moisture' ? 'Moisture' : 'Non-paper components'}>
                  {m.value === null ? <MissingValue /> : (
                    <span>
                      <span className="font-semibold tabular">{fmtPct(m.value)}</span>
                      <span className="block text-xs text-slate">Measured {fmtDate(m.measuredAt)}{m.method && ` · ${m.method}`}</span>
                    </span>
                  )}
                </Row>
              )
            })}
          </dl>
        </section>

        <section aria-labelledby="sec-operator">
          <h3 id="sec-operator" className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">Operator-entered information <ProvenanceTag kind="operator" /></h3>
          <dl>
            <Row label="Grade">{batch.grade}</Row>
            <Row label="Supplier">{batch.supplier}</Row>
            <Row label="Location">{batch.sourceLocation || '—'}</Row>
            <Row label="Received">{fmtDate(batch.receivedDate)}</Row>
            <Row label="Available">{fmtTonnes(batch.availableTonnes)}</Row>
            <Row label="Cost per tonne">{fmtUsd2(batch.costPerTonne)}</Row>
            <Row label="Contamination notes"><span className="text-graphite">{batch.contaminationNotes || '—'}</span></Row>
            <Row label="Inspection notes"><span className="text-graphite">{batch.inspectionNotes || '—'}</span></Row>
          </dl>
        </section>

        <section aria-labelledby="sec-calc">
          <h3 id="sec-calc" className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">Calculated values <ProvenanceTag kind="calculated" /></h3>
          <dl>
            <Row label="Stock value">{fmtUsd(batch.availableTonnes * batch.costPerTonne)}<span className="text-xs text-slate">available t × cost/t</span></Row>
            <Row label="Record completeness">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-24 overflow-hidden rounded bg-paper-3"><span className="block h-full bg-forest" style={{ width: `${score * 100}%` }} /></span>
                {Math.round(score * 100)}%
              </span>
            </Row>
          </dl>
          {gaps.length > 0 && (
            <ul className="mt-2 space-y-1 rounded-md border border-ochre/30 bg-ochre-soft p-3 text-xs text-ochre">
              {gaps.map((g) => <li key={g.field}>• Missing: {g.label}</li>)}
            </ul>
          )}
        </section>

        <section aria-labelledby="sec-docs">
          <h3 id="sec-docs" className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><Paperclip size={14} /> Documents</h3>
          {batch.documents.length === 0 ? (
            <p className="text-sm text-slate">No documents attached.</p>
          ) : (
            <ul className="space-y-1.5">
              {batch.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-md border border-line bg-white/70 px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2"><FileText size={14} className="shrink-0 text-slate" /><span className="truncate">{d.name}</span></span>
                  <span className="flex items-center gap-2">
                    <span className="hidden text-xs text-slate sm:inline">{DOC_LABELS[d.kind]} · {fmtDate(d.addedAt)}</span>
                    <button onClick={() => removeDocument(batch.id, d.id)} className="rounded p-1 text-slate hover:bg-rust-soft hover:text-rust" aria-label={`Remove ${d.name}`}><Trash2 size={13} /></button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 rounded-md border border-dashed border-line-strong p-3">
            <p className="mb-2 text-xs text-slate">Attachment placeholder — records a document reference only. File upload requires a storage backend.</p>
            <div className="flex flex-wrap gap-2">
              <input aria-label="Document name" className={`${inputClass} min-w-40 flex-1`} placeholder="Document name" value={docName} onChange={(e) => setDocName(e.target.value)} />
              <select aria-label="Document type" className={`${inputClass} w-auto`} value={docKind} onChange={(e) => setDocKind(e.target.value as DocumentPlaceholder['kind'])}>
                {DOC_KINDS.map((k) => <option key={k} value={k}>{DOC_LABELS[k]}</option>)}
              </select>
              <Button variant="secondary" onClick={attach}>Attach</Button>
            </div>
            {docError && <p role="alert" className="mt-1 text-xs text-rust">{docError}</p>}
          </div>
        </section>

        <section aria-labelledby="sec-ai" className="rounded-md border border-dashed border-ai/40 bg-ai-soft/50 p-3">
          <h3 id="sec-ai" className="mb-2 flex items-center gap-2 text-sm font-semibold text-ai">Questions to investigate <ProvenanceTag kind="ai" /></h3>
          <ul className="space-y-1 text-sm text-graphite">
            {suggestBuyerQuestions(batch).slice(0, 4).map((q) => <li key={q}>• {q}</li>)}
          </ul>
          <p className="mt-2 text-[11px] text-slate">Simulated suggestions from rules over this record. Not saved to the batch.</p>
        </section>
      </div>
    </Modal>
  )
}


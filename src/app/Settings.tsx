import { useState } from 'react'
import { Database, RotateCcw } from 'lucide-react'
import { usePlanner } from '../state/PlannerContext'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { ProvenanceLegend } from '../components/ui/Provenance'

export function SettingsPage() {
  const { batches, scenarios, resetDemo } = usePlanner()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card>
        <CardHeader title="Workspace" icon={<Database size={16} />} description="This demonstration has no backend. Data is kept in your browser’s localStorage." />
        <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div><dt className="text-slate">Batches stored</dt><dd className="text-lg font-semibold tabular">{batches.length}</dd></div>
          <div><dt className="text-slate">Scenarios stored</dt><dd className="text-lg font-semibold tabular">{scenarios.length}</dd></div>
          <div><dt className="text-slate">Currency</dt><dd className="font-medium">USD</dd></div>
          <div><dt className="text-slate">Mass unit</dt><dd className="font-medium">Tonnes (t)</dd></div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Value provenance" description="How values are labelled throughout the planner." />
        <div className="p-5"><ProvenanceLegend className="flex-col !gap-3 [&_span.hidden]:inline" /></div>
      </Card>

      <Card>
        <CardHeader title="Reset demonstration data" description="Restores the four sample batches, two example scenarios and the demo specification. Your changes will be lost." />
        <div className="flex items-center justify-between gap-3 p-5">
          {done ? <span className="text-sm font-medium text-forest" role="status">Demo data restored.</span> : <span />}
          <Button variant="danger" icon={<RotateCcw size={14} />} onClick={() => setConfirmOpen(true)}>Reset demo data</Button>
        </div>
      </Card>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reset demonstration data?"
        footer={<><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { resetDemo(); setConfirmOpen(false); setDone(true) }}>Reset</Button></>}>
        <p className="text-sm text-graphite">All batches, scenarios and specification changes stored in this browser will be replaced with the original demonstration data.</p>
      </Modal>
    </div>
  )
}

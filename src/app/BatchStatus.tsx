import { AlertTriangle, CheckCircle2, CircleDashed, Eye } from 'lucide-react'
import type { InspectionStatus } from '../types'
import { INSPECTION_STATUS_LABELS } from '../types'
import { Badge, type Tone } from '../components/ui/Card'

const TONES: Record<InspectionStatus, { tone: Tone; Icon: typeof Eye }> = {
  inspected: { tone: 'forest', Icon: CheckCircle2 },
  awaiting: { tone: 'ochre', Icon: CircleDashed },
  review: { tone: 'rust', Icon: AlertTriangle },
  'not-inspected': { tone: 'neutral', Icon: Eye },
}

export function InspectionBadge({ status }: { status: InspectionStatus }) {
  const { tone, Icon } = TONES[status]
  return <Badge tone={tone} icon={<Icon size={11} aria-hidden />}>{INSPECTION_STATUS_LABELS[status]}</Badge>
}

export function MissingValue({ label = 'Not measured' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-dashed border-ochre/50 bg-ochre-soft px-1.5 py-0.5 text-xs font-medium text-ochre">
      <AlertTriangle size={11} aria-hidden /> {label}
    </span>
  )
}

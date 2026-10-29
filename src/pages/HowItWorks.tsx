import { CheckCircle2, ClipboardList, Gauge, Layers, SearchCheck } from 'lucide-react'
import { CtaBand, PageHero, Section } from '../components/site/Section'
import { MaterialScene } from '../components/site/MaterialScene'
import { ProvenanceTag } from '../components/ui/Provenance'
import { usePageMeta } from '../lib/usePageMeta'

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Record incoming batches',
    body: 'When material arrives, the receiving team records the batch ID, grade, supplier, yard location, available tonnage and purchase cost. Inspection and contamination notes are added as free text, and documents such as weighbridge tickets are attached.',
    tags: ['operator'] as const,
    scene: 'bales' as const,
  },
  {
    icon: Gauge,
    title: 'Verify available measurements',
    body: 'Moisture and non-paper content are recorded from sample tests with the date and method. The inventory shows which batches are complete and which are awaiting measurement, so gaps are visible before planning begins.',
    tags: ['measured'] as const,
    scene: 'inspection' as const,
  },
  {
    icon: Layers,
    title: 'Configure a blend scenario',
    body: 'Planners select batches, set a planned quantity and the proportion drawn from each. The planner checks proportions total 100% and that each batch has enough stock, then compares the blend with your configured specification.',
    tags: ['operator', 'calculated'] as const,
    scene: 'warehouse' as const,
  },
  {
    icon: SearchCheck,
    title: 'Review calculations and missing inputs',
    body: 'Every result opens to show its formula and inputs. If a required measurement is missing, the result is withheld and the missing input is named. Scenarios are saved and compared before a plan is agreed.',
    tags: ['calculated', 'ai'] as const,
    scene: 'mill' as const,
  },
]

export function HowItWorksPage() {
  usePageMeta('How It Works', 'Record incoming recovered-paper batches, verify measurements, configure blend scenarios and review traceable calculations.', '/how-it-works')
  return (
    <>
      <PageHero eyebrow="How it works" title="From the receiving yard to an agreed blend plan.">
        <p>Paperhaven follows the way recovered-paper teams already work — it keeps the record straight and makes the gaps visible.</p>
      </PageHero>
      <Section>
        <ol className="space-y-16">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className={i % 2 ? 'lg:order-last' : ''}>
                <span className="font-mono text-sm text-kraft-dark">Step 0{i + 1}</span>
                <h2 className="mt-2 flex items-center gap-3 text-2xl font-semibold text-ink sm:text-3xl">
                  <s.icon className="text-forest" size={24} /> {s.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate">{s.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((t) => <ProvenanceTag key={t} kind={t} />)}
                </div>
              </div>
              <MaterialScene scene={s.scene} caption={`Step 0${i + 1} — ${s.title}`} className="aspect-[16/10]" />
            </li>
          ))}
        </ol>
      </Section>
      <Section tone="paper-2">
        <h2 className="text-2xl font-semibold text-ink">Principles the platform follows</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            'Missing measurements are never replaced with zero or an estimate.',
            'Specification checks only use thresholds your team has configured.',
            'AI suggestions are labelled and never overwrite records automatically.',
            'Material properties are not inferred from photographs.',
          ].map((t) => (
            <li key={t} className="flex gap-3 rounded-lg border border-line bg-white/70 p-4 text-sm text-graphite">
              <CheckCircle2 size={18} className="shrink-0 text-forest" /> {t}
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand />
    </>
  )
}

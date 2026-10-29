import { Check } from 'lucide-react'
import { CtaBand, Eyebrow, PageHero, Section } from '../components/site/Section'
import { MaterialScene } from '../components/site/MaterialScene'
import { usePageMeta } from '../lib/usePageMeta'

const SOLUTIONS = [
  {
    id: 'mills',
    eyebrow: 'Paper mills',
    title: 'Plan furnish with a clear view of what is in the yard.',
    body: 'Fibre buyers and production planners compare incoming batches against the specification for each product, explore blends before committing stock, and see the cost of each option.',
    points: ['Compare batches by cost, moisture and non-paper content', 'Blend scenarios checked against your own target ranges', 'Stock-aware planning across suppliers', 'Shared scenario comparisons for production meetings'],
    scene: 'mill' as const,
  },
  {
    id: 'processors',
    eyebrow: 'Recycling processors',
    title: 'Keep a consistent record of every bale that leaves the site.',
    body: 'Material recovery facilities and processors record grade, measurements and inspection evidence per batch, so customers receive complete, traceable information.',
    points: ['Batch records with dated measurements and methods', 'Inspection notes and document attachments', 'Completeness filters to find records needing work', 'Clear distinction between measured and entered values'],
    scene: 'warehouse' as const,
  },
  {
    id: 'suppliers',
    eyebrow: 'Recovered-fibre suppliers',
    title: 'Present batches buyers can evaluate with confidence.',
    body: 'Traders and suppliers organise their batch information, see which measurements a buyer will ask about, and answer questions before they become disputes.',
    points: ['Highlight incomplete records before sharing', 'Suggested buyer questions for each batch', 'Document extraction to reduce manual re-keying', 'Consistent grade and supplier data across loads'],
    scene: 'inspection' as const,
  },
]

export function SolutionsPage() {
  usePageMeta('Industry Solutions', 'Paperhaven for paper mills, recycling processors and recovered-fibre suppliers.', '/solutions')
  return (
    <>
      <PageHero eyebrow="Industry solutions" title="One platform across the recovered-fibre supply chain.">
        <p>Mills, processors and suppliers look at the same batch from different sides. Paperhaven gives each a record they can rely on.</p>
      </PageHero>
      {SOLUTIONS.map((s, i) => (
        <Section key={s.id} id={s.id} tone={i % 2 ? 'paper-2' : 'paper'}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className={i % 2 ? 'lg:order-last' : ''}>
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{s.title}</h2>
              <p className="mt-4 text-lg text-slate">{s.body}</p>
              <ul className="mt-6 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-graphite"><Check size={16} className="mt-1 shrink-0 text-forest" />{p}</li>
                ))}
              </ul>
            </div>
            <MaterialScene scene={s.scene} caption={s.eyebrow} className="aspect-[16/10]" />
          </div>
        </Section>
      ))}
      <CtaBand />
    </>
  )
}

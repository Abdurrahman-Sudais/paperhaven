import { AlertTriangle, ArrowRight } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { CtaBand, PageHero, Section, SectionHeading } from '../components/site/Section'
import { ProductPreview } from '../components/site/ProductPreview'
import { usePageMeta } from '../lib/usePageMeta'

const FORMULAS = [
  ['Tonnes from each batch', 'tonnesᵢ = planned quantity × proportionᵢ ÷ 100', 'Proportions must total exactly 100%.'],
  ['Total blend quantity', 'Σ tonnesᵢ', 'Checked against the available stock of each batch.'],
  ['Total material cost', 'Σ (tonnesᵢ × cost per tonneᵢ)', 'Uses operator-entered purchase cost.'],
  ['Weighted cost per tonne', 'total material cost ÷ total blend quantity', ''],
  ['Weighted moisture', 'Σ (proportionᵢ × moistureᵢ) ÷ Σ proportionᵢ', 'Only when every contributing batch has a valid measurement.'],
  ['Weighted non-paper content', 'Σ (proportionᵢ × non-paperᵢ) ÷ Σ proportionᵢ', 'Same rule as moisture.'],
]

export function BlendPlannerInfoPage() {
  usePageMeta('Blend Planner', 'Explore recovered-paper blend proportions, total material cost, weighted cost per tonne and weighted moisture — with missing measurements flagged, not guessed.', '/blend-planner')
  return (
    <>
      <PageHero eyebrow="Blend Planner" title="Explore a blend before you commit the material." aside={<ProductPreview />}>
        <p>Select batches, set their proportions, and see the quantity, cost and measured properties of the blend — calculated transparently from your records.</p>
        <div className="mt-8">
          <ButtonLink to="/planner/blend" size="lg" icon={<ArrowRight size={16} />}>Open Blend Planner</ButtonLink>
        </div>
      </PageHero>

      <Section>
        <SectionHeading eyebrow="Calculations" title="What the planner calculates, and how.">
          <p>Each calculation is a small deterministic function, kept separate from the interface and covered by tests.</p>
        </SectionHeading>
        <div className="mt-10 overflow-hidden rounded-lg border border-line bg-white/80">
          <table className="w-full text-sm">
            <caption className="sr-only">Blend planner formulas</caption>
            <thead className="bg-paper-2 text-left text-xs uppercase tracking-wide text-slate">
              <tr><th scope="col" className="px-4 py-3">Result</th><th scope="col" className="px-4 py-3">Formula</th><th scope="col" className="hidden px-4 py-3 md:table-cell">Condition</th></tr>
            </thead>
            <tbody>
              {FORMULAS.map(([r, f, c]) => (
                <tr key={r} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{r}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-graphite">{f}</td>
                  <td className="hidden px-4 py-3 text-slate md:table-cell">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="paper-2">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading eyebrow="Missing data" title="A missing measurement is shown as missing.">
            <p>If one batch in a blend has not been tested for moisture, the blend moisture cannot be known. Paperhaven withholds the result, names the batch, and explains what needs to be supplied — rather than treating the missing value as zero, which would understate the blend.</p>
          </SectionHeading>
          <div className="rounded-lg border border-ochre/30 bg-ochre-soft p-5">
            <div className="flex items-center gap-2 font-semibold text-ochre"><AlertTriangle size={16} /> Weighted moisture unavailable</div>
            <p className="mt-2 text-sm text-graphite">DEMO-B103 (30% of the blend) has no recorded moisture measurement. The weighted moisture cannot be calculated reliably until the missing value is supplied.</p>
            <p className="mt-3 text-xs text-slate">Example from the demo scenario “Office-grade upgrade — missing moisture”.</p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Save and compare', 'Save multiple scenarios and compare quantity, cost, measured properties and specification results side by side.'],
            ['Check against your specification', 'Configure target ranges. The checker reports within, outside, unavailable or not configured — and nothing else.'],
            ['Stock-aware', 'A scenario that draws more than a batch has available is flagged before it reaches the production meeting.'],
          ].map(([t, d]) => (
            <div key={t} className="border-l-2 border-forest pl-4">
              <p className="font-semibold text-ink">{t}</p>
              <p className="mt-1 text-sm text-slate">{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  )
}

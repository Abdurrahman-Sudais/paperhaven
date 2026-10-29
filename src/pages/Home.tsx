import {
  ArrowRight,
  Boxes,
  Calculator,
  ClipboardCheck,
  Droplets,
  FileText,
  Factory,
  GitCompareArrows,
  Link2,
  Recycle,
  Scale,
  ShieldAlert,
  SlidersHorizontal,
  Truck,
  Warehouse,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { CtaBand, Eyebrow, FeatureCard, Section, SectionHeading } from '../components/site/Section'
import { ProductPreview } from '../components/site/ProductPreview'
import { MaterialScene } from '../components/site/MaterialScene'
import { ProvenanceTag } from '../components/ui/Provenance'
import { usePageMeta } from '../lib/usePageMeta'

export function HomePage() {
  usePageMeta(
    'Paperhaven — Recovered-paper assessment and blend planning',
    'Compare incoming recovered-paper batches, explore blend proportions, and understand material costs using the measurements your team trusts.',
    '/',
  )
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_left,black_40%,transparent_75%)]" aria-hidden />
        <div className="absolute inset-0 texture-fibre" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-24">
          <div>
            <Eyebrow>Make every recovered-paper batch count</Eyebrow>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-balance text-ink sm:text-5xl lg:text-[56px]">
              Turn recovered-paper variability into a clearer production plan.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
              Compare incoming batches, explore blend proportions, and understand material costs using the measurements your team trusts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/planner/blend" size="lg" icon={<ArrowRight size={16} />}>Open Blend Planner</ButtonLink>
              <ButtonLink to="/product" size="lg" variant="secondary">Explore the Platform</ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ['Batch records', 'Source, cost, stock'],
                ['Measurements', 'Dated, with method'],
                ['Calculations', 'Traceable to inputs'],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt className="text-sm font-semibold text-ink">{t}</dt>
                  <dd className="mt-0.5 text-xs text-slate">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* A. Challenge */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="The challenge" title="Recovered fibre is variable. Your plan shouldn't be guesswork.">
              <p>
                Two loads described as the same grade can arrive with different moisture, different levels of non-paper material, and
                different usable tonnage. Purchase prices move independently of all three. Planning a blend means holding these
                differences side by side.
              </p>
            </SectionHeading>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                [Recycle, 'Grade', 'Supplier grade descriptions vary in how strictly they are applied.'],
                [Droplets, 'Moisture', 'Water content changes the dry fibre you actually pay for.'],
                [ShieldAlert, 'Contamination', 'Plastics, metals and soiled material affect yield and handling.'],
                [Scale, 'Usable quantity', 'Weighbridge tonnage is not always the tonnage available to plan.'],
                [Calculator, 'Purchase cost', 'Price per tonne needs context from every measurement above.'],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Recycle
                return (
                  <li key={t as string} className="flex gap-3 rounded-lg border border-line bg-white/70 p-4">
                    <I size={18} className="mt-0.5 shrink-0 text-kraft-dark" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{t as string}</p>
                      <p className="mt-0.5 text-sm text-slate">{d as string}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <MaterialScene scene="bales" caption="Fig. 01 — Baled OCC, receiving yard" className="aspect-[16/11]" />
        </div>
      </Section>

      {/* B. One record */}
      <Section tone="paper-2">
        <SectionHeading eyebrow="One record for every batch" title="Everything known about a batch, in one place — and clearly labelled.">
          <p>Each batch record keeps commercial details, measurements and inspection evidence together, with every value tagged by where it came from.</p>
        </SectionHeading>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<Truck size={18} />} title="Source information">Supplier, received date, yard location and grade as declared and as inspected.</FeatureCard>
          <FeatureCard icon={<Calculator size={18} />} title="Costs and stock">Cost per tonne and tonnage available for planning, kept current as material is consumed.</FeatureCard>
          <FeatureCard icon={<Droplets size={18} />} title="Measurements">Moisture and non-paper content with sample date and method — or a clear flag when not yet measured.</FeatureCard>
          <FeatureCard icon={<FileText size={18} />} title="Inspection documents">Inspection reports, weighbridge tickets and supplier declarations attached to the batch they describe.</FeatureCard>
          <FeatureCard icon={<ClipboardCheck size={18} />} title="Inspection status">Inspected, awaiting measurement or requiring review — visible wherever the batch appears.</FeatureCard>
          <FeatureCard icon={<Warehouse size={18} />} title="Stock availability">Planning checks a blend against the tonnage each batch actually has available.</FeatureCard>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white/70 px-4 py-3 text-sm text-slate">
          <span className="mr-1 font-medium text-ink">Every value is tagged:</span>
          <ProvenanceTag kind="measured" />
          <ProvenanceTag kind="operator" />
          <ProvenanceTag kind="ai" />
          <ProvenanceTag kind="calculated" />
        </div>
      </Section>

      {/* C. Compare and plan */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <MaterialScene scene="warehouse" caption="Fig. 02 — Racked stock by grade" className="order-last aspect-[16/11] lg:order-first" />
          <div>
            <SectionHeading eyebrow="Compare and plan" title="Build blend scenarios against your own specification.">
              <p>Set proportions, see the cost and measured properties of the blend, and save scenarios to compare before committing material.</p>
            </SectionHeading>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [GitCompareArrows, 'Batch comparison', 'Cost, moisture, non-paper content and availability side by side.'],
                [SlidersHorizontal, 'Blend scenarios', 'Adjust proportions with sliders or exact values; save and compare.'],
                [ClipboardCheck, 'Specification checks', 'Compare blends to thresholds your team configures — nothing assumed.'],
                [Calculator, 'Cost calculations', 'Total material cost and weighted cost per tonne, with formulas shown.'],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Recycle
                return (
                  <div key={t as string}>
                    <I size={18} className="text-forest" />
                    <p className="mt-2 text-sm font-semibold text-ink">{t as string}</p>
                    <p className="mt-1 text-sm text-slate">{d as string}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* D. How it works */}
      <Section tone="ink" className="relative">
        <SectionHeading inverse eyebrow="How Paperhaven works" title="Four steps from yard to plan." />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-paper/15 bg-paper/15 md:grid-cols-4">
          {[
            ['Record incoming batches', 'Capture grade, supplier, quantity, cost and inspection notes as material arrives.'],
            ['Verify available measurements', 'See which batches have dated moisture and contamination measurements — and which do not.'],
            ['Configure a blend scenario', 'Select batches, set proportions and a planned quantity, and check against your specification.'],
            ['Review calculations and missing inputs', 'Inspect each result’s formula and inputs. Missing values are flagged, never filled in.'],
          ].map(([t, d], i) => (
            <li key={t} className="bg-ink p-6">
              <span className="font-mono text-xs text-kraft">0{i + 1}</span>
              <p className="mt-3 font-semibold text-paper">{t}</p>
              <p className="mt-2 text-sm text-paper/65">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ButtonLink to="/how-it-works" variant="inverse" icon={<ArrowRight size={14} />}>See the workflow in detail</ButtonLink>
        </div>
      </Section>

      {/* E. Traceable planning */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Traceable planning" title="Every number can be followed back to a measurement.">
              <p>
                Weighted averages show the proportions and measured values they were built from. When a measurement is missing, the
                result is withheld with an explanation — Paperhaven does not substitute zero or an estimate.
              </p>
            </SectionHeading>
            <ul className="mt-6 space-y-2 text-sm text-graphite">
              {['Formulas displayed alongside results', 'Inputs listed with batch ID, value and provenance', 'Missing measurements flagged at the batch and blend level', 'Specification checks only run on configured thresholds'].map((t) => (
                <li key={t} className="flex items-center gap-2"><Link2 size={14} className="text-forest" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-line bg-white p-5 font-mono text-[12px] leading-relaxed text-graphite shadow-sm">
            <div className="mb-3 flex items-center justify-between font-sans">
              <span className="text-sm font-semibold text-ink">Blend moisture — trace</span>
              <ProvenanceTag kind="calculated" />
            </div>
            <p className="text-slate">Σ(proportionᵢ × moistureᵢ) ÷ Σ(proportionᵢ)</p>
            <div className="mt-3 space-y-1 border-t border-line pt-3">
              <div className="flex justify-between"><span>DEMO-B101 · 60%</span><span>9.4% <span className="text-forest">measured 14 Oct</span></span></div>
              <div className="flex justify-between"><span>DEMO-B102 · 25%</span><span>11.2% <span className="text-forest">measured 10 Oct</span></span></div>
              <div className="flex justify-between"><span>DEMO-B104 · 15%</span><span>8.1% <span className="text-forest">measured 09 Oct</span></span></div>
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold text-ink">
              <span>Result</span><span>9.66%</span>
            </div>
            <p className="mt-3 font-sans text-[11px] text-slate">Demonstration values. Liner trial scenario, 100 t.</p>
          </div>
        </div>
      </Section>

      {/* F. Industry */}
      <Section tone="paper-2">
        <SectionHeading eyebrow="Built for the recovered-paper industry" title="For the teams who buy, process and consume recovered fibre." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Factory, title: 'Paper mills', scene: 'mill' as const, body: 'Production planners and fibre buyers comparing supply against the specification for each grade they make.', href: '/solutions#mills' },
            { icon: Boxes, title: 'Recycling processors', scene: 'warehouse' as const, body: 'Material recovery facilities and processors keeping consistent records of what goes out in every bale.', href: '/solutions#processors' },
            { icon: Truck, title: 'Recovered-fibre suppliers', scene: 'inspection' as const, body: 'Traders and suppliers presenting batches with complete, dated measurements to their mill customers.', href: '/solutions#suppliers' },
          ].map(({ icon: I, title, body, scene, href }) => (
            <Link key={title} to={href} className="group overflow-hidden rounded-lg border border-line bg-white/80 transition-shadow hover:shadow-md">
              <MaterialScene scene={scene} className="aspect-[16/9] rounded-none border-0" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-forest"><I size={16} /><span className="font-semibold text-ink">{title}</span></div>
                <p className="mt-2 text-sm text-slate">{body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-forest group-hover:gap-2 transition-all">Learn more <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* G. CTA */}
      <CtaBand />
    </>
  )
}

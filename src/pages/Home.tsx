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
import type { CSSProperties, ReactNode } from 'react'
import { AlertTriangle, Check, CheckCircle2, ExternalLink, Minus, X } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { useCountUp, useCycle } from '../lib/motion'
import { AiSection, EarlyAccessSection, FaqSection, PricingSection, RoadmapSection, SafeguardsSection, TeamSection, TechnologySection } from './HomeSections'
import { CtaBand, FeatureCard, Section, SectionHeading } from '../components/site/Section'
import { ProductPreview } from '../components/site/ProductPreview'
import { MaterialScene } from '../components/site/MaterialScene'
import { ProvenanceTag } from '../components/ui/Provenance'
import { usePageMeta } from '../lib/usePageMeta'

const dl = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/** Published figures used in the problem section. Each one links to its source. */
export const PROBLEM_STATS = [
  { value: 0.5, decimals: 1, prefix: '', suffix: '%', label: 'contamination limit China set for recovered-paper imports under National Sword in 2018 — quality suddenly had to be proven.', source: 'SWANA report on National Sword, via Waste360', url: 'https://www.waste360.com/waste-management-business/swana-report-national-sword-impact-and-solutions' },
  { value: 46, decimals: 0, prefix: '', suffix: 'M t', label: 'of paper recycled in the United States in 2023 — every tonne bought, graded and blended by someone.', source: 'American Forest & Paper Association (2024)', url: 'https://afandpa.org/news/2024/paper-industry-announces-2023-us-paper-recycling-rates-using-updated-methodology' },
  { value: 69, decimals: 0, prefix: '65–', suffix: '%', label: 'US paper recycling rate in 2023, under AF&PA’s updated methodology.', source: 'American Forest & Paper Association (2024)', url: 'https://afandpa.org/news/2024/paper-industry-announces-2023-us-paper-recycling-rates-using-updated-methodology' },
]

const OUTCOME_WORDS = ['rejected loads.', 'off-spec blends.', 'margin surprises.', 'guesswork.'] as const
const BUILT_FOR = ['OCC', 'Mixed paper', 'Sorted office paper', 'Old newspapers', 'Kraft', 'Paper mills', 'Recycling processors', 'Material recovery facilities', 'Fibre buyers', 'Recovered-fibre traders', 'Containerboard', 'Tissue', 'Boxboard']

function FloatCard({ className, icon, title, body, style }: { className: string; icon: ReactNode; title: string; body: string; style?: CSSProperties }) {
  return (
    <div className={`absolute z-10 max-w-[17rem] items-start gap-3 rounded-lg border border-line bg-white/95 p-3 shadow-[0_20px_40px_-22px_rgba(25,29,27,0.5)] backdrop-blur ${className}`} style={style} aria-hidden>
      <span className="mt-0.5">{icon}</span>
      <span><span className="block text-xs font-semibold text-ink">{title}</span><span className="mt-0.5 block text-xs text-slate">{body}</span></span>
    </div>
  )
}

function Stat({ value, decimals, prefix, suffix, label, source, url, delay }: (typeof PROBLEM_STATS)[number] & { delay: number }) {
  const [ref, n] = useCountUp<HTMLDivElement>(value)
  return (
    <figure className="reveal lift spot rounded-xl border border-line bg-white/80 p-6" style={dl(delay)}>
      <div ref={ref} className="font-mono text-5xl font-medium tracking-tight tabular-nums text-ink">{prefix}{n.toFixed(decimals)}<span className="text-kraft-dark">{suffix}</span></div>
      <figcaption>
        <p className="mt-3 text-graphite">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-start gap-1 text-xs text-slate hover:text-forest">Source: {source} <ExternalLink size={12} className="mt-0.5 shrink-0" /></a>
      </figcaption>
    </figure>
  )
}

function Marquee() {
  const row = [...BUILT_FOR, ...BUILT_FOR]
  return (
    <section aria-label="Built for" className="marquee overflow-hidden border-b border-line bg-paper-2 py-6">
      <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-slate">Built for teams working with</p>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-10">{row.map((t, i) => <li key={i} aria-hidden={i >= BUILT_FOR.length} className="flex items-center gap-10 whitespace-nowrap text-lg font-medium text-fibre">{t}<span className="h-1 w-1 rounded-full bg-kraft" /></li>)}</ul>
      </div>
    </section>
  )
}

function SolutionSection() {
  const today = ['Grade descriptions are trusted at face value, whatever arrives.', 'Moisture and contamination readings sit in a lab book or not at all.', 'Blends are planned in spreadsheets that quietly treat missing values as zero.', 'Cost per tonne ignores the water and non-paper you are paying for.', 'Nobody can show later why a blend was chosen.']
  const withPh = ['Every batch carries dated measurements, documents and its real cost.', 'Gaps are listed on the batch, so someone can go and measure it.', 'Blend maths returns “unavailable” — with the reason — when an input is missing.', 'Cost, moisture and non-paper are weighted together in one scenario.', 'Saved scenarios, specification checks and every change are recorded.']
  return (
    <Section id="solution" tone="ink">
      <SectionHeading inverse eyebrow="What we solve" title="From spreadsheets and assumptions to blends you can defend." />
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <div className="reveal rounded-xl border border-paper/10 bg-paper/5 p-6 sm:p-8">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60"><X size={14} className="text-[#e8a08d]" /> Today</p>
          <ul className="mt-5 space-y-4">{today.map((t) => <li key={t} className="flex gap-3 text-paper/70"><Minus size={16} className="mt-1 shrink-0 text-paper/40" /> {t}</li>)}</ul>
        </div>
        <div className="reveal spot rounded-xl border border-kraft/40 bg-gradient-to-br from-forest to-forest-2 p-6 sm:p-8" style={dl(120)}>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-kraft-soft"><Check size={14} /> With Paperhaven</p>
          <ul className="mt-5 space-y-4">{withPh.map((t) => <li key={t} className="flex gap-3 text-paper"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-kraft-soft" /> {t}</li>)}</ul>
        </div>
      </div>
    </Section>
  )
}

type Cell = { v: 'yes' | 'no' | 'part'; t: string }
const COMPARE: { row: string; cols: [Cell, Cell, Cell, Cell] }[] = [
  { row: 'Measurements kept with each batch', cols: [{ v: 'part', t: 'Separate tabs' }, { v: 'no', t: 'Lab book' }, { v: 'part', t: 'Commercial fields only' }, { v: 'yes', t: 'Dated, with method' }] },
  { row: 'Missing readings handled honestly', cols: [{ v: 'no', t: 'Blank = zero' }, { v: 'no', t: 'Assumed' }, { v: 'no', t: 'Not tracked' }, { v: 'yes', t: '“Unavailable”, with reason' }] },
  { row: 'Weighted cost, moisture and non-paper together', cols: [{ v: 'part', t: 'If the formulas are right' }, { v: 'no', t: 'By hand' }, { v: 'part', t: 'Cost only' }, { v: 'yes', t: 'Live, per scenario' }] },
  { row: 'Checked against your specification', cols: [{ v: 'part', t: 'Manual' }, { v: 'part', t: 'Experience' }, { v: 'no', t: 'Out of scope' }, { v: 'yes', t: 'Your own ranges' }] },
  { row: 'Every number traceable', cols: [{ v: 'no', t: 'Hidden formulas' }, { v: 'no', t: 'Memory' }, { v: 'part', t: 'Partly' }, { v: 'yes', t: 'Formula and inputs shown' }] },
  { row: 'A record of who changed what', cols: [{ v: 'no', t: 'Overwritten' }, { v: 'no', t: 'None' }, { v: 'part', t: 'Some fields' }, { v: 'yes', t: 'Append-only audit log' }] },
]

function CompareSection() {
  const heads = ['Spreadsheets', 'Experience & lab books', 'ERP purchasing', 'Paperhaven']
  const Icon = ({ v }: { v: Cell['v'] }) => (v === 'yes' ? <Check size={15} className="shrink-0 text-forest" aria-label="Yes" /> : v === 'no' ? <X size={15} className="shrink-0 text-rust" aria-label="No" /> : <Minus size={15} className="shrink-0 text-ochre" aria-label="Partly" />)
  return (
    <Section id="compare">
      <SectionHeading eyebrow="Why Paperhaven" title="How it compares with the way blends are planned today">
        <p>Paperhaven works alongside your lab, your purchasing system and your planners’ experience — it gives them one trustworthy record to plan from.</p>
      </SectionHeading>
      <div className="reveal mt-12 overflow-x-auto rounded-xl border border-line bg-white/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b border-line bg-paper-2"><th className="p-4 font-normal"><span className="sr-only">Capability</span></th>{heads.map((h, i) => <th key={h} className={`p-4 font-semibold ${i === 3 ? 'bg-forest text-paper' : 'text-graphite'}`}>{h}</th>)}</tr></thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.row} className="border-b border-line last:border-0">
                <th scope="row" className="p-4 font-medium">{r.row}</th>
                {r.cols.map((c, i) => <td key={i} className={`p-4 align-top ${i === 3 ? 'bg-forest-soft/60' : ''}`}><span className={`flex gap-2 ${i === 3 ? 'font-medium' : 'text-slate'}`}><Icon v={c.v} /> {c.t}</span></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export function HomePage() {
  usePageMeta(
    'Paperhaven — Recovered-paper assessment and blend planning',
    'Compare incoming recovered-paper batches, explore blend proportions, and understand material costs using the measurements your team trusts.',
    '/',
  )
  const word = useCycle(OUTCOME_WORDS, 2400)
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_left,black_40%,transparent_75%)]" aria-hidden />
        <div className="absolute inset-0 texture-fibre" aria-hidden />
        <div className="hero-glow pointer-events-none absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-kraft/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-24">
          <div>
            <Link to="/contact" className="reveal group inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs text-graphite backdrop-blur hover:border-forest">
              <span className="live-dot" aria-hidden /> Early access open · pilots on one yard or mill <ArrowRight size={13} className="text-forest transition-transform group-hover:translate-x-0.5" />
            </Link>
            <h1 className="reveal mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-balance text-ink sm:text-5xl lg:text-[56px]" style={dl(80)}>
              Turn recovered-paper variability into a clear production plan — instead of{' '}
              <span className="sr-only">rejected loads, off-spec blends, margin surprises or guesswork.</span>
              <span aria-hidden className="block min-h-[1.1em]"><span key={word} className="word-in"><span className="text-shimmer">{word}</span></span></span>
            </h1>
            <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-slate" style={dl(160)}>
              Compare incoming batches, plan blends against your own specification, and see true material cost — calculated only from the measurements your team trusts.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={dl(240)}>
              <ButtonLink to="/contact" size="lg" icon={<ArrowRight size={16} />}>Request early access</ButtonLink>
              <ButtonLink to="/planner/blend" size="lg" variant="secondary">Explore the live demo</ButtonLink>
            </div>
            <dl className="reveal mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6" style={dl(320)}>
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
          <div className="reveal relative" style={dl(380)}>
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-kraft/20 to-forest/10 blur-2xl" aria-hidden />
            <div className="relative"><ProductPreview /></div>
            <FloatCard className="float -left-6 -top-8 hidden lg:flex" icon={<AlertTriangle size={16} className="text-ochre" />} title="Moisture unavailable" body="DEMO-B103 not measured — blend value withheld, not zeroed" />
            <FloatCard className="float-slow -bottom-10 right-4 hidden lg:flex" icon={<CheckCircle2 size={16} className="text-forest" />} title="Within specification" body="Weighted non-paper inside your configured range" style={{ animationDelay: '-2s' }} />
          </div>
        </div>
      </section>
      <Marquee />

      {/* A. Challenge */}
      <Section id="problem">
        <SectionHeading eyebrow="The problem" title="Recovered fibre is bought by grade, but paid for by the tonne of water, plastic and fibre that actually arrives." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">{PROBLEM_STATS.map((st, i) => <Stat key={st.label} {...st} delay={i * 120} />)}</div>
        <p className="mt-4 text-xs text-slate">Published figures from third-party sources, linked above. They describe the wider recovered-paper industry, not Paperhaven results.</p>
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading title="Recovered fibre is variable. Your plan shouldn't be guesswork.">
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
                  <li key={t as string} className="reveal lift flex gap-3 rounded-lg border border-line bg-white/70 p-4">
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

      <SolutionSection />

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
      <Section id="who" tone="paper-2">
        <SectionHeading eyebrow="Built for the recovered-paper industry" title="For the teams who buy, process and consume recovered fibre." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Factory, title: 'Paper mills', scene: 'mill' as const, body: 'Production planners and fibre buyers comparing supply against the specification for each grade they make.', href: '/solutions#mills' },
            { icon: Boxes, title: 'Recycling processors', scene: 'warehouse' as const, body: 'Material recovery facilities and processors keeping consistent records of what goes out in every bale.', href: '/solutions#processors' },
            { icon: Truck, title: 'Recovered-fibre suppliers', scene: 'inspection' as const, body: 'Traders and suppliers presenting batches with complete, dated measurements to their mill customers.', href: '/solutions#suppliers' },
          ].map(({ icon: I, title, body, scene, href }) => (
            <Link key={title} to={href} className="reveal lift group overflow-hidden rounded-lg border border-line bg-white/80">
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

      <CompareSection />
      <AiSection />
      <SafeguardsSection />
      <TechnologySection />
      <PricingSection />
      <RoadmapSection />
      <TeamSection />
      <FaqSection />
      <EarlyAccessSection />
      <CtaBand />
    </>
  )
}

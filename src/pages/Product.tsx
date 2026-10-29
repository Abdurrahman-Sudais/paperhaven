import { ArrowRight, BookOpenCheck, Calculator, ClipboardList, FileSearch, Filter, Layers, ListChecks, Sparkles, Table2 } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { CtaBand, FeatureCard, PageHero, Section, SectionHeading } from '../components/site/Section'
import { ProductPreview } from '../components/site/ProductPreview'
import { ProvenanceLegend } from '../components/ui/Provenance'
import { usePageMeta } from '../lib/usePageMeta'

export function ProductPage() {
  usePageMeta('Product', 'Batch records, blend scenarios, specification checks and traceable cost calculations for recovered-paper buyers and planners.', '/product')
  return (
    <>
      <PageHero eyebrow="Platform" title="A working record of your recovered fibre — from receipt to blend." aside={<ProductPreview />}>
        <p>Paperhaven brings batch records, measurements, inspection evidence and blend planning into one system that shows its working.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/planner" size="lg" icon={<ArrowRight size={16} />}>Try the interactive demo</ButtonLink>
          <ButtonLink to="/pricing" size="lg" variant="secondary">See proposed pricing</ButtonLink>
        </div>
      </PageHero>

      <Section>
        <SectionHeading eyebrow="Modules" title="Four modules, one dataset." />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Table2 size={18} />} title="Batch inventory">Search, filter by grade, supplier and measurement completeness, and sort by cost, quantity or moisture.</FeatureCard>
          <FeatureCard icon={<Layers size={18} />} title="Blend planner">Select batches, set proportions, and calculate quantity, cost and weighted measured properties.</FeatureCard>
          <FeatureCard icon={<ListChecks size={18} />} title="Specifications">Configure target ranges for your blends. Checks compare only available measurements to your thresholds.</FeatureCard>
          <FeatureCard icon={<ClipboardList size={18} />} title="Reports">Compare saved scenarios and export calculation summaries for purchasing and production meetings.</FeatureCard>
        </div>
      </Section>

      <Section tone="paper-2">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Provenance" title="Know what kind of number you are looking at.">
              <p>Paperhaven separates four kinds of value throughout the interface so that a calculated result is never mistaken for a measurement, and a suggestion is never mistaken for either.</p>
            </SectionHeading>
          </div>
          <div className="rounded-lg border border-line bg-white/80 p-6">
            <ProvenanceLegend className="flex-col !gap-4 [&_span.hidden]:inline" />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Assistance" title="AI that drafts, never decides.">
            <p>The assistance panel can summarise inspection notes, extract fields from inspection documents, highlight incomplete records and suggest questions to raise with a supplier.</p>
            <p className="mt-3">Suggestions are labelled, kept separate from records, and must be reviewed by a person before anything is saved. In the demo, assistance is simulated with deterministic rules.</p>
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard icon={<Sparkles size={18} />} title="Summarise notes">Groups inspection and contamination notes by theme for faster review.</FeatureCard>
            <FeatureCard icon={<FileSearch size={18} />} title="Extract fields">Pulls labelled values from an inspection document and compares them to the record.</FeatureCard>
            <FeatureCard icon={<Filter size={18} />} title="Find gaps">Lists batches missing measurements, dates, notes or inspection reports.</FeatureCard>
            <FeatureCard icon={<BookOpenCheck size={18} />} title="Buyer questions">Suggests what to ask a supplier based on what the record shows and lacks.</FeatureCard>
          </div>
        </div>
        <div className="mt-10 rounded-lg border border-ai/25 bg-ai-soft/60 p-5 text-sm text-graphite">
          <strong className="text-ai">What assistance does not do.</strong> Paperhaven does not estimate moisture content, fibre strength, chemical composition or other material properties from photographs or descriptions. Those properties need appropriate measurements, and the platform treats them as missing until measured.
        </div>
      </Section>

      <Section tone="paper-2">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <SectionHeading eyebrow="Calculations" title="Deterministic and open to inspection.">
            <p>Totals and weighted averages are plain arithmetic, implemented as small tested functions. Each result in the planner opens to show its formula and inputs.</p>
          </SectionHeading>
          <ButtonLink to="/blend-planner" variant="secondary" icon={<Calculator size={14} />}>How the Blend Planner calculates</ButtonLink>
        </div>
      </Section>
      <CtaBand />
    </>
  )
}

import { Mail } from 'lucide-react'
import { CtaBand, PageHero, Section, SectionHeading } from '../components/site/Section'
import { MaterialScene } from '../components/site/MaterialScene'
import { usePageMeta } from '../lib/usePageMeta'

export function AboutPage() {
  usePageMeta('About', 'Paperhaven was founded by Ifeoma Ezeani to help recycling businesses and paper mills make every recovered-paper batch count.', '/about')
  return (
    <>
      <PageHero eyebrow="About" title="Make every recovered-paper batch count." aside={<MaterialScene scene="bales" caption="Recovered fibre, ready for planning" className="aspect-[16/11]" />}>
        <p>Paperhaven builds software for the people who buy, process and use recovered paper — so that decisions about material rest on the measurements behind them.</p>
      </PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading eyebrow="Why we exist" title="Recovered fibre deserves better records.">
            <p>Recovered paper is a valuable raw material, but information about it often lives in spreadsheets, inboxes and handwritten notes. When a measurement is missing, it is easy for it to be quietly assumed.</p>
            <p className="mt-3">Paperhaven keeps batch records, measurements and calculations together, and is explicit about what is known, what was entered, what was suggested and what was calculated.</p>
          </SectionHeading>
          <div className="rounded-lg border border-line bg-white/80 p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-forest">Founder</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Ifeoma Ezeani</h3>
            <p className="mt-3 text-slate">Ifeoma founded Paperhaven to bring the precision of industrial planning software to the recovered-paper supply chain.</p>
            <a href="mailto:ifeoma@paperhaven.top" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline">
              <Mail size={14} /> ifeoma@paperhaven.top
            </a>
          </div>
        </div>
      </Section>
      <Section tone="paper-2">
        <SectionHeading eyebrow="What we believe" title="Principles" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ['Measured beats assumed', 'A missing value is information. We show it rather than hide it.'],
            ['Show the working', 'Every calculation can be traced to the inputs that produced it.'],
            ['People decide', 'Assistance drafts and highlights. People review and record.'],
          ].map(([t, d]) => (
            <div key={t} className="border-l-2 border-kraft pl-4">
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

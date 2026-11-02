import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Check, Clock, Compass, Lock, Mail, Rocket, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Section, SectionHeading } from '../components/site/Section'
import { LeadForm } from '../components/site/LeadForm'
import { FOUNDERS, SITE, type Person } from '../config/site'
import { cx } from '../lib/format'
import { PLANS } from './Pricing'
import { PIPELINE, SAFEGUARDS } from './Trust'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function AiSection() {
  return (
    <Section tone="paper-2">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <SectionHeading eyebrow="AI, used carefully" title="Answers from your own batch records, not guesses.">
            <p>Paperhaven’s assistant explains what the measurements and calculations show. The numbers come from deterministic formulas you can trace; the wording only makes them easier to read.</p>
          </SectionHeading>
          <ul className="mt-8 space-y-3">
            {(
              [
                [true, 'Summarise a batch: grade, supplier, stock, cost, measurements and gaps'],
                [true, 'Answer “which batches are missing measurements?” and “which scenarios meet the specification?”'],
                [true, 'Suggest values from inspection reports for a person to confirm'],
                [true, 'List the records it used, so every answer can be checked'],
                [false, 'Fill in a missing moisture or non-paper reading'],
                [false, 'Predict sheet strength, brightness or machine performance'],
              ] as const
            ).map(([ok, t], i) => (
              <li key={t} className="reveal lift flex gap-3 rounded-lg border border-line bg-white/80 p-4 text-sm text-graphite" style={d(i * 60)}>
                {ok ? <Check size={16} className="mt-0.5 shrink-0 text-forest" aria-label="Does" /> : <X size={16} className="mt-0.5 shrink-0 text-rust" aria-label="Never does" />}
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal relative" style={d(120)}>
          <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-kraft/20 blur-2xl" aria-hidden />
          <div className="relative rounded-xl bg-ink p-6 text-paper shadow-2xl shadow-ink/30">
            <div className="flex items-center gap-2 text-sm font-medium"><Bot size={16} className="text-kraft-soft" /> Ask about this yard <span className="rounded border border-paper/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper/60">Sample data</span></div>
            <p className="ml-auto mt-5 w-fit max-w-[85%] rounded-lg rounded-br-sm bg-kraft/20 px-3 py-2 text-sm">Which batches are missing measurements?</p>
            <div className="mt-3 max-w-[92%] rounded-lg rounded-bl-sm border border-paper/10 bg-paper/5 p-3 text-sm text-paper/85">
              <p>Two batches lack a moisture reading. Any blend using them shows weighted moisture as <em>unavailable</em> rather than assuming zero.</p>
              <p className="mt-3 font-mono text-[11px] text-paper/50">From records DEMO-B10…</p>
            </div>
            <p className="ml-auto mt-4 w-fit rounded-lg rounded-br-sm bg-kraft/20 px-3 py-2 text-sm">What will the sheet strength be?</p>
            <div className="mt-3 max-w-[92%] rounded-lg rounded-bl-sm border border-paper/10 bg-paper/5 p-3 text-sm text-paper/70">That needs mill testing, not a guess. I can show how each scenario compares with your specification.</div>
            <Link to="/planner" className="mt-6 inline-flex items-center gap-2 rounded-md bg-paper px-3.5 py-2 text-sm font-medium text-ink hover:bg-paper-2">Try the assistant in the demo <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </Section>
  )
}

export function SafeguardsSection() {
  return (
    <Section tone="ink">
      <SectionHeading inverse eyebrow="Safeguards" title="Measurements in. Honest numbers out." />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAFEGUARDS.map(([t, b], i) => (
          <div key={t} className="reveal lift rounded-lg border border-paper/10 bg-paper/5 p-6 hover:border-kraft/50" style={d((i % 3) * 90)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-kraft/15"><ShieldCheck size={18} className="text-kraft-soft" /></span>
            <h3 className="mt-4 font-semibold text-paper">{t}</h3>
            <p className="mt-2 text-sm text-paper/65">{b}</p>
          </div>
        ))}
      </div>
      <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-kraft-soft hover:underline">Security and safeguards in detail <ArrowRight size={15} /></Link>
    </Section>
  )
}

export function TechnologySection() {
  return (
    <Section id="technology" tone="paper-2">
      <SectionHeading eyebrow="Technology" title="How we use Amazon Web Services">
        <p>A proposed serverless architecture: capture at the yard, keep every number traceable to a measurement, keep the calculations deterministic, and use Amazon Bedrock only to explain.</p>
      </SectionHeading>
      <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {PIPELINE.map((p, i) => (
          <li key={p.step} className="reveal lift spot rounded-lg border border-line bg-white/80 p-5" style={d(i * 90)}>
            <span className="font-mono text-xs text-forest">{p.step}</span>
            <h3 className="mt-2 font-semibold">{p.title}</h3>
            <p className="mt-1 font-mono text-[11px] text-kraft-dark">{p.services}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate">{p.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-slate">These services are proposed, not deployed. The demo runs in your browser on fictional data. <Link to="/technology" className="text-forest underline">The full architecture</Link></p>
    </Section>
  )
}

export function PricingSection() {
  return (
    <Section id="pricing">
      <SectionHeading eyebrow="Pricing" title="Simple plans for every size of operation." center />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <div key={p.name} className={cx('reveal lift spot relative flex flex-col rounded-xl border p-6', p.featured ? 'border-forest bg-forest text-paper' : 'border-line bg-white/80')} style={d(i * 100)}>
            {p.featured && <span className="absolute -top-3 left-6 rounded-full bg-kraft px-2.5 py-0.5 text-xs font-medium text-ink">Most popular</span>}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className={cx('mt-1 text-sm', p.featured ? 'text-paper/70' : 'text-slate')}>{p.tagline}</p>
            <div className="mt-4 flex items-baseline gap-1"><span className="text-4xl font-semibold">{p.price}</span><span className={p.featured ? 'text-paper/60' : 'text-slate'}>{p.period}</span></div>
            <ul className="mt-5 flex-1 space-y-2.5">{p.features.map((f) => <li key={f} className={cx('flex gap-2 text-sm', p.featured ? 'text-paper/85' : 'text-graphite')}><Check size={15} className={cx('mt-0.5 shrink-0', p.featured ? 'text-kraft-soft' : 'text-forest')} /> {f}</li>)}</ul>
            <Link to={`/contact?plan=${encodeURIComponent(p.name)}`} className={cx('mt-6 inline-flex justify-center rounded-md px-4 py-2.5 text-sm font-medium', p.featured ? 'bg-paper text-ink hover:bg-paper-2' : 'border border-line-strong hover:border-forest')}>{p.cta}</Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-slate">Proposed prices in USD, excluding taxes. Early-access teams are onboarded directly by the founders. <Link to="/pricing" className="text-forest underline">Compare plans</Link></p>
    </Section>
  )
}

export const ROADMAP = [
  { icon: Sparkles, stage: 'Now', title: 'Live demo & early access', items: ['Interactive planner with fictional yard data', 'Batch records, blend scenarios, specification checks', 'Roles, audit log and grounded assistant', 'Early-access requests open'], current: true },
  { icon: Compass, stage: 'Next', title: 'Pilot on one yard or mill', items: ['Tablet batch capture with document attachments', 'Your own grades, suppliers and specification', 'Scenario sharing and email notifications'] },
  { icon: Rocket, stage: 'Then', title: 'General availability', items: ['Multiple sites and yards', 'Single sign-on with roles enforced on the server', 'Document extraction with person-in-the-loop review', 'Supplier quality scorecards'] },
  { icon: Clock, stage: 'Later', title: 'Exploring with pilot teams', items: ['Weighbridge and ERP integrations', 'Laboratory system imports', 'Shared batch records between suppliers and mills'] },
]

export function RoadmapSection() {
  return (
    <Section id="roadmap" tone="paper-2">
      <SectionHeading eyebrow="Roadmap" title="Where Paperhaven is going">
        <p>Built with early-access teams. The order below is our plan and may change based on what pilots teach us.</p>
      </SectionHeading>
      <ol className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {ROADMAP.map((r, i) => (
          <li key={r.stage} className={cx('reveal lift rounded-xl border bg-white/80 p-6', r.current ? 'border-forest shadow-[0_18px_40px_-24px_rgba(31,77,58,0.5)]' : 'border-line')} style={d(i * 100)}>
            <div className="flex items-center justify-between">
              <span className={cx('flex h-10 w-10 items-center justify-center rounded-md', r.current ? 'bg-forest text-paper' : 'bg-paper-2 text-slate')}><r.icon size={18} /></span>
              <span className={cx('flex items-center gap-2 font-mono text-xs uppercase tracking-wider', r.current ? 'text-forest' : 'text-slate')}>{r.current && <span className="live-dot" aria-hidden />}{r.stage}</span>
            </div>
            <h3 className="mt-4 font-semibold">{r.title}</h3>
            <ul className="mt-3 space-y-2">{r.items.map((t) => <li key={t} className="flex gap-2 text-sm text-slate"><Check size={15} className={cx('mt-0.5 shrink-0', r.current ? 'text-forest' : 'text-line-strong')} /> {t}</li>)}</ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function PersonCard({ person, delay = 0 }: { person: Person; delay?: number }) {
  return (
    <article className="reveal lift spot relative overflow-hidden rounded-2xl border border-paper/10 bg-gradient-to-br from-ink to-forest p-6 text-paper sm:p-8" style={d(delay)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center" aria-hidden>
          <div className="spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#b48a5e,#2b6a4f,#efe2cf,#b48a5e)]" style={{ animationDelay: `-${delay / 10}s` }} />
          <div className="absolute inset-[3px] grid place-items-center rounded-full bg-ink font-mono text-2xl text-kraft-soft">{person.initials}</div>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-kraft-soft">{person.role}</p>
          <h3 className="mt-1 text-2xl font-semibold">{person.name}</h3>
          <p className="mt-3 max-w-xl text-paper/75">{person.bio}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">{person.focus.map((f) => <li key={f} className="rounded-full border border-paper/15 bg-paper/5 px-2.5 py-1 text-xs text-paper/80">{f}</li>)}</ul>
          {person.email && <a href={`mailto:${person.email}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-kraft-soft hover:underline"><Mail size={15} /> {person.email}</a>}
        </div>
      </div>
    </article>
  )
}

export function FoundersGrid() {
  return <div className="grid gap-5 lg:grid-cols-2">{FOUNDERS.map((p, i) => <PersonCard key={p.name} person={p} delay={i * 120} />)}</div>
}

export function TeamSection() {
  return (
    <Section id="team">
      <SectionHeading eyebrow="Team" title="The people building Paperhaven">
        <p>Founded by {FOUNDERS.map((f) => f.name).join(' and ')}, and built together with the fibre buyers, graders and production planners who will use it.</p>
      </SectionHeading>
      <div className="mt-12"><FoundersGrid /></div>
      <div className="reveal mt-5 grid gap-6 rounded-2xl border border-line bg-white/80 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h3 className="text-lg font-semibold">Building with the recovered-paper industry</h3>
          <p className="mt-2 text-sm text-slate">Paperhaven is shaped by conversations with mills, processors and recovered-fibre suppliers. Early-access teams get a direct line to the founders and a say in what we build next.</p>
          <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline">Our story <ArrowRight size={15} /></Link>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate">We’d like to hear from</p>
          <ul className="mt-3 space-y-2 text-sm">{['Yards and mills willing to pilot', 'Fibre buyers and production planners', 'Advisors who know recovered fibre'].map((t) => <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-forest" /> {t}</li>)}</ul>
        </div>
      </div>
    </Section>
  )
}

export const FAQS: [string, string][] = [
  ['Does Paperhaven predict how a blend will perform on the machine?', 'No. It calculates blend tonnage, cost per tonne and weighted moisture and non-paper content from measured batch values, and checks them against the ranges you configure. Mill testing and your team decide how a blend will run.'],
  ['What problem does it actually solve?', 'Two loads sold as the same grade can arrive with different moisture, contamination and usable tonnage, while prices move on their own. Paperhaven keeps every batch’s measurements, documents and cost in one record, so blends are planned from evidence rather than spreadsheets and memory.'],
  ['What happens if a batch has no moisture reading?', 'Any blend that uses it shows weighted moisture as unavailable, with the reason and the missing input — never as zero. The batch’s gaps are listed so someone can measure it.'],
  ['Do you supply grade specifications?', 'No. Your team configures its own ranges. The values in the demo are fictional examples.'],
  ['What does the AI do?', 'It suggests values from inspection reports for a person to confirm, and answers questions from your own records, listing the records used. It never writes to a record, fills in a measurement or predicts sheet quality.'],
  ['Who can change what?', 'Quality managers, blend planners, yard graders and viewers each get only the actions they need, and every change is written to an audit log. Try “Demo as” in the planner.'],
  ['Can suppliers share batch records with us?', 'That is on our roadmap and we are exploring it with pilot teams. Today, suppliers can present batches with complete, dated measurements.'],
  ['How much does it cost?', 'Processor is $79/month and Mill is $249/month; Enterprise is priced per deployment. Prices are proposed and exclude taxes.'],
  ['Is it available today?', 'Paperhaven is in early access. The demo planner runs in your browser on fictional data; a pilot runs on one of your yards or mills. Request early access and one of the founders will reply personally.'],
]

export function FaqSection() {
  return (
    <Section id="faq" tone="paper-2">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <SectionHeading eyebrow="FAQ" title="Questions the industry asks" />
          <a href={`mailto:${SITE.email}`} className="reveal mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline"><Mail size={15} /> Email the founders</a>
        </div>
        <div className="reveal divide-y divide-line rounded-xl border border-line bg-white/80">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{q}<span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-forest transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span></summary>
              <p className="mt-3 text-sm leading-relaxed text-slate">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

export function EarlyAccessSection() {
  return (
    <Section id="early-access">
      <SectionHeading eyebrow="Early access" title="Request early access">
        <p>Early-access teams get guided setup on one yard or mill and a direct say in what we build next.</p>
      </SectionHeading>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal rounded-xl border border-line bg-white/80 p-6 sm:p-8"><LeadForm compact /></div>
        <div className="space-y-5">
          <ul className="space-y-3 text-sm">
            {['Guided setup with the batch data you already keep', 'Direct line to the founders', 'Launch pricing on Processor, Mill or Enterprise', 'No commitment — a request is not a subscription'].map((t) => <li key={t} className="reveal flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-forest" /> {t}</li>)}
            <li className="reveal flex gap-2 text-slate"><Lock size={16} className="mt-0.5 shrink-0" /> Please don’t include confidential supplier pricing.</li>
          </ul>
          <div className="reveal rounded-xl bg-ink p-5 text-paper">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-kraft-soft">What happens next</p>
            <ol className="mt-3 space-y-2 text-sm text-paper/80"><li>1. A founder replies to arrange a short call.</li><li>2. We look at your grades, suppliers and specification.</li><li>3. If it’s a fit, we scope a pilot on one site.</li></ol>
          </div>
        </div>
      </div>
    </Section>
  )
}

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Info } from 'lucide-react'
import { CtaBand, PageHero, Section, SectionHeading } from '../components/site/Section'
import { usePageMeta } from '../lib/usePageMeta'
import { SITE } from '../config/site'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export const PIPELINE = [
  { step: '01', title: 'Receive', services: 'Amazon S3 · AWS AppSync', body: 'Graders record each incoming batch at the yard — grade, supplier, tonnage, cost — and attach weighbridge tickets, inspection reports and photos from a tablet.' },
  { step: '02', title: 'Measure', services: 'Amazon RDS for PostgreSQL', body: 'Moisture and non-paper readings are stored with their date and method. Missing readings stay missing and are listed on the batch.' },
  { step: '03', title: 'Calculate', services: 'AWS Lambda', body: 'Deterministic jobs compute blend tonnage, cost per tonne and weighted moisture and non-paper content, and check them against your own specification ranges.' },
  { step: '04', title: 'Explain', services: 'Amazon Bedrock · Amazon Textract', body: 'Document extraction suggests values for a person to confirm, and the assistant answers from calculated results. The model never writes to a record or fills a gap.' },
  { step: '05', title: 'Plan & share', services: 'Amazon Cognito · Amazon SES', body: 'Planners save and compare scenarios; quality managers own the specification. Reports export for buyers and mill customers, and every change is audited.' },
]

const SERVICES: [string, string][] = [
  ['Amazon S3', 'Stores weighbridge tickets, inspection reports, photos and exports with encryption and lifecycle rules.'],
  ['AWS AppSync', 'Syncs batch capture from devices at the yard, including when the network drops.'],
  ['Amazon RDS for PostgreSQL', 'Batches, measurements, scenarios, specifications and the append-only audit log.'],
  ['AWS Lambda', 'Blend calculations, specification checks, completeness checks and CSV exports.'],
  ['Amazon Textract', 'Reads values from inspection reports as suggestions — a person confirms before saving.'],
  ['Amazon Bedrock', 'Summarises notes and answers questions from calculated results and the records a user may see.'],
  ['Amazon Cognito', 'Sign-in, single sign-on and role groups for quality managers, planners, graders and viewers.'],
  ['Amazon SES', 'Scenario and review notifications by email.'],
  ['Amazon CloudWatch', 'Monitoring and alarms for sync, uploads and failed jobs.'],
  ['AWS KMS', 'Customer-specific encryption keys for data at rest.'],
]

export const SAFEGUARDS: [string, string][] = [
  ['Missing is never zero', 'If a batch in the blend lacks a moisture or non-paper reading, that weighted value is shown as unavailable — with the reason — not calculated from a guess.'],
  ['Every number is traceable', 'Each result shows its formula and inputs under “How this is calculated”.'],
  ['Your specification, your ranges', 'Paperhaven ships no universal limits. Checks only use the ranges your team configures.'],
  ['AI suggests, people save', 'Extracted values only open the edit form for a person to confirm. Nothing writes to a record on its own.'],
  ['Roles, enforced', 'Quality managers, planners, graders and viewers each get only the actions they need. The demo checks every action; production enforces it on the server.'],
  ['Everything audited', 'Batch edits, documents, saved scenarios and specification changes are written to an append-only audit log the quality manager can export.'],
]

const SECURITY: [string, string][] = [
  ['Encryption', 'TLS 1.2+ in transit; AWS KMS encryption at rest for databases and document storage.'],
  ['Customer isolation', 'Every record carries a customer identifier filtered on every query; supplier pricing never crosses tenants.'],
  ['Single sign-on', 'Sign in with your identity provider through Amazon Cognito, with multi-factor authentication for managers.'],
  ['Least privilege', 'Each service gets only the permissions it needs; no human uses root credentials.'],
  ['Data minimisation', 'Batch and measurement records only. No personal data is sent to AI models.'],
  ['Data portability', 'Batches, scenarios and reports export to CSV at any time; they remain yours.'],
]

export function TechnologyPage() {
  usePageMeta('Technology', 'How Paperhaven proposes to use AWS: batch capture at the yard, measured values with dates and methods, deterministic blend calculations, and Amazon Bedrock for grounded explanations.', '/technology')
  return (
    <>
      <PageHero eyebrow="Technology" title="How we use Amazon Web Services">
        <p>A proposed architecture for moving from this browser demo to a production service: capture at the yard, keep every number traceable to a measurement, keep the calculations deterministic, and use AI only to suggest and explain.</p>
      </PageHero>
      <Section>
        <SectionHeading eyebrow="Pipeline" title="From the weighbridge to a saved blend." />
        <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((p, i) => (
            <li key={p.step} className="reveal lift spot rounded-lg border border-line bg-white/70 p-5" style={d(i * 80)}>
              <span className="font-mono text-xs text-forest">{p.step}</span>
              <h3 className="mt-2 font-semibold">{p.title}</h3>
              <p className="mt-1 font-mono text-[11px] text-kraft-dark">{p.services}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate">{p.body}</p>
            </li>
          ))}
        </ol>
        <div className="reveal mt-8 flex gap-3 rounded-lg border border-ochre/30 bg-ochre-soft p-4 text-sm text-ochre"><Info size={16} className="mt-0.5 shrink-0" /><p><strong>Proposed, not deployed.</strong> None of these services are connected to this website or the demo planner, which run entirely in your browser on fictional data.</p></div>
      </Section>
      <Section tone="paper-2">
        <SectionHeading eyebrow="Services" title="What each service does." />
        <dl className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(([n, b], i) => <div key={n} className="reveal rounded-lg border border-line bg-white/70 p-5" style={d((i % 3) * 80)}><dt className="font-semibold">{n}</dt><dd className="mt-2 text-sm text-slate">{b}</dd></div>)}
        </dl>
        <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline">Security and safeguards <ArrowRight size={15} /></Link>
      </Section>
      <CtaBand />
    </>
  )
}

export function SecurityPage() {
  usePageMeta('Security & safeguards', 'How Paperhaven keeps planning honest: missing readings never treated as zero, traceable calculations, your own specification ranges, role-based access and an audit log.', '/security')
  return (
    <>
      <PageHero eyebrow="Security & safeguards" title="Measurements in. Honest numbers out.">
        <p>The demo already enforces the safeguards below. The security controls describe the proposed production design.</p>
      </PageHero>
      <Section>
        <SectionHeading eyebrow="Planning safeguards" title="Built into the demo you can try today." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAFEGUARDS.map(([t, b], i) => <div key={t} className="reveal lift spot rounded-lg border border-line bg-white/70 p-6" style={d((i % 3) * 80)}><Check size={18} className="text-forest" /><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-2 text-sm text-slate">{b}</p></div>)}
        </div>
        <Link to="/planner/audit" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline">See roles and the audit log in the demo <ArrowRight size={15} /></Link>
      </Section>
      <Section tone="ink">
        <SectionHeading inverse eyebrow="Proposed security design" title="Controls for the production service." />
        <dl className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SECURITY.map(([t, b], i) => <div key={t} className="reveal rounded-lg border border-paper/10 bg-paper/5 p-5" style={d((i % 3) * 80)}><dt className="font-semibold text-paper">{t}</dt><dd className="mt-2 text-sm text-paper/70">{b}</dd></div>)}
        </dl>
        <p className="mt-6 max-w-3xl text-sm text-paper/60">These controls are part of the proposed architecture and are not yet independently audited or certified.</p>
      </Section>
      <CtaBand />
    </>
  )
}

const PRIVACY: [string, string][] = [
  ['What this website is', 'This website describes Paperhaven and includes an interactive demo planner that runs entirely in your browser on fictional data. No weighbridges, laboratories or customer systems are connected.'],
  ['Demo data in your browser', 'Batches, scenarios, the specification, the chosen demo user and the demo audit log are saved in your browser’s local storage under keys beginning paperhaven:v1:. That data never leaves your device. “Reset demo data” in Settings, or clearing site data, removes it.'],
  ['Early-access requests', `Until a form service is configured, the early-access form saves your request in your browser (key paperhaven:v1:enquiries) and offers a pre-filled email to ${SITE.email}; nothing is sent until you send that email. If the operator connects the form to a customer-relationship service (proposed: HubSpot), submitting it sends the fields you enter, your consent choices and the page address to that service so Paperhaven can reply. Product updates are sent only if you tick the optional box. This notice must be updated with the confirmed service and retention before that is switched on.`],
  ['Analytics and cookies', 'This website includes no analytics or advertising trackers and sets no cookies. A hosting provider may process routine request data to serve and protect the site.'],
  ['Your requests', `Contact ${SITE.email} with questions about information you have sent to Paperhaven, or to ask for it to be corrected or deleted.`],
]

const TERMS: [string, string][] = [
  ['Demonstration only', 'The planner is a demonstration on fictional data. It is not a production planning system and must not be used for real purchasing or production decisions.'],
  ['No quality predictions', 'Paperhaven calculates from measured values and checks them against ranges you configure. It does not predict sheet strength, brightness or machine performance, and never fills in missing measurements.'],
  ['Pricing and availability', 'Prices shown are proposed and exclude taxes. Early-access requests do not create a subscription or any commitment.'],
  ['Use of the site', 'Use the site and demo lawfully. Do not enter confidential supplier pricing or personal information into the demo or the request form.'],
  ['Changes', 'These terms are a review draft. Operator details, governing law and production service terms will be set out separately before launch.'],
]

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy'
  usePageMeta(privacy ? 'Privacy notice' : 'Terms of use', privacy ? 'How the Paperhaven website and demo planner handle information.' : 'Terms for using the Paperhaven website and demonstration planner.', privacy ? '/privacy' : '/terms')
  return (
    <>
      <PageHero eyebrow="Review draft · operator details to be confirmed" title={privacy ? 'Privacy notice' : 'Terms of use'}>
        <p>{privacy ? 'How this website and its demo planner handle information.' : 'Terms for using this website and its demonstration planner.'}</p>
      </PageHero>
      <Section>
        <div className="max-w-3xl space-y-8">
          {(privacy ? PRIVACY : TERMS).map(([t, b]) => <div key={t} className="reveal"><h2 className="text-lg font-semibold">{t}</h2><p className="mt-2 leading-relaxed text-slate">{b}</p></div>)}
          <p className="text-sm text-slate">Contact: <a href={`mailto:${SITE.email}`} className="text-forest underline">{SITE.email}</a></p>
        </div>
      </Section>
    </>
  )
}

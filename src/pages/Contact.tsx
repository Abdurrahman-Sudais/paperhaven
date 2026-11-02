import { useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { PageHero, Section } from '../components/site/Section'
import { LeadForm } from '../components/site/LeadForm'
import { usePageMeta } from '../lib/usePageMeta'
import { FOUNDERS, SITE } from '../config/site'

export function ContactPage() {
  usePageMeta('Request early access', `Request early access to Paperhaven for recovered-paper assessment and blend planning. Email ${SITE.email}.`, '/contact')
  const [params] = useSearchParams()
  return (
    <>
      <PageHero eyebrow="Early access" title="Talk to us about your yard, mill or supply.">
        <p>Tell us how your team assesses and plans recovered paper today. A founder will reply to arrange a walkthrough.</p>
      </PageHero>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="reveal rounded-xl border border-line bg-white/80 p-6 sm:p-8"><LeadForm initialPlan={params.get('plan') ?? ''} /></div>
          <aside className="reveal space-y-6">
            <div className="rounded-lg border border-line bg-white/80 p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-forest">Founders</p>
              <ul className="mt-3 space-y-3">
                {FOUNDERS.map((f) => (
                  <li key={f.name} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest font-mono text-xs text-paper">{f.initials}</span>
                    <span><span className="block font-semibold">{f.name}</span><span className="block text-xs text-slate">{f.role}</span></span>
                  </li>
                ))}
              </ul>
              <a href={`mailto:${SITE.email}`} className="mt-4 inline-flex items-center gap-2 border-t border-line pt-4 text-sm font-medium text-forest hover:underline"><Mail size={14} /> {SITE.email}</a>
            </div>
            <p className="text-sm text-slate">We usually reply within two working days. For a quick look first, open the demo planner — it runs in your browser with fictional data.</p>
          </aside>
        </div>
      </Section>
    </>
  )
}

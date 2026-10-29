import { Check, Info } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { Badge } from '../components/ui/Card'
import { CtaBand, PageHero, Section } from '../components/site/Section'
import { cx } from '../lib/format'
import { usePageMeta } from '../lib/usePageMeta'

const PLANS = [
  {
    name: 'Processor',
    price: '$79',
    period: '/month',
    tagline: 'For smaller recovered-paper operations.',
    features: ['Batch inventory and records', 'Measurement completeness tracking', 'Document attachments', 'Up to 3 users', 'Email support'],
    cta: 'Request access',
  },
  {
    name: 'Mill',
    price: '$249',
    period: '/month',
    tagline: 'For production teams comparing batches and blend scenarios.',
    features: ['Everything in Processor', 'Blend planner and saved scenarios', 'Configurable specifications', 'Scenario comparison reports', 'AI assistance panel', 'Up to 15 users'],
    cta: 'Request access',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For multi-site operations with advanced workflow requirements.',
    features: ['Everything in Mill', 'Multiple sites and yards', 'Approval workflows', 'Integrations with ERP and weighbridge systems', 'Single sign-on', 'Dedicated onboarding'],
    cta: 'Contact us',
  },
]

export function PricingPage() {
  usePageMeta('Pricing', 'Proposed pricing for Paperhaven: Processor $79/month, Mill $249/month, and custom Enterprise plans.', '/pricing')
  return (
    <>
      <PageHero eyebrow="Pricing" title="Simple plans for every size of operation.">
        <p>
          <Badge tone="ochre" icon={<Info size={12} />}>Proposed pricing</Badge>
          <span className="ml-2">Prices are illustrative and subject to change before general availability.</span>
        </p>
      </PageHero>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={cx('flex flex-col rounded-xl border bg-white/80 p-7', p.featured ? 'border-forest shadow-lg ring-1 ring-forest/30' : 'border-line')}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">{p.name}</h2>
                {p.featured && <Badge tone="forest">Most suitable for mills</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate">{p.tagline}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tabular text-ink">{p.price}</span>
                <span className="text-slate">{p.period}</span>
              </p>
              <p className="mt-1 text-xs text-slate">Proposed pricing · USD</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-graphite"><Check size={16} className="mt-0.5 shrink-0 text-forest" />{f}</li>
                ))}
              </ul>
              <ButtonLink to="/contact" variant={p.featured ? 'primary' : 'secondary'} className="mt-8 w-full">{p.cta}</ButtonLink>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate">All plans are proposed and not yet available for purchase. No payment is collected on this site.</p>
      </Section>
      <CtaBand />
    </>
  )
}

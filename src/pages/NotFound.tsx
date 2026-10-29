import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { PageHero } from '../components/site/Section'
import { usePageMeta } from '../lib/usePageMeta'

export function NotFoundPage() {
  usePageMeta('Page not found', 'The page you were looking for could not be found.', '/404')
  return (
    <PageHero eyebrow="404" title="This page could not be found.">
      <p>The link may be out of date.</p>
      <div className="mt-6"><ButtonLink to="/" icon={<ArrowRight size={14} />}>Back to home</ButtonLink></div>
    </PageHero>
  )
}

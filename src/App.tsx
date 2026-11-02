import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/site/SiteLayout'
import { HomePage } from './pages/Home'
import { NotFoundPage } from './pages/NotFound'
import { PlannerProvider } from './state/PlannerContext'
import { AppLayout } from './app/AppLayout'

// The home page ships in the main bundle; every other page, and the planner, loads on demand.
const ProductPage = lazy(() => import('./pages/Product').then((m) => ({ default: m.ProductPage })))
const BlendPlannerInfoPage = lazy(() => import('./pages/BlendPlannerInfo').then((m) => ({ default: m.BlendPlannerInfoPage })))
const HowItWorksPage = lazy(() => import('./pages/HowItWorks').then((m) => ({ default: m.HowItWorksPage })))
const SolutionsPage = lazy(() => import('./pages/Solutions').then((m) => ({ default: m.SolutionsPage })))
const PricingPage = lazy(() => import('./pages/Pricing').then((m) => ({ default: m.PricingPage })))
const AboutPage = lazy(() => import('./pages/About').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('./pages/Contact').then((m) => ({ default: m.ContactPage })))
const TechnologyPage = lazy(() => import('./pages/Trust').then((m) => ({ default: m.TechnologyPage })))
const SecurityPage = lazy(() => import('./pages/Trust').then((m) => ({ default: m.SecurityPage })))
const LegalPage = lazy(() => import('./pages/Trust').then((m) => ({ default: m.LegalPage })))
const OverviewPage = lazy(() => import('./app/Overview').then((m) => ({ default: m.OverviewPage })))
const BatchesPage = lazy(() => import('./app/Batches').then((m) => ({ default: m.BatchesPage })))
const BlendPlannerPage = lazy(() => import('./app/BlendPlanner').then((m) => ({ default: m.BlendPlannerPage })))
const SpecificationsPage = lazy(() => import('./app/Specifications').then((m) => ({ default: m.SpecificationsPage })))
const ReportsPage = lazy(() => import('./app/Reports').then((m) => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('./app/Settings').then((m) => ({ default: m.SettingsPage })))
const AuditPage = lazy(() => import('./app/Audit').then((m) => ({ default: m.AuditPage })))

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="product" element={<ProductPage />} />
        <Route path="blend-planner" element={<BlendPlannerInfoPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="solutions" element={<SolutionsPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="technology" element={<TechnologyPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="planner" element={<PlannerProvider><AppLayout /></PlannerProvider>}>
        <Route index element={<OverviewPage />} />
        <Route path="batches" element={<BatchesPage />} />
        <Route path="blend" element={<BlendPlannerPage />} />
        <Route path="specifications" element={<SpecificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

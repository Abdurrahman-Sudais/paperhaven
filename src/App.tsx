import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/site/SiteLayout'
import { HomePage } from './pages/Home'
import { ProductPage } from './pages/Product'
import { BlendPlannerInfoPage } from './pages/BlendPlannerInfo'
import { HowItWorksPage } from './pages/HowItWorks'
import { SolutionsPage } from './pages/Solutions'
import { PricingPage } from './pages/Pricing'
import { AboutPage } from './pages/About'
import { ContactPage } from './pages/Contact'
import { NotFoundPage } from './pages/NotFound'
import { PlannerProvider } from './state/PlannerContext'
import { AppLayout } from './app/AppLayout'

// Planner screens are loaded on demand so the marketing site stays light.
const OverviewPage = lazy(() => import('./app/Overview').then((m) => ({ default: m.OverviewPage })))
const BatchesPage = lazy(() => import('./app/Batches').then((m) => ({ default: m.BatchesPage })))
const BlendPlannerPage = lazy(() => import('./app/BlendPlanner').then((m) => ({ default: m.BlendPlannerPage })))
const SpecificationsPage = lazy(() => import('./app/Specifications').then((m) => ({ default: m.SpecificationsPage })))
const ReportsPage = lazy(() => import('./app/Reports').then((m) => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('./app/Settings').then((m) => ({ default: m.SettingsPage })))

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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="planner" element={<PlannerProvider><AppLayout /></PlannerProvider>}>
        <Route index element={<OverviewPage />} />
        <Route path="batches" element={<BatchesPage />} />
        <Route path="blend" element={<BlendPlannerPage />} />
        <Route path="specifications" element={<SpecificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

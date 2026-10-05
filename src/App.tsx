import { Component, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Button, Logo, Toaster } from './components/ui'
import { DemoPanel } from './components/DemoPanel'
import { ClientLayout } from './components/ClientLayout'
import { StaffLayout } from './components/StaffLayout'
import { useApp } from './store/app'
import { useMarket } from './store/market'
import { SiteLayout } from './site/SiteLayout'
import SiteHome from './site/pages/Home'
import SiteAbout from './site/pages/About'
import SiteServices from './site/pages/Services'
import SiteProducts from './site/pages/Products'
import SitePlatform from './site/pages/Platform'
import SiteContact from './site/pages/Contact'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Forgot from './pages/public/Forgot'
import DemoGuide from './pages/public/DemoGuide'
import MobilePreview from './pages/public/MobilePreview'
import Dashboard from './pages/client/Dashboard'
import Invest from './pages/client/Invest'
import ProductDetail from './pages/client/ProductDetail'
import Portfolio from './pages/client/Portfolio'
import Certificate from './pages/client/Certificate'
import Transactions from './pages/client/Transactions'
import Markets from './pages/client/Markets'
import Insights from './pages/client/Insights'
import Article from './pages/client/Article'
import Goals from './pages/client/Goals'
import AutoInvest from './pages/client/AutoInvest'
import Statements from './pages/client/Statements'
import Support from './pages/client/Support'
import Settings from './pages/client/Settings'
import Referrals from './pages/client/Referrals'
import Notifications from './pages/client/Notifications'
import Halal from './pages/client/Halal'
import StaffOverview from './pages/staff/Overview'
import StaffClients from './pages/staff/Clients'
import StaffClient from './pages/staff/ClientDetail'
import StaffApprovals from './pages/staff/Approvals'
import StaffProducts from './pages/staff/Products'
import StaffBroadcasts from './pages/staff/Broadcasts'
import StaffReports from './pages/staff/Reports'

function RequireRole({ role, children }: { role: 'client' | 'staff'; children: React.ReactNode }) {
  const session = useApp((s) => s.session)
  const loc = useLocation()
  if (!session) return <Navigate to={`/login${role === 'staff' ? '?staff=1' : ''}`} replace state={{ from: loc.pathname }} />
  // signed in on the other side (e.g. switching from the demo panel): go to that side's home
  if (session.role !== role) return <Navigate to={session.role === 'staff' ? '/staff' : '/app'} replace />
  return <>{children}</>
}

/** Last line of defence: never leave the presenter staring at a blank screen. */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-6 text-center">
        <div>
          <Logo className="mx-auto h-10" />
          <p className="mt-8 font-display text-3xl font-semibold">Something went wrong</p>
          <p className="mt-2 text-muted">Reload the page to continue — your demo data is safe.</p>
          <Button className="mt-6" onClick={() => location.reload()}>Reload</Button>
        </div>
      </div>
    )
  }
}

function useMarketClock() {
  const speed = useMarket((s) => s.speed)
  const step = useMarket((s) => s.step)
  useEffect(() => {
    const t = setInterval(step, speed)
    return () => clearInterval(t)
  }, [speed, step])
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  useMarketClock()
  const theme = useApp((s) => s.theme)
  useEffect(() => {
    useApp.getState().resumeTimers()
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <ErrorBoundary>
      <ScrollTop />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<SiteHome />} />
            <Route path="/about" element={<SiteAbout />} />
            <Route path="/services" element={<SiteServices />} />
            <Route path="/products" element={<SiteProducts />} />
            <Route path="/platform" element={<SitePlatform />} />
            <Route path="/contact" element={<SiteContact />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/demo" element={<DemoGuide />} />
          <Route path="/mobile" element={<MobilePreview />} />

          <Route
            path="/app"
            element={
              <RequireRole role="client">
                <ClientLayout />
              </RequireRole>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="invest" element={<Invest />} />
            <Route path="invest/:id" element={<ProductDetail />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:id/certificate" element={<Certificate />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="markets" element={<Markets />} />
            <Route path="insights" element={<Insights />} />
            <Route path="insights/:slug" element={<Article />} />
            <Route path="goals" element={<Goals />} />
            <Route path="auto-invest" element={<AutoInvest />} />
            <Route path="statements" element={<Statements />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<Settings />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="halal" element={<Halal />} />
          </Route>

          <Route
            path="/staff"
            element={
              <RequireRole role="staff">
                <StaffLayout />
              </RequireRole>
            }
          >
            <Route index element={<StaffOverview />} />
            <Route path="clients" element={<StaffClients />} />
            <Route path="clients/:id" element={<StaffClient />} />
            <Route path="approvals" element={<StaffApprovals />} />
            <Route path="products" element={<StaffProducts />} />
            <Route path="broadcasts" element={<StaffBroadcasts />} />
            <Route path="reports" element={<StaffReports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      <Toaster />
      <DemoPanel />
    </ErrorBoundary>
  )
}

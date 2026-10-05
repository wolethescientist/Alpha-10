import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BrandLoader, Toaster } from './components/ui'
import { DemoPanel } from './components/DemoPanel'
import { ClientLayout } from './components/ClientLayout'
import { StaffLayout } from './components/StaffLayout'
import { useApp } from './store/app'
import { useMarket } from './store/market'

const Landing = lazy(() => import('./pages/public/Landing'))
const Login = lazy(() => import('./pages/public/Login'))
const Register = lazy(() => import('./pages/public/Register'))
const Forgot = lazy(() => import('./pages/public/Forgot'))
const DemoGuide = lazy(() => import('./pages/public/DemoGuide'))
const MobilePreview = lazy(() => import('./pages/public/MobilePreview'))

const Dashboard = lazy(() => import('./pages/client/Dashboard'))
const Invest = lazy(() => import('./pages/client/Invest'))
const ProductDetail = lazy(() => import('./pages/client/ProductDetail'))
const Portfolio = lazy(() => import('./pages/client/Portfolio'))
const Certificate = lazy(() => import('./pages/client/Certificate'))
const Transactions = lazy(() => import('./pages/client/Transactions'))
const Markets = lazy(() => import('./pages/client/Markets'))
const Insights = lazy(() => import('./pages/client/Insights'))
const Article = lazy(() => import('./pages/client/Article'))
const Goals = lazy(() => import('./pages/client/Goals'))
const AutoInvest = lazy(() => import('./pages/client/AutoInvest'))
const Statements = lazy(() => import('./pages/client/Statements'))
const Support = lazy(() => import('./pages/client/Support'))
const Settings = lazy(() => import('./pages/client/Settings'))
const Referrals = lazy(() => import('./pages/client/Referrals'))
const Notifications = lazy(() => import('./pages/client/Notifications'))
const Halal = lazy(() => import('./pages/client/Halal'))

const StaffOverview = lazy(() => import('./pages/staff/Overview'))
const StaffClients = lazy(() => import('./pages/staff/Clients'))
const StaffClient = lazy(() => import('./pages/staff/ClientDetail'))
const StaffApprovals = lazy(() => import('./pages/staff/Approvals'))
const StaffProducts = lazy(() => import('./pages/staff/Products'))
const StaffBroadcasts = lazy(() => import('./pages/staff/Broadcasts'))
const StaffReports = lazy(() => import('./pages/staff/Reports'))

function RequireRole({ role, children }: { role: 'client' | 'staff'; children: React.ReactNode }) {
  const session = useApp((s) => s.session)
  const loc = useLocation()
  if (!session) return <Navigate to={`/login${role === 'staff' ? '?staff=1' : ''}`} replace state={{ from: loc.pathname }} />
  // signed in on the other side (e.g. switching from the demo panel): go to that side's home
  if (session.role !== role) return <Navigate to={session.role === 'staff' ? '/staff' : '/app'} replace />
  return <>{children}</>
}

function Fallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <BrandLoader />
    </div>
  )
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
  useEffect(() => window.scrollTo({ top: 0 }), [pathname])
  return null
}

export default function App() {
  useMarketClock()
  const theme = useApp((s) => s.theme)
  useEffect(() => useApp.getState().resumeTimers(), [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <ScrollTop />
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
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
      </Suspense>
      <Toaster />
      <DemoPanel />
    </>
  )
}

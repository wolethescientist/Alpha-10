import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownLeft,
  Bell,
  CalendarClock,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  PieChart,
  Receipt,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { relative } from '../lib/format'
import { change, formatPrice } from '../lib/market'
import { rmMap } from '../lib/mock'
import { useAccount, useApp } from '../store/app'
import { useMarket } from '../store/market'
import { useUI } from '../store/ui'
import { Flows } from './flows/Flows'
import { Tour } from './Tour'
import { Avatar, Badge, Button, cx, Logo } from './ui'

const NAV = [
  { group: 'Overview', items: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, tour: 'nav-dashboard' },
    { to: '/app/portfolio', label: 'Portfolio', icon: PieChart },
    { to: '/app/invest', label: 'Invest', icon: TrendingUp, tour: 'nav-invest' },
    { to: '/app/transactions', label: 'Transactions', icon: Receipt },
  ] },
  { group: 'Grow', items: [
    { to: '/app/goals', label: 'Goals', icon: Target },
    { to: '/app/auto-invest', label: 'Auto-Invest', icon: CalendarClock },
    { to: '/app/halal', label: 'Non-Interest', icon: Sparkles, badge: 'New' },
    { to: '/app/referrals', label: 'Refer & Earn', icon: Gift },
  ] },
  { group: 'Research', items: [
    { to: '/app/markets', label: 'Markets', icon: LineChart, tour: 'nav-markets' },
    { to: '/app/insights', label: 'Insights', icon: Newspaper },
  ] },
  { group: 'Account', items: [
    { to: '/app/statements', label: 'Statements', icon: FileText },
    { to: '/app/support', label: 'Support', icon: LifeBuoy },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ] },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const acc = useAccount()
  const rm = rmMap[acc.profile.rmId]!
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-6">
        <Logo className="h-9" />
      </div>
      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">{g.group}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={'end' in it ? it.end : false}
                  onClick={onNavigate}
                  data-tour={'tour' in it ? it.tour : undefined}
                  className={({ isActive }) =>
                    cx(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors',
                      isActive ? 'text-brand-700 dark:text-white' : 'text-muted hover:bg-surface-2 hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-brand-700/8 dark:bg-brand-500/15" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                      <it.icon className="relative size-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                      <span className="relative flex-1">{it.label}</span>
                      {'badge' in it && it.badge && <Badge tone="gold" className="relative">{it.badge}</Badge>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-surface-2 p-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">Your relationship manager</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={rm.name} hue={rm.hue} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{rm.name}</p>
            <p className="truncate text-xs text-muted">{rm.title}</p>
          </div>
        </div>
        <NavLink to="/app/support" onClick={onNavigate} className="mt-3 block rounded-lg bg-surface py-2 text-center text-xs font-semibold text-brand-700 hover:bg-line dark:text-brand-300">
          Message {rm.name.split(' ')[0]}
        </NavLink>
      </div>
    </div>
  )
}

function MarketTicker() {
  const instruments = useMarket((s) => s.instruments)
  const list = instruments.filter((i) => ['NGXASI', 'USDNGN', 'TB364', 'FGN10Y', 'BRENT', 'DANGCEM', 'MTNN', 'GTCO', 'ZENITHBANK', 'SEPLAT', 'GOLD', 'SPX'].includes(i.symbol))
  const row = (
    <div className="flex shrink-0 items-center">
      {list.map((i) => {
        const c = change(i)
        return (
          <span key={i.symbol} className="flex items-center gap-2 px-5 text-xs whitespace-nowrap">
            <span className="font-semibold text-white/90">{i.symbol}</span>
            <span className="num text-white/70">{formatPrice(i)}</span>
            <span className={cx('num font-semibold', c.pct >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {c.pct >= 0 ? '▲' : '▼'} {Math.abs(c.pct).toFixed(2)}%
            </span>
          </span>
        )
      })}
    </div>
  )
  return (
    <div className="relative flex h-8 items-center overflow-hidden bg-[#0e0e0e]">
      <div className="ticker-track flex">
        {row}
        {row}
      </div>
    </div>
  )
}

function NotificationsMenu() {
  const acc = useAccount()
  const markAllRead = useApp((s) => s.markAllRead)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = acc.notifications.filter((n) => !n.read).length
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label="Notifications">
        <Bell className="size-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span key={unread} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white ring-2 ring-surface">
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="card absolute right-0 z-40 mt-2 w-[min(92vw,380px)] overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-semibold">Notifications</p>
              <button onClick={markAllRead} className="text-xs font-semibold text-brand-700 dark:text-brand-300">Mark all read</button>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {acc.notifications.slice(0, 8).map((n) => (
                <div key={n.id} className={cx('flex gap-3 border-b border-line px-5 py-3.5 last:border-0', !n.read && 'bg-brand-700/[0.03]')}>
                  <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-700')} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{n.body}</p>
                    <p className="mt-1 text-[11px] text-faint">{relative(n.date)}</p>
                  </div>
                </div>
              ))}
            </div>
            <NavLink to="/app/notifications" onClick={() => setOpen(false)} className="block border-t border-line py-3 text-center text-[13px] font-semibold text-brand-700 hover:bg-surface-2 dark:text-brand-300">
              View all
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProfileMenu() {
  const acc = useAccount()
  const logout = useApp((s) => s.logout)
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const name = acc.profile.companyName ?? `${acc.profile.firstName} ${acc.profile.lastName}`
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 hover:bg-surface-2">
        <Avatar name={name} hue={acc.profile.avatarHue} size={34} />
        <div className="hidden text-left md:block">
          <p className="text-[13px] leading-tight font-semibold">{acc.profile.firstName}</p>
          <p className="text-[11px] leading-tight text-muted">{acc.profile.tier}</p>
        </div>
        <ChevronDown className="hidden size-4 text-faint md:block" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="card absolute right-0 z-40 mt-2 w-64 p-2">
            <div className="px-3 py-3">
              <p className="truncate font-semibold">{name}</p>
              <p className="truncate text-xs text-muted">{acc.profile.email}</p>
              <p className="mt-1 text-xs text-faint num">Acct · {acc.profile.accountNo}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {[
              { to: '/app/settings', label: 'Profile & settings' },
              { to: '/app/statements', label: 'Statements' },
              { to: '/app/support', label: 'Help & support' },
            ].map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                {l.label}
              </NavLink>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              onClick={() => {
                logout()
                nav('/login')
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-loss hover:bg-surface-2"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ClientLayout() {
  const { theme, setTheme, hideBalances, toggleHideBalances } = useApp()
  const sidebarOpen = useUI((s) => s.sidebarOpen)
  const setSidebarOpen = useUI((s) => s.setSidebarOpen)
  const openFlow = useUI((s) => s.open)
  const loc = useLocation()
  const embedded = typeof window !== 'undefined' && window.self !== window.top

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }} className="absolute inset-y-0 left-0 w-[280px] bg-surface shadow-2xl">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-6 right-4 grid size-9 place-items-center rounded-full hover:bg-surface-2" aria-label="Close menu">
                <X className="size-5" />
              </button>
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-[264px]">
        {!embedded && <MarketTicker />}
        <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button onClick={() => setSidebarOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <div className="lg:hidden">
              <Logo mark className="h-8" />
            </div>
            <div className="flex-1" />
            <span className="hidden sm:block">
              <Button size="sm" icon={<ArrowDownLeft className="size-4" />} onClick={() => openFlow({ kind: 'deposit' })} data-tour="deposit-btn">
                Deposit
              </Button>
            </span>
            <button onClick={toggleHideBalances} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label="Toggle balances" title={hideBalances ? 'Show balances' : 'Hide balances'}>
              {hideBalances ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <NotificationsMenu />
            <ProfileMenu />
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div key={loc.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="mx-auto max-w-[1400px] px-4 pb-24 text-xs text-faint sm:px-6 lg:px-10 lg:pb-10">
          <div className="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:justify-between">
            <p>Alpha10 Fund Management Limited is registered and regulated by the Securities and Exchange Commission, Nigeria.</p>
            <p className="font-medium">Prototype · all data simulated</p>
          </div>
        </footer>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {[
          { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
          { to: '/app/portfolio', label: 'Portfolio', icon: PieChart },
          { to: '#deposit', label: 'Deposit', icon: ArrowDownLeft },
          { to: '/app/invest', label: 'Invest', icon: TrendingUp },
          { to: '/app/markets', label: 'Markets', icon: LineChart },
        ].map((it) =>
          it.to === '#deposit' ? (
            <button key={it.to} onClick={() => openFlow({ kind: 'deposit' })} className="flex flex-col items-center gap-1 py-2">
              <span className="-mt-6 grid size-12 place-items-center rounded-full bg-brand-700 text-white shadow-lg ring-4 ring-bg">
                <it.icon className="size-5" />
              </span>
              <span className="text-[10px] font-semibold text-ink">{it.label}</span>
            </button>
          ) : (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => cx('flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold', isActive ? 'text-brand-700 dark:text-brand-300' : 'text-muted')}>
              <it.icon className="size-5" />
              {it.label}
            </NavLink>
          ),
        )}
      </nav>

      <Flows />
      <Tour />
    </div>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, ClipboardCheck, ExternalLink, LayoutDashboard, LogOut, Megaphone, Menu, Moon, SlidersHorizontal, Sun, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../store/app'
import { Avatar, Badge, cx, Logo } from './ui'

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pending = useApp((s) => s.redemptions.filter((r) => r.status === 'pending').length + Object.values(s.accounts).filter((a) => a.profile.kycStatus === 'pending').length + s.adminClients.filter((c) => c.kyc === 'incomplete').length)
  const items = [
    { to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/staff/clients', label: 'Clients', icon: Users },
    { to: '/staff/approvals', label: 'Approvals', icon: ClipboardCheck, badge: pending },
    { to: '/staff/products', label: 'Products & rates', icon: SlidersHorizontal },
    { to: '/staff/broadcasts', label: 'Broadcasts', icon: Megaphone },
    { to: '/staff/reports', label: 'Reports', icon: BarChart3 },
  ]
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <Logo variant="light" className="h-8" />
      </div>
      <p className="px-6 pb-2 text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">Staff console</p>
      <nav className="flex-1 space-y-0.5 px-3">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} onClick={onNavigate} className={({ isActive }) => cx('relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition', isActive ? 'text-white' : 'text-white/55 hover:bg-white/5 hover:text-white')}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="staff-nav" className="absolute inset-0 rounded-xl bg-brand-700" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <it.icon className="relative size-[18px]" />
                <span className="relative flex-1">{it.label}</span>
                {!!it.badge && <span className="relative grid min-w-5 place-items-center rounded-full bg-gold-400 px-1.5 text-[11px] font-bold text-[#2a1a05]">{it.badge}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <Avatar name="Ops Admin" hue={20} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Operations Admin</p>
            <p className="truncate text-xs text-white/50">ops.admin@alpha10group.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StaffLayout() {
  const { theme, setTheme, logout, login, activeClientId } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] bg-[#0e0e0f] lg:block">
        <Nav />
      </aside>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="absolute inset-y-0 left-0 w-[260px] bg-[#0e0e0f]">
              <button onClick={() => setOpen(false)} className="absolute top-6 right-4 text-white/70" aria-label="Close menu"><X className="size-5" /></button>
              <Nav onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden" aria-label="Open menu"><Menu className="size-5" /></button>
            <Badge tone="brand">Staff · Operations</Badge>
            <div className="flex-1" />
            <button onClick={() => { login('client', activeClientId); nav('/app') }} className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-muted hover:bg-surface-2 hover:text-ink sm:flex">
              <ExternalLink className="size-4" /> View client portal
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button onClick={() => { logout(); nav('/login?staff=1') }} className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2" aria-label="Sign out"><LogOut className="size-5" /></button>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div key={loc.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

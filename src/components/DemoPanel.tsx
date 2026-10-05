import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Building2, Gauge, MonitorSmartphone, RotateCcw, Sparkles, TrendingDown, TrendingUp, User, Wand2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PERSONAS, type PersonaKey } from '../lib/mock'
import { useApp } from '../store/app'
import { useMarket } from '../store/market'
import { useUI } from '../store/ui'
import { Button, cx, Toggle } from './ui'

export function DemoPanel() {
  const open = useUI((s) => s.demoOpen)
  const setOpen = useUI((s) => s.setDemoOpen)
  const toast = useUI((s) => s.toast)
  const { session, activeClientId, setPersona, resetDemo, autoApprove, setAutoApprove, login, simulateInterest, simulateMaturityAlert } = useApp()
  const { mood, setMood, speed, setSpeed } = useMarket()
  const nav = useNavigate()
  const loc = useLocation()
  const [confirmReset, setConfirmReset] = useState(false)
  const embedded = typeof window !== 'undefined' && window.self !== window.top

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'd' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setOpen(!useUI.getState().demoOpen)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  if (embedded || loc.pathname === '/mobile') return null

  const personaKey: PersonaKey | null = activeClientId === 'c_retail' ? 'retail' : activeClientId === 'c_hni' ? 'hni' : activeClientId === 'c_corp' ? 'corporate' : null
  const inClient = session?.role === 'client'

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="no-print fixed right-4 bottom-24 z-[55] flex items-center gap-2 rounded-full bg-[#141414] px-4 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 lg:bottom-5"
        title="Demo controls (Shift + D)"
      >
        <Wand2 className="size-4 text-gold-400" />
        Demo
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            className="no-print fixed right-4 bottom-36 z-[56] max-h-[70vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl bg-[#141414] p-5 text-white shadow-2xl ring-1 ring-white/10 scrollbar-thin sm:w-[360px] lg:bottom-[4.5rem]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-gold-400 uppercase">Presenter controls</p>
                <p className="font-display text-lg font-semibold">Demo mode</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-white/10" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <Section title="Jump to">
              <div className="grid grid-cols-2 gap-2">
                <Chip
                  icon={<User className="size-4" />}
                  label="Client portal"
                  active={inClient}
                  onClick={() => {
                    login('client', activeClientId)
                    nav('/app')
                  }}
                />
                <Chip
                  icon={<Building2 className="size-4" />}
                  label="Staff console"
                  active={session?.role === 'staff'}
                  onClick={() => {
                    login('staff', activeClientId)
                    nav('/staff')
                  }}
                />
                <Chip icon={<MonitorSmartphone className="size-4" />} label="Mobile view" onClick={() => { login('client', activeClientId); nav('/mobile') }} />
                <Chip icon={<BookOpen className="size-4" />} label="Presenter guide" onClick={() => nav('/demo')} />
              </div>
            </Section>

            <Section title="Client persona">
              <div className="space-y-1.5">
                {(Object.keys(PERSONAS) as PersonaKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setPersona(k)
                      toast({ kind: 'info', title: `Switched to ${PERSONAS[k].label}`, body: PERSONAS[k].blurb })
                    }}
                    className={cx('flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition', personaKey === k ? 'bg-brand-700' : 'bg-white/5 hover:bg-white/10')}
                  >
                    <span>
                      <span className="block font-semibold">{PERSONAS[k].label}</span>
                      <span className="block text-[11px] text-white/60">{PERSONAS[k].blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Markets">
              <div className="grid grid-cols-3 gap-2">
                <Chip label="Calm" active={mood === 'calm'} onClick={() => setMood('calm')} />
                <Chip icon={<TrendingUp className="size-4" />} label="Rally" active={mood === 'rally'} onClick={() => setMood('rally')} />
                <Chip icon={<TrendingDown className="size-4" />} label="Sell-off" active={mood === 'selloff'} onClick={() => setMood('selloff')} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <Gauge className="size-4" /> Fast ticks
                </span>
                <Toggle checked={speed < 2000} onChange={(v) => setSpeed(v ? 900 : 2500)} label="Fast market ticks" />
              </div>
            </Section>

            <Section title="Simulate events">
              <div className="grid grid-cols-2 gap-2">
                <Chip icon={<Sparkles className="size-4" />} label="Credit interest" onClick={() => (inClient ? simulateInterest() : toast({ kind: 'warning', title: 'Open the client portal first' }))} />
                <Chip label="Maturity alert" onClick={() => (inClient ? simulateMaturityAlert() : toast({ kind: 'warning', title: 'Open the client portal first' }))} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-white/70">Auto-approve redemptions</span>
                <Toggle checked={autoApprove} onChange={setAutoApprove} label="Auto-approve redemptions" />
              </div>
              <p className="mt-1 text-[11px] text-white/45">Turn off to approve redemptions yourself from the staff console.</p>
            </Section>

            <Section title="Reset">
              {confirmReset ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" className="flex-1" onClick={() => { resetDemo(); setConfirmReset(false); toast({ kind: 'success', title: 'Demo data reset' }) }}>
                    Yes, reset everything
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Chip icon={<RotateCcw className="size-4" />} label="Reset demo data" onClick={() => setConfirmReset(true)} />
              )}
            </Section>
            <p className="mt-4 text-center text-[11px] text-white/40">Shift + D toggles this panel</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">{title}</p>
      {children}
    </div>
  )
}

function Chip({ label, icon, active, onClick }: { label: string; icon?: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx('flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition', active ? 'bg-brand-700 text-white' : 'bg-white/5 text-white/85 hover:bg-white/10')}>
      {icon}
      {label}
    </button>
  )
}

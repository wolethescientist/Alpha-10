import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAccount, useApp } from '../store/app'
import { Button } from './ui'

const STEPS = [
  { id: 'balance', title: 'Your wealth, live', body: 'Your total portfolio across naira and dollar products, with interest accruing in real time.' },
  { id: 'quick-actions', title: 'Everything in one tap', body: 'Deposit, invest, redeem or switch plans yourself — no emails, no waiting on paperwork.' },
  { id: 'nav-invest', title: 'Explore products', body: 'Compare every Alpha10 product, model returns with the calculator and invest in seconds.' },
  { id: 'nav-markets', title: 'Live markets', body: 'Track the NGX, FX, T-bill yields and your watchlist with live-moving charts.' },
  { id: 'rm', title: 'A real person, always', body: 'Your relationship manager is one message away, right inside the portal.' },
]

export function Tour() {
  const acc = useAccount()
  const complete = useApp((s) => s.completeTour)
  const loc = useLocation()
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [ready, setReady] = useState(false)
  const active = !acc.toured && loc.pathname === '/app' && ready

  useEffect(() => {
    if (acc.toured || loc.pathname !== '/app') return
    setI(0)
    const t = setTimeout(() => setReady(true), 1400)
    return () => {
      clearTimeout(t)
      setReady(false)
    }
  }, [acc.toured, loc.pathname])

  const visibleSteps = useMemo(() => {
    if (!active) return STEPS
    return STEPS.filter((s) => {
      const el = document.querySelector(`[data-tour="${s.id}"]`) as HTMLElement | null
      return el && el.offsetParent !== null
    })
  }, [active])

  const step = visibleSteps[i]

  useLayoutEffect(() => {
    if (!active || !step) return
    const el = document.querySelector(`[data-tour="${step.id}"]`) as HTMLElement | null
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const update = () => setRect(el.getBoundingClientRect())
    const t = setTimeout(update, 350)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [active, step])

  if (!active || !step || !rect) return null
  const pad = 8
  const below = rect.bottom + 220 < window.innerHeight
  const left = Math.min(Math.max(16, rect.left), window.innerWidth - 356)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60]">
        <motion.div
          className="absolute rounded-2xl"
          initial={false}
          animate={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ boxShadow: '0 0 0 9999px rgb(10 4 4 / 0.62)' }}
        />
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card absolute w-[340px] p-5"
          style={{ left, top: below ? rect.bottom + 18 : Math.max(16, rect.top - 200) }}
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-700 uppercase dark:text-brand-300">
            Step {i + 1} of {visibleSteps.length}
          </p>
          <p className="mt-1 font-display text-xl font-semibold">{step.title}</p>
          <p className="mt-1.5 text-sm text-muted">{step.body}</p>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={complete} className="text-[13px] font-medium text-muted hover:text-ink">
              Skip tour
            </button>
            <Button size="sm" onClick={() => (i + 1 >= visibleSteps.length ? complete() : setI(i + 1))}>
              {i + 1 >= visibleSteps.length ? 'Get started' : 'Next'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

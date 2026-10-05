import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx, Logo } from '../../components/ui'
import { money } from '../../lib/format'
import { change } from '../../lib/market'
import { PRODUCTS, project } from '../../lib/products'
import { useApp } from '../../store/app'
import { useMarket } from '../../store/market'

/* Editorial palette for the public site — fixed, independent of the app theme. */
const INK = '#141210'
const CRIMSON = '#961a1c'
const EASE = [0.16, 1, 0.3, 1] as const

/* ------------------------------------------------------------------ */
/* Motion primitives                                                   */
/* ------------------------------------------------------------------ */

/** Headline lines that rise out of a mask, staggered. */
function MaskLines({ lines, className, delay = 0 }: { lines: ReactNode[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: delay + i * 0.12, ease: EASE }}>
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/** Fades content up when it scrolls into view. */
function Reveal({ children, delay = 0, className, y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

function ScrubWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  )
}

/** A paragraph that "reads itself" — each word lights up as you scroll past. */
function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrubWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  )
}

/** A button that leans towards the cursor. */
function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 220, damping: 18 })
  const y = useSpring(0, { stiffness: 220, damping: 18 })
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cx('inline-block', className)}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.25)
        y.set((e.clientY - r.top - r.height / 2) * 0.35)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

function InkButton({ to, children, light }: { to: string; children: ReactNode; light?: boolean }) {
  return (
    <Magnetic>
      <Link
        to={to}
        className={cx(
          'group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full pr-2 pl-7 font-grotesk text-[15px] font-medium transition-colors',
          light ? 'bg-[#f3eee5] text-[#141210]' : 'bg-[#141210] text-[#f3eee5]',
        )}
      >
        <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#961a1c] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
        <span className="relative transition-colors group-hover:text-white">{children}</span>
        <span className={cx('relative grid size-10 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-[-45deg]', light ? 'bg-[#141210] text-[#f3eee5]' : 'bg-[#f3eee5] text-[#141210]')}>
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </Magnetic>
  )
}

function CountUp({ to, format, className }: { to: number; format: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: setV })
    return () => c.stop()
  }, [inView, to])
  return (
    <span ref={ref} className={className}>
      {format(v)}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Ribbons — the Alpha10 wave mark, redrawn as living strokes          */
/* ------------------------------------------------------------------ */

const RIBBONS = [
  { d: 'M-40 520 C 180 470, 320 300, 470 250 S 760 230, 900 120', c: CRIMSON, w: 26 },
  { d: 'M-40 560 C 200 520, 340 360, 500 300 S 790 270, 930 170', c: INK, w: 18 },
  { d: 'M-40 600 C 220 570, 360 420, 530 350 S 820 310, 960 220', c: CRIMSON, w: 14 },
  { d: 'M-40 640 C 240 620, 380 480, 560 400 S 850 350, 990 270', c: INK, w: 9 },
  { d: 'M-40 676 C 260 664, 400 536, 590 450 S 880 392, 1020 318', c: CRIMSON, w: 5 },
]

function Ribbons({ scroll }: { scroll: MotionValue<number> }) {
  const reduce = useReducedMotion()
  const y = useTransform(scroll, [0, 800], [0, 140])
  const rotate = useTransform(scroll, [0, 800], [0, -4])
  return (
    <motion.svg viewBox="0 0 960 720" className="h-full w-full" style={{ y, rotate }} aria-hidden fill="none">
      {RIBBONS.map((r, i) => (
        <motion.path
          key={i}
          d={r.d}
          stroke={r.c}
          strokeWidth={r.w}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1, y: [0, i % 2 ? 10 : -10, 0] }}
          transition={{
            pathLength: { duration: 2.2, delay: 0.3 + i * 0.12, ease: EASE },
            opacity: { duration: 0.4, delay: 0.3 + i * 0.12 },
            y: { duration: 7 + i, repeat: Infinity, ease: 'easeInOut', delay: 2.5 },
          }}
        />
      ))}
    </motion.svg>
  )
}

/* ------------------------------------------------------------------ */
/* Live rate ledger (uses the simulated market feed)                   */
/* ------------------------------------------------------------------ */

function Ledger() {
  const instruments = useMarket((s) => s.instruments)
  const rows = ['TB364', 'FGN10Y', 'NGXASI', 'USDNGN'].map((s) => instruments.find((i) => i.symbol === s)!)
  const labels: Record<string, string> = { TB364: '364-day T-bill', FGN10Y: 'FGN 10-year', NGXASI: 'NGX All-Share', USDNGN: 'USD / NGN' }
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1, ease: EASE }} className="w-full max-w-sm border border-[#141210]/15 bg-[#f3eee5]/85 p-5 font-grotesk backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-[#141210]/15 pb-3 text-[11px] tracking-[0.18em] text-[#141210]/55 uppercase">
        <span>Market ledger</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-[#961a1c]" /> Live
        </span>
      </div>
      {rows.map((r) => {
        const c = change(r)
        return (
          <div key={r.symbol} className="flex items-baseline justify-between border-b border-dashed border-[#141210]/10 py-2.5 text-sm last:border-0">
            <span className="text-[#141210]/70">{labels[r.symbol]}</span>
            <span className="num flex items-baseline gap-3">
              <span key={r.price.toFixed(3)} className={cx('rounded px-1 font-medium text-[#141210]', c.pct >= 0 ? 'flash-up' : 'flash-down')}>
                {r.unit === '%' ? `${r.price.toFixed(2)}%` : r.price.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
              </span>
              <span className={cx('w-14 text-right text-xs', c.pct >= 0 ? 'text-[#0f7a52]' : 'text-[#961a1c]')}>
                {c.pct >= 0 ? '+' : '−'}
                {Math.abs(c.pct).toFixed(2)}%
              </span>
            </span>
          </div>
        )
      })}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Portal showcase — sticky device, screens change with scroll         */
/* ------------------------------------------------------------------ */

const STEPS = [
  { k: 'Open', t: 'An account in minutes, not weeks.', d: 'BVN verified instantly with NIBSS, documents scanned from your phone, a relationship manager assigned before you finish your coffee.' },
  { k: 'Fund', t: 'Deposit and watch it land.', d: 'Transfer, card or USSD. Your balance updates in seconds and starts earning the same day.' },
  { k: 'Grow', t: 'Every naira, accounted for — live.', d: 'Interest accrues by the second. Charts, maturities and certificates are always one tap away.' },
  { k: 'Redeem', t: 'Your money back without the paperwork.', d: 'No emails, no forms. Redeem in-app and follow it from request to payout.' },
]

function Screen({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.18em] text-[#141210]/50 uppercase">Step 3 of 8 · Identity</p>
        <p className="font-editorial text-3xl leading-none">Verify your identity</p>
        <div className="rounded-lg border border-[#141210]/15 bg-white px-3 py-2.5 font-mono text-sm tracking-[0.25em]">221 8493 0211</div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 rounded-lg bg-[#0f7a52]/10 p-3">
          <span className="grid size-8 place-items-center rounded-full bg-[#0f7a52] text-white"><Check className="size-4" /></span>
          <div className="text-xs"><p className="font-semibold">Identity matched</p><p className="text-[#141210]/60">Verified with NIBSS · 1.4s</p></div>
        </motion.div>
        <div className="grid grid-cols-4 gap-1.5 pt-1">{[1, 1, 1, 0].map((d, k) => <span key={k} className={cx('h-1 rounded-full', d ? 'bg-[#961a1c]' : 'bg-[#141210]/15')} />)}</div>
      </div>
    )
  if (i === 1)
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="grid size-14 place-items-center rounded-full bg-[#0f7a52] text-white"><Check className="size-6" /></motion.span>
        <p className="mt-4 text-[10px] tracking-[0.2em] text-[#0f7a52] uppercase">Deposit received</p>
        <CountUp to={2500000} format={(n) => money(n, 'NGN', { decimals: 0 })} className="num mt-1 font-editorial text-4xl" />
        <p className="mt-1 text-xs text-[#141210]/55">credited to your cash account</p>
      </div>
    )
  if (i === 2)
    return (
      <div>
        <p className="text-[10px] tracking-[0.18em] text-[#141210]/50 uppercase">Total portfolio</p>
        <CountUp to={48726410} format={(n) => money(n, 'NGN', { decimals: 0 })} className="num mt-1 block font-editorial text-4xl" />
        <p className="text-xs text-[#0f7a52]">▲ ₦5,681 earned today</p>
        <svg viewBox="0 0 200 70" className="mt-4 w-full">
          <motion.path d="M0 60 C 30 55, 40 48, 60 44 S 100 40, 120 30 S 160 22, 200 8" stroke={CRIMSON} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: EASE }} />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
          {[['Treasury', '19.75%'], ['Money Mkt', '18.42%'], ['Dollar', '7.38%']].map(([a, b]) => (
            <div key={a} className="rounded-md bg-[#141210]/[0.05] p-2"><p className="text-[#141210]/55">{a}</p><p className="num font-semibold">{b}</p></div>
          ))}
        </div>
      </div>
    )
  return (
    <div>
      <p className="text-[10px] tracking-[0.18em] text-[#961a1c] uppercase">Redemption RQ-88412</p>
      <p className="num mt-1 font-editorial text-4xl">₦1,250,000</p>
      <div className="mt-5 space-y-0">
        {['Request received', 'Approved', 'Paid to GTBank ••4821'].map((s, k) => (
          <div key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <motion.span initial={{ scale: 0.6, opacity: 0.3 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + k * 0.5 }} className="grid size-6 place-items-center rounded-full bg-[#0f7a52] text-white"><Check className="size-3" /></motion.span>
              {k < 2 && <motion.span initial={{ height: 0 }} animate={{ height: 22 }} transition={{ delay: 0.5 + k * 0.5 }} className="w-px bg-[#0f7a52]" />}
            </div>
            <p className="pt-0.5 text-xs font-medium">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Showcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))))
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section ref={ref} className="relative" style={{ height: `${STEPS.length * 85}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-5 sm:gap-12 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="font-grotesk text-xs tracking-[0.22em] text-[#141210]/50 uppercase">03 — The portal</p>
            <div className="mt-8 space-y-1">
              {STEPS.map((s, i) => (
                <div key={s.k} className="overflow-hidden">
                  <motion.p animate={{ opacity: i === active ? 1 : 0.18 }} transition={{ duration: 0.5, ease: EASE }} className="font-editorial text-4xl leading-[1.05] sm:text-6xl">
                    {s.k}
                    <span className="text-[#961a1c]">.</span>
                  </motion.p>
                </div>
              ))}
            </div>
            <div className="mt-6 max-w-md font-grotesk sm:mt-8 sm:min-h-28">
              <motion.p key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <span className="block text-lg font-medium">{STEPS[active]!.t}</span>
                <span className="mt-2 hidden text-[15px] leading-relaxed text-[#141210]/65 sm:block">{STEPS[active]!.d}</span>
              </motion.p>
            </div>
            <div className="mt-6 h-px w-full max-w-md bg-[#141210]/15">
              <motion.div className="h-px bg-[#961a1c]" style={{ width: bar }} />
            </div>
          </div>

          <div className="relative mx-auto h-[600px] w-[300px] max-sm:-mt-6 max-sm:-mb-[230px] max-sm:origin-top max-sm:scale-[0.6]">
            <div className="absolute -inset-10 -z-10 rounded-full bg-[#961a1c]/10 blur-3xl" />
            <div className="h-full rounded-[2.6rem] bg-[#141210] p-2.5 shadow-[0_40px_80px_-30px_rgb(20_18_16/0.6)]">
              <div className="relative h-full overflow-hidden rounded-[2.1rem] bg-[#faf7f1] font-grotesk text-[#141210]">
                <div className="flex items-center justify-between px-6 pt-4 text-[11px] font-semibold">
                  <span>9:41</span>
                  <span className="h-5 w-20 rounded-full bg-[#141210]" />
                  <span>5G</span>
                </div>
                <div className="flex items-center justify-between px-5 pt-4">
                  <Logo variant="dark" className="h-6" />
                  <span className="grid size-7 place-items-center rounded-full bg-[#961a1c] text-[10px] font-bold text-white">CO</span>
                </div>
                <div className="px-5 pt-8">
                  <motion.div key={active} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: EASE }} className="h-[380px]">
                    <Screen i={active} />
                  </motion.div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-[#141210]/10 bg-white/80 py-3 text-[9px] text-[#141210]/50">
                  {['Home', 'Portfolio', 'Invest', 'Markets'].map((t, k) => (
                    <span key={t} className={k === Math.min(active, 3) ? 'font-semibold text-[#961a1c]' : ''}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const PILATE = [
  ['P', 'Professionalism', 'The foundation of every execution.'],
  ['I', 'Innovation', 'Creative solutions to old problems.'],
  ['L', 'Listening', 'Service that responds before you ask twice.'],
  ['A', 'Accountability', 'Our stakeholders come first.'],
  ['T', 'Trust', 'Dependable, every single time.'],
  ['E', 'Equity', 'Fair and just in all we do.'],
] as const

export default function Landing() {
  const session = useApp((s) => s.session)
  const rates = useApp((s) => s.rates)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [navHidden, setNavHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setNavHidden(v > prev && v > 240)
    setScrolled(v > 24)
  })

  const ctaRef = useRef<HTMLElement>(null)
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] })
  const ctaX = useTransform(ctaProgress, [0, 1], ['10%', '-45%'])

  // calculator
  const [amount, setAmount] = useState(5_000_000)
  const [tenor, setTenor] = useState(364)
  const tbi = PRODUCTS[0]!
  const rate = tbi.tenors!.find((t) => t.days === tenor)!.rate
  const earned = project(amount, rate, tenor).at(-1)!.value - amount
  const earnedMv = useMotionValue(earned)
  const [earnedShown, setEarnedShown] = useState(earned)
  useEffect(() => {
    const c = animate(earnedMv, earned, { duration: 0.6, ease: EASE, onUpdate: setEarnedShown })
    return () => c.stop()
  }, [earned, earnedMv])

  const [hoverRow, setHoverRow] = useState<string | null>(null)
  const portalHref = session?.role === 'client' ? '/app' : '/login'

  const marqueeItems = PRODUCTS.filter((p) => !p.proposed).map((p) => `${p.short} ${(rates[p.id] ?? p.rate).toFixed(2)}%`)

  return (
    <div className="paper-grain min-h-screen font-grotesk text-[#141210] selection:bg-[#961a1c] selection:text-white">
      <motion.div className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-[#961a1c]" style={{ scaleX: progress }} />

      {/* NAV */}
      <motion.header
        animate={{ y: navHidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className={cx('fixed inset-x-0 top-0 z-40 transition-[background,border] duration-300', scrolled ? 'border-b border-[#141210]/10 bg-[#f3eee5]/85 backdrop-blur-md' : 'border-b border-transparent')}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Alpha10 home">
            <Logo variant="dark" className="h-9" />
          </Link>
          <nav className="hidden items-center gap-9 text-[14px] text-[#141210]/75 md:flex">
            <a href="#house" className="link-underline hover:text-[#141210]">The house</a>
            <a href="#products" className="link-underline hover:text-[#141210]">Products</a>
            <a href="#portal" className="link-underline hover:text-[#141210]">Portal</a>
            <a href="#calculator" className="link-underline hover:text-[#141210]">Calculator</a>
          </nav>
          <div className="flex items-center gap-5 text-[14px]">
            <Link to={portalHref} className="link-underline">
              {session?.role === 'client' ? 'Dashboard' : <><span className="sm:hidden">Log in</span><span className="hidden sm:inline">Client login</span></>}
            </Link>
            <Link to="/register" className="rounded-full bg-[#141210] px-4 py-2.5 font-medium text-[#f3eee5] transition-colors hover:bg-[#961a1c] sm:px-5">
              <span className="sm:hidden">Open account</span>
              <span className="hidden sm:inline">Open an account</span>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden pt-28">
        <div className="pointer-events-none absolute top-24 right-[-14%] h-[620px] w-[860px] opacity-95 [mask-image:linear-gradient(to_right,transparent,black_28%)] max-lg:top-auto max-lg:right-[-40%] max-lg:bottom-[-12%] max-lg:h-[420px] max-lg:w-[620px] max-lg:opacity-40">
          <Ribbons scroll={scrollY} />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#141210]/15 pb-5 text-[12px] tracking-[0.16em] text-[#141210]/55 uppercase">
            <span>Asset management</span>
            <span className="hidden size-1 rounded-full bg-[#141210]/30 sm:block" />
            <span>Advisory</span>
            <span className="hidden size-1 rounded-full bg-[#141210]/30 sm:block" />
            <span>Securities trading</span>
            <span className="ml-auto hidden lg:block">Abuja · Lagos</span>
          </motion.div>

          <h1 className="mt-10 font-editorial text-[clamp(3.4rem,10.5vw,10.5rem)] leading-[0.88] tracking-[-0.02em]">
            <MaskLines
              delay={0.15}
              lines={[
                'Wealth, held',
                <>
                  to a <em className="text-[#961a1c]">higher</em>
                </>,
                'standard.',
              ]}
            />
          </h1>

          <div className="mt-12 grid items-end gap-10 pb-20 lg:grid-cols-[1fr_auto]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }} className="max-w-md">
              <p className="text-[17px] leading-relaxed text-[#141210]/70">
                Sovereign-backed treasury placements, money market and dollar funds, and expert advisory — from an SEC-regulated house rated <span className="text-[#141210]">BBB+</span>.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <InkButton to="/register">Start investing</InkButton>
                <a href="#portal" className="group flex items-center gap-2 text-[15px] font-medium">
                  <span className="link-underline">See the portal</span>
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                </a>
              </div>
            </motion.div>
            <Ledger />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-[#141210] bg-[#141210] py-5 text-[#f3eee5]">
        <div className="marquee flex w-max items-center">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {[...marqueeItems, 'SEC-regulated', 'Rated BBB+ by Datapro', 'STL Trustees custody'].map((m) => (
                <span key={m + k} className="flex items-center gap-10 pr-10 font-editorial text-3xl whitespace-nowrap italic">
                  {m}
                  <span className="text-[#961a1c] not-italic">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 01 THE HOUSE */}
      <section id="house" className="mx-auto max-w-7xl px-5 py-32 sm:px-8 sm:py-44">
        <p className="text-xs tracking-[0.22em] text-[#141210]/50 uppercase">01 — The house</p>
        <ScrubText
          className="mt-10 max-w-5xl font-editorial text-[clamp(2rem,4.6vw,4.4rem)] leading-[1.08]"
          text="Alpha10 exists to make wealth management in Nigeria feel the way it should — precise, transparent and personal. We put professionalism, discipline and technology to work so your money compounds quietly while you get on with your life."
        />
        <div className="mt-20 grid gap-px overflow-hidden border border-[#141210]/15 bg-[#141210]/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: <span>BBB+</span>, l: 'Investment-grade rating, Datapro 2025' },
            { v: <CountUp to={1000} format={(n) => `₦${Math.round(n).toLocaleString()}`} />, l: 'Minimum to start in the Money Market Fund' },
            { v: <CountUp to={48} format={(n) => `${Math.round(n)}h`} />, l: 'Withdrawals on Liquidity Management Flex' },
            { v: <CountUp to={19.75} format={(n) => `${n.toFixed(2)}%`} />, l: 'On the 364-day Treasury Backed Investment' },
          ].map((s, i) => (
            <div key={i} className="bg-[#f3eee5] p-8">
              <Reveal delay={i * 0.08}>
                <p className="num font-editorial text-6xl">{s.v}</p>
                <p className="mt-4 max-w-[14rem] text-sm text-[#141210]/60">{s.l}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* 02 PRODUCTS */}
      <section id="products" className="bg-[#141210] py-32 text-[#f3eee5] sm:py-40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.22em] text-[#f3eee5]/45 uppercase">02 — Products</p>
              <Reveal>
                <h2 className="mt-6 font-editorial text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95]">
                  Six ways to put
                  <br />
                  <em className="text-[#e06d6f]">capital to work.</em>
                </h2>
              </Reveal>
            </div>
            <p className="max-w-xs text-sm text-[#f3eee5]/55">Indicative rates. Every product is professionally managed and comes with an investment certificate.</p>
          </div>

          <div className="mt-16 border-t border-[#f3eee5]/15" onMouseLeave={() => setHoverRow(null)}>
            {PRODUCTS.filter((p) => !p.proposed).map((p, i) => {
              const open = hoverRow === p.id
              return (
                <Link
                  key={p.id}
                  to={session?.role === 'client' ? `/app/invest/${p.id}` : '/register'}
                  onMouseEnter={() => setHoverRow(p.id)}
                  className="group relative block border-b border-[#f3eee5]/15"
                >
                  <motion.span className="absolute inset-0 origin-left bg-[#f3eee5]" initial={false} animate={{ scaleX: open ? 1 : 0 }} transition={{ duration: 0.55, ease: EASE }} />
                  <div className={cx('relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-7 transition-colors duration-300 sm:grid-cols-[3.5rem_1.4fr_1fr_8rem_8rem_2rem] sm:gap-6', open && 'text-[#141210]')}>
                    <span className="num text-sm opacity-50">0{i + 1}</span>
                    <span className="font-editorial text-3xl leading-tight sm:text-4xl">{p.name}</span>
                    <span className="hidden text-sm opacity-60 sm:block">{p.tagline}</span>
                    <span className="num hidden text-right font-editorial text-3xl sm:block">
                      {(rates[p.id] ?? p.rate).toFixed(2)}
                      <span className="text-lg">%</span>
                    </span>
                    <span className="num hidden text-right text-sm opacity-60 sm:block">from {money(p.minimum, p.currency, { decimals: 0, compact: p.minimum >= 1e6 })}</span>
                    <span className="num text-right font-editorial text-2xl sm:hidden">{(rates[p.id] ?? p.rate).toFixed(1)}%</span>
                    <ArrowUpRight className={cx('hidden size-6 transition-transform duration-500 sm:block', open ? 'rotate-45 text-[#961a1c]' : 'opacity-40')} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 03 PORTAL */}
      <div id="portal">
        <Showcase />
      </div>

      {/* 04 CALCULATOR */}
      <section id="calculator" className="border-t border-[#141210]/15">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-32 sm:px-8 lg:grid-cols-2 lg:py-40">
          <div>
            <p className="text-xs tracking-[0.22em] text-[#141210]/50 uppercase">04 — Treasury Backed Investment</p>
            <Reveal>
              <h2 className="mt-6 font-editorial text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">
                The sovereign’s promise,
                <br />
                <em className="text-[#961a1c]">plus a hundred basis points.</em>
              </h2>
            </Reveal>
            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-[#141210]/65">Federal Government treasury bills and bonds — default-risk-free instruments — paying you 1% above the instrument rate.</p>
          </div>
          <Reveal delay={0.1} className="self-end">
            <div className="border border-[#141210]/15 bg-[#faf7f1] p-8 sm:p-10">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#141210]/60">If you invest</span>
                <span className="num font-editorial text-3xl">{money(amount, 'NGN', { decimals: 0 })}</span>
              </div>
              <input
                type="range"
                aria-label="Investment amount"
                className="range mt-5"
                min={1_000_000}
                max={100_000_000}
                step={500_000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ ['--p' as string]: `${((amount - 1e6) / 99e6) * 100}%` }}
              />
              <div className="mt-8 flex border border-[#141210]/15">
                {tbi.tenors!.slice(0, 3).map((t) => (
                  <button key={t.days} onClick={() => setTenor(t.days)} className={cx('relative flex-1 py-3 text-sm transition-colors', tenor === t.days ? 'text-[#f3eee5]' : 'text-[#141210]/70 hover:text-[#141210]')}>
                    {tenor === t.days && <motion.span layoutId="tenor" className="absolute inset-0 bg-[#141210]" transition={{ duration: 0.4, ease: EASE }} />}
                    <span className="relative">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-10 border-t border-[#141210]/15 pt-8">
                <p className="text-sm text-[#141210]/60">You could earn</p>
                <p className="num mt-1 font-editorial text-[clamp(3rem,7vw,5.5rem)] leading-none text-[#961a1c]">{money(earnedShown, 'NGN', { decimals: 0 })}</p>
                <p className="mt-3 text-xs text-[#141210]/50">at {rate.toFixed(2)}% p.a. · before 10% WHT · illustrative</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 05 VALUES */}
      <section className="border-t border-[#141210]/15 bg-[#ebe4d8]">
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
          <p className="text-xs tracking-[0.22em] text-[#141210]/50 uppercase">05 — What we stand on</p>
          <div className="mt-12 grid grid-cols-2 gap-px bg-[#141210]/15 sm:grid-cols-3 lg:grid-cols-6">
            {PILATE.map(([l, w, d], i) => (
              <div key={l} className="group bg-[#ebe4d8] p-6 transition-colors duration-500 hover:bg-[#141210]">
                <Reveal delay={i * 0.06}>
                  <p className="font-editorial text-8xl leading-none text-[#961a1c] transition-transform duration-500 group-hover:-translate-y-1">{l}</p>
                  <p className="mt-6 text-sm font-medium transition-colors group-hover:text-[#f3eee5]">{w}</p>
                  <p className="mt-1 text-xs text-[#141210]/55 transition-colors group-hover:text-[#f3eee5]/60">{d}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="relative overflow-hidden bg-[#961a1c] py-28 text-[#f3eee5] sm:py-36">
        <motion.p style={{ x: ctaX }} className="pointer-events-none font-editorial text-[clamp(6rem,18vw,17rem)] leading-none whitespace-nowrap italic opacity-95">
          your future, our future — your future, our future
        </motion.p>
        <div className="mx-auto mt-14 flex max-w-7xl flex-wrap items-end justify-between gap-8 px-5 sm:px-8">
          <p className="max-w-md text-lg text-[#f3eee5]/80">Open an account online in minutes. A relationship manager will be with you from the first naira.</p>
          <div className="flex flex-wrap items-center gap-6">
            <InkButton to="/register" light>
              Open an account
            </InkButton>
            <Link to="/login" className="link-underline text-[15px] font-medium">Client login</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#141210] text-[#f3eee5]/70">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 text-sm sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="light" className="h-10" />
            <p className="mt-6 max-w-xs leading-relaxed text-[#f3eee5]/50">Alpha10 Fund Management Limited is registered and regulated by the Securities and Exchange Commission, Nigeria.</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-[#f3eee5]/40 uppercase">Abuja</p>
            <p className="mt-4 leading-relaxed">13 Mambolo Street,<br />Wuse Zone 2</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-[#f3eee5]/40 uppercase">Lagos</p>
            <p className="mt-4 leading-relaxed">5th Floor, Eleganza Biro House,<br />Plot 634 Adeyemo Alakija St, VI</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.18em] text-[#f3eee5]/40 uppercase">Contact</p>
            <p className="mt-4">+234 913 444 4497</p>
            <p className="mt-1">enquiries@alpha10group.com</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/login?staff=1" className="link-underline w-fit">Staff console</Link>
              <Link to="/demo" className="link-underline w-fit">Presenter guide</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#f3eee5]/10">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-6 text-xs text-[#f3eee5]/40 sm:px-8">
            <span>© {new Date().getFullYear()} Alpha10 Group</span>
            <span>Interactive prototype · all balances, rates and market data are simulated</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

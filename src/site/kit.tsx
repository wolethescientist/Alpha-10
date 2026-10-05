import { ArrowRight, Check } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { cx, Logo } from '../components/ui'
import { change } from '../lib/market'
import { useMarket } from '../store/market'
import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { TLink } from './SiteLayout'

export const INK = '#141210'
export const CRIMSON = '#961a1c'

export function Eyebrow({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <p data-fade className={cx('flex items-center gap-3 text-xs tracking-[0.22em] uppercase', light ? 'text-[#f3eee5]/50' : 'text-[#141210]/50', className)}>
      <span className={cx('h-px w-8', light ? 'bg-[#f3eee5]/40' : 'bg-[#141210]/40')} />
      {children}
    </p>
  )
}

/** Pill button that leans toward the cursor (gsap.quickTo). */
export function MagneticButton({ to, children, tone = 'ink' }: { to: string; children: ReactNode; tone?: 'ink' | 'paper' | 'crimson' }) {
  const ref = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: ref })
  const move = contextSafe((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.5, ease: 'power3.out' })
  })
  const leave = contextSafe(() => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' }))
  const base = tone === 'paper' ? 'bg-[#f3eee5] text-[#141210]' : tone === 'crimson' ? 'bg-[#961a1c] text-white' : 'bg-[#141210] text-[#f3eee5]'
  const knob = tone === 'paper' ? 'bg-[#141210] text-[#f3eee5]' : 'bg-[#f3eee5] text-[#141210]'
  return (
    <div ref={ref} className="inline-block" onMouseMove={move} onMouseLeave={leave}>
      <TLink to={to} className={cx('group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full pr-2 pl-7 text-[15px] font-medium', base)}>
        <span className={cx('absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100', tone === 'crimson' ? 'bg-[#141210]' : 'bg-[#961a1c]')} />
        <span className="relative transition-colors group-hover:text-white">{children}</span>
        <span className={cx('relative grid size-10 place-items-center rounded-full transition-transform duration-500 group-hover:-rotate-45', knob)}>
          <ArrowRight className="size-4" />
        </span>
      </TLink>
    </div>
  )
}

const RIBBONS = [
  { d: 'M-40 520 C 180 470, 320 300, 470 250 S 760 230, 900 120', c: CRIMSON, w: 26 },
  { d: 'M-40 560 C 200 520, 340 360, 500 300 S 790 270, 930 170', c: INK, w: 18 },
  { d: 'M-40 600 C 220 570, 360 420, 530 350 S 820 310, 960 220', c: CRIMSON, w: 14 },
  { d: 'M-40 640 C 240 620, 380 480, 560 400 S 850 350, 990 270', c: INK, w: 9 },
  { d: 'M-40 676 C 260 664, 400 536, 590 450 S 880 392, 1020 318', c: CRIMSON, w: 5 },
]

/** The Alpha10 wave mark as drawn strokes that float and drift with scroll. */
export function Ribbons({ className, light }: { className?: string; light?: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>('path', ref.current)
      paths.forEach((p, i) => gsap.to(p, { y: i % 2 ? 12 : -12, duration: 5 + i, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 }))
      gsap.to(ref.current, { yPercent: 18, rotate: -4, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
    },
    { scope: ref },
  )
  return (
    <svg ref={ref} viewBox="0 0 960 720" className={className} fill="none" aria-hidden data-draw data-immediate>
      {RIBBONS.map((r, i) => (
        <path key={i} d={r.d} stroke={light && r.c === INK ? '#f3eee5' : r.c} strokeWidth={r.w} strokeLinecap="round" />
      ))}
    </svg>
  )
}

export function Ledger({ className }: { className?: string }) {
  const instruments = useMarket((s) => s.instruments)
  const rows = ['TB364', 'FGN10Y', 'NGXASI', 'USDNGN'].map((s) => instruments.find((i) => i.symbol === s)!)
  const labels: Record<string, string> = { TB364: '364-day T-bill', FGN10Y: 'FGN 10-year', NGXASI: 'NGX All-Share', USDNGN: 'USD / NGN' }
  return (
    <div className={cx('w-full max-w-sm border border-[#141210]/15 bg-[#f3eee5]/85 p-5 backdrop-blur-sm', className)}>
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
              <span key={r.price.toFixed(3)} className={cx('rounded px-1 font-medium', c.pct >= 0 ? 'flash-up' : 'flash-down')}>
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
    </div>
  )
}

/** Infinite marquee whose speed and direction follow scroll velocity. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const track = ref.current!.querySelector('.mq-track')!
      const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
      loop.totalTime(loop.duration() * 50) // headroom so negative timeScale can run backwards
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const dir = self.direction
          const boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 400)
          gsap.to(loop, { timeScale: boost * dir, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(loop, { timeScale: dir, duration: 1.2 }) })
        },
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={cx('overflow-hidden border-y border-[#141210] bg-[#141210] py-6 text-[#f3eee5]', className)}>
      <div className="mq-track flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {items.map((m) => (
              <span key={m + k} className="flex items-center gap-10 pr-10 font-editorial text-4xl whitespace-nowrap">
                {m}
                <span className="text-[#961a1c]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Shared hero for inner pages. */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden pt-40 pb-20 sm:pt-48 sm:pb-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 data-split="chars" data-immediate className="mt-8 max-w-[14ch] font-editorial text-[clamp(3.4rem,9vw,9rem)] leading-[0.92] tracking-[-0.02em]">
          {title}
        </h1>
        <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          {intro && (
            <p data-fade data-immediate data-delay="0.5" className="max-w-xl text-[18px] leading-relaxed text-[#141210]/70">
              {intro}
            </p>
          )}
          {children}
        </div>
        <div data-line className="mt-16 h-px w-full bg-[#141210]/15" />
      </div>
    </section>
  )
}

/** Big closing call to action with a line of type that slides with scroll. */
export function CtaBand({ line = 'Your future, our future —', title = 'Open an account online in minutes.', body = 'A relationship manager is with you from the first naira.' }: { line?: string; title?: string; body?: string }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.fromTo('.cta-line', { xPercent: 5 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
    { scope: ref },
  )
  return (
    <section ref={ref} className="relative overflow-hidden bg-[#961a1c] py-28 text-[#f3eee5] sm:py-36">
      <p className="cta-line pointer-events-none font-editorial text-[clamp(6rem,17vw,16rem)] leading-none whitespace-nowrap">
        {line} {line}
      </p>
      <div className="mx-auto mt-16 flex max-w-[1440px] flex-wrap items-end justify-between gap-8 px-5 sm:px-10">
        <div>
          <p data-split="lines" className="font-editorial text-4xl sm:text-5xl">{title}</p>
          <p data-fade className="mt-3 max-w-md text-lg text-[#f3eee5]/75">{body}</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <MagneticButton to="/register" tone="paper">Open an account</MagneticButton>
          <TLink to="/login" className="link-underline text-[15px] font-medium">Client login</TLink>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- Phone mockups ---------------------------- */

export function Phone({ children, className, tab = 0 }: { children: ReactNode; className?: string; tab?: number }) {
  return (
    <div className={cx('relative h-[600px] w-[300px]', className)}>
      <div className="absolute -inset-12 -z-10 rounded-full bg-[#961a1c]/12 blur-3xl" />
      <div className="h-full rounded-[2.6rem] bg-[#141210] p-2.5 shadow-[0_40px_80px_-30px_rgb(20_18_16/0.6)]">
        <div className="relative h-full overflow-hidden rounded-[2.1rem] bg-[#faf7f1] text-[#141210]">
          <div className="flex items-center justify-between px-6 pt-4 text-[11px] font-semibold">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-[#141210]" />
            <span>5G</span>
          </div>
          <div className="flex items-center justify-between px-5 pt-4">
            <Logo variant="dark" className="h-6" />
            <span className="grid size-7 place-items-center rounded-full bg-[#961a1c] text-[10px] font-bold text-white">CO</span>
          </div>
          <div className="relative px-5 pt-8">{children}</div>
          <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-[#141210]/10 bg-white/80 py-3 text-[9px] text-[#141210]/50">
            {['Home', 'Portfolio', 'Invest', 'Markets'].map((t, k) => (
              <span key={t} className={k === tab ? 'font-semibold text-[#961a1c]' : ''}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const SCREENS: { key: string; node: ReactNode }[] = [
  {
    key: 'open',
    node: (
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.18em] text-[#141210]/50 uppercase">Step 3 of 8 · Identity</p>
        <p className="font-editorial text-3xl leading-none">Verify your identity</p>
        <div className="rounded-lg border border-[#141210]/15 bg-white px-3 py-2.5 font-mono text-sm tracking-[0.25em]">221 8493 0211</div>
        <div className="flex items-center gap-3 rounded-lg bg-[#0f7a52]/10 p-3">
          <span className="grid size-8 place-items-center rounded-full bg-[#0f7a52] text-white"><Check className="size-4" /></span>
          <div className="text-xs"><p className="font-semibold">Identity matched</p><p className="text-[#141210]/60">Verified with NIBSS · 1.4s</p></div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 pt-1">{[1, 1, 1, 0].map((d, k) => <span key={k} className={cx('h-1 rounded-full', d ? 'bg-[#961a1c]' : 'bg-[#141210]/15')} />)}</div>
      </div>
    ),
  },
  {
    key: 'fund',
    node: (
      <div className="flex h-[360px] flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[#0f7a52] text-white"><Check className="size-6" /></span>
        <p className="mt-4 text-[10px] tracking-[0.2em] text-[#0f7a52] uppercase">Deposit received</p>
        <p className="num mt-1 font-editorial text-4xl">₦2,500,000</p>
        <p className="mt-1 text-xs text-[#141210]/55">credited to your cash account</p>
      </div>
    ),
  },
  {
    key: 'grow',
    node: (
      <div>
        <p className="text-[10px] tracking-[0.18em] text-[#141210]/50 uppercase">Total portfolio</p>
        <p className="num mt-1 font-editorial text-4xl">₦48,726,410</p>
        <p className="text-xs text-[#0f7a52]">▲ ₦5,681 earned today</p>
        <svg viewBox="0 0 200 70" className="mt-4 w-full">
          <path d="M0 60 C 30 55, 40 48, 60 44 S 100 40, 120 30 S 160 22, 200 8" stroke={CRIMSON} strokeWidth="2" fill="none" />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
          {[['Treasury', '19.75%'], ['Money Mkt', '18.42%'], ['Dollar', '7.38%']].map(([a, b]) => (
            <div key={a} className="rounded-md bg-[#141210]/[0.05] p-2"><p className="text-[#141210]/55">{a}</p><p className="num font-semibold">{b}</p></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'redeem',
    node: (
      <div>
        <p className="text-[10px] tracking-[0.18em] text-[#961a1c] uppercase">Redemption RQ-88412</p>
        <p className="num mt-1 font-editorial text-4xl">₦1,250,000</p>
        <div className="mt-5">
          {['Request received', 'Approved', 'Paid to GTBank ••4821'].map((s, k) => (
            <div key={s} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-6 place-items-center rounded-full bg-[#0f7a52] text-white"><Check className="size-3" /></span>
                {k < 2 && <span className="h-6 w-px bg-[#0f7a52]" />}
              </div>
              <p className="pt-0.5 text-xs font-medium">{s}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

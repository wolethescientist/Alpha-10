import { Check, Plus } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../../components/ui'
import { money } from '../../lib/format'
import { PAYOUT_LABEL, PRODUCTS, project, RISK_LABEL, type Product } from '../../lib/products'
import { useApp } from '../../store/app'
import { Flip, gsap, ScrollTrigger, useGSAP } from '../gsap'
import { CtaBand, Eyebrow, MagneticButton, PageHero } from '../kit'
import { useSiteAnimations } from '../useSiteAnimations'

type Filter = 'all' | 'NGN' | 'USD' | 'funds'

function Row({ p, i, open, onToggle, rate }: { p: Product; i: number; open: boolean; onToggle: () => void; rate: number }) {
  const body = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: body })
  const first = useRef(true)
  const animate = contextSafe((isOpen: boolean) => {
    gsap.to(body.current, { height: isOpen ? 'auto' : 0, duration: 0.7, ease: 'expo.inOut', onComplete: () => ScrollTrigger.refresh() })
    if (isOpen) gsap.from(body.current!.querySelectorAll('.pd-anim'), { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: 'expo.out', delay: 0.15 })
  })
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      gsap.set(body.current, { height: open ? 'auto' : 0 })
      return
    }
    animate(open)
  }, [open, animate])

  return (
    <div data-flip-id={p.id} className="prod-row border-b border-[#141210]/15">
      <button onClick={onToggle} className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-8 text-left sm:grid-cols-[3.5rem_1.5fr_1fr_9rem_3rem] sm:gap-6">
        <span className="num text-sm text-[#141210]/45">{String(i + 1).padStart(2, '0')}</span>
        <span className="font-editorial text-3xl leading-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-[2.6rem]">{p.name}</span>
        <span className="hidden text-sm text-[#141210]/60 sm:block">{p.tagline}</span>
        <span className="num text-right font-editorial text-3xl sm:text-4xl">
          {rate.toFixed(2)}
          <span className="text-lg">%</span>
        </span>
        <span className={cx('hidden size-11 place-items-center justify-self-end rounded-full border border-[#141210]/20 transition-all duration-500 sm:grid', open && 'rotate-45 border-[#961a1c] bg-[#961a1c] text-white')}>
          <Plus className="size-5" />
        </span>
      </button>
      <div ref={body} className="overflow-hidden">
        <div className="grid gap-10 pb-12 sm:pl-[4.5rem] lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="pd-anim max-w-xl text-[17px] leading-relaxed text-[#141210]/75">{p.description}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="pd-anim flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#961a1c]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <dl className="pd-anim grid grid-cols-2 self-start border-t border-l border-[#141210]/15 text-sm">
            {[
              ['Minimum', money(p.minimum, p.currency, { decimals: 0 })],
              ['Tenor', p.tenorLabel],
              ['Liquidity', p.liquidity],
              ['Risk', RISK_LABEL[p.risk]],
              ...(p.payouts ? [['Payouts', p.payouts.map((x) => PAYOUT_LABEL[x]).join(', ')]] : []),
              ...(p.trustee ? [['Trustee', p.trustee]] : []),
            ].map(([k, v]) => (
              <div key={k} className="border-r border-b border-[#141210]/15 p-4">
                <dt className="text-xs tracking-[0.14em] text-[#141210]/50 uppercase">{k}</dt>
                <dd className="mt-1.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

function Calculator() {
  const ref = useRef<HTMLDivElement>(null)
  const out = useRef<HTMLParagraphElement>(null)
  const tbi = PRODUCTS[0]!
  const [amount, setAmount] = useState(5_000_000)
  const [tenor, setTenor] = useState(364)
  const rate = tbi.tenors!.find((t) => t.days === tenor)!.rate
  const earned = project(amount, rate, tenor).at(-1)!.value - amount
  const shown = useRef({ v: earned })
  useGSAP(
    () => {
      gsap.to(shown.current, {
        v: earned,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: () => {
          if (out.current) out.current.textContent = money(shown.current.v, 'NGN', { decimals: 0 })
        },
      })
    },
    { dependencies: [earned], scope: ref },
  )
  return (
    <div ref={ref} className="border border-[#141210]/15 bg-[#faf7f1] p-8 sm:p-10">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[#141210]/60">If you invest</span>
        <span className="num font-editorial text-3xl">{money(amount, 'NGN', { decimals: 0 })}</span>
      </div>
      <input type="range" aria-label="Investment amount" className="range mt-5" min={1_000_000} max={100_000_000} step={500_000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ ['--p' as string]: `${((amount - 1e6) / 99e6) * 100}%` }} />
      <div className="mt-8 flex border border-[#141210]/15">
        {tbi.tenors!.slice(0, 3).map((t) => (
          <button key={t.days} onClick={() => setTenor(t.days)} className={cx('flex-1 py-3 text-sm transition-colors duration-300', tenor === t.days ? 'bg-[#141210] text-[#f3eee5]' : 'text-[#141210]/70 hover:text-[#141210]')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-10 border-t border-[#141210]/15 pt-8">
        <p className="text-sm text-[#141210]/60">You could earn</p>
        <p ref={out} className="num mt-1 font-editorial text-[clamp(3rem,7vw,5.5rem)] leading-none text-[#961a1c]">{money(earned, 'NGN', { decimals: 0 })}</p>
        <p className="mt-3 text-xs text-[#141210]/50">at {rate.toFixed(2)}% p.a. · before 10% WHT · illustrative</p>
      </div>
    </div>
  )
}

export default function Products() {
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const rates = useApp((s) => s.rates)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<string | null>('tbi')
  const flipState = useRef<Flip.FlipState | null>(null)
  useSiteAnimations(ref)

  const list = PRODUCTS.filter((p) => !p.proposed && (filter === 'all' || (filter === 'funds' ? p.category === 'Mutual Fund' : p.currency === filter)))

  const changeFilter = (f: Filter) => {
    flipState.current = Flip.getState(listRef.current!.querySelectorAll('.prod-row'))
    setFilter(f)
  }
  useLayoutEffect(() => {
    if (!flipState.current) return
    Flip.from(flipState.current, {
      duration: 0.8,
      ease: 'expo.inOut',
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.25 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.3 }),
      onComplete: () => ScrollTrigger.refresh(),
    })
    flipState.current = null
  }, [filter])

  return (
    <div ref={ref}>
      <PageHero eyebrow="Products" title={<>Capital, put to <span className="text-[#961a1c]">work.</span></>} intro="Six professionally managed investments across naira and dollars — from ₦1,000 money market units to sovereign-backed treasury placements." />

      <section className="mx-auto max-w-[1440px] px-5 pb-32 sm:px-10">
        <div data-fade className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {([['all', 'All products'], ['NGN', 'Naira'], ['USD', 'Dollar'], ['funds', 'Mutual funds']] as [Filter, string][]).map(([f, l]) => (
              <button key={f} onClick={() => changeFilter(f)} className={cx('rounded-full border px-5 py-2.5 text-sm transition-colors duration-300', filter === f ? 'border-[#141210] bg-[#141210] text-[#f3eee5]' : 'border-[#141210]/20 hover:border-[#141210]')}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-sm text-[#141210]/50">Indicative rates · tap a product for details</p>
        </div>
        <div ref={listRef} className="relative mt-10 border-t border-[#141210]/15">
          {list.map((p, i) => (
            <Row key={p.id} p={p} i={i} rate={rates[p.id] ?? p.rate} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} />
          ))}
        </div>
      </section>

      <section className="border-t border-[#141210]/15 bg-[#ebe4d8]">
        <div className="mx-auto grid max-w-[1440px] gap-16 px-5 py-28 sm:px-10 lg:grid-cols-2 lg:py-36">
          <div>
            <Eyebrow>Treasury Backed Investment</Eyebrow>
            <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">
              The sovereign’s promise, plus a hundred basis points.
            </h2>
            <p data-fade className="mt-8 max-w-md text-[15px] leading-relaxed text-[#141210]/65">Federal Government treasury bills and bonds — default-risk-free instruments — paying you 1% above the instrument rate.</p>
            <div data-fade className="mt-10">
              <MagneticButton to="/register">Invest from ₦1m</MagneticButton>
            </div>
          </div>
          <div data-fade>
            <Calculator />
          </div>
        </div>
      </section>

      <CtaBand line="Start from ₦1,000 —" title="Every investment comes with a certificate." body="Embassy-ready, downloadable the moment you invest." />
    </div>
  )
}

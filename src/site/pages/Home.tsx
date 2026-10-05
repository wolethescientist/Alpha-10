import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { money } from '../../lib/format'
import { PRODUCTS } from '../../lib/products'
import { useApp } from '../../store/app'
import { gsap, useGSAP } from '../gsap'
import { CtaBand, Eyebrow, Ledger, MagneticButton, Marquee, Phone, Ribbons, SCREENS } from '../kit'
import { TLink } from '../SiteLayout'
import { useSiteAnimations } from '../useSiteAnimations'

const BUSINESSES = [
  {
    n: '01',
    t: 'Asset Management',
    d: 'Treasury-backed placements, liquidity solutions, and SEC-registered naira and dollar mutual funds — managed top-down for return and protected bottom-up for risk.',
    to: '/products',
    cta: 'View products',
  },
  {
    n: '02',
    t: 'Advisory',
    d: 'Investment, business, financial and project advisory; debt and capital markets; succession and estate planning for families and enterprises.',
    to: '/services',
    cta: 'Advisory services',
  },
  {
    n: '03',
    t: 'Securities Trading',
    d: 'Execution across fixed income, equities and OTC markets — with best pricing for non-standard volumes, anonymity on large tickets and repo funding.',
    to: '/services',
    cta: 'Trading desk',
  },
]

function Businesses() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = ref.current!.querySelector<HTMLElement>('.biz-track')!
        const distance = () => track.scrollWidth - window.innerWidth
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top top', end: () => `+=${distance()}`, scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
        })
        gsap.utils.toArray<HTMLElement>('.biz-panel').forEach((panel) => {
          gsap.from(panel.querySelectorAll('.biz-anim'), {
            y: 60,
            autoAlpha: 0,
            stagger: 0.08,
            ease: 'expo.out',
            duration: 1,
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 75%' },
          })
        })
        gsap.to('.biz-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } })
      })
    },
    { scope: ref },
  )
  return (
    <section ref={ref} className="relative overflow-hidden bg-[#141210] text-[#f3eee5]">
      <div className="biz-track flex min-h-screen flex-col min-[900px]:w-max min-[900px]:flex-row">
        <div className="flex w-full shrink-0 flex-col justify-center px-5 py-24 sm:px-10 min-[900px]:w-[42vw]">
          <Eyebrow light>The group</Eyebrow>
          <h2 className="mt-8 font-editorial text-[clamp(3rem,6vw,6rem)] leading-[0.95]">
            Three businesses.
            <br />
            <span className="text-[#e06d6f]">One standard.</span>
          </h2>
          <p className="mt-8 max-w-sm text-[#f3eee5]/60">Scroll to explore how Alpha10 serves individuals, corporates and institutions across Nigeria.</p>
        </div>
        {BUSINESSES.map((b) => (
          <article key={b.t} className="biz-panel flex w-full shrink-0 flex-col justify-between border-[#f3eee5]/10 px-5 py-20 sm:px-10 min-[900px]:w-[34vw] min-[900px]:min-w-[460px] min-[900px]:border-l min-[900px]:py-28">
            <p className="biz-anim font-editorial text-[9rem] leading-none text-[#961a1c]">{b.n}</p>
            <div>
              <h3 className="biz-anim font-editorial text-5xl">{b.t}</h3>
              <p className="biz-anim mt-5 max-w-sm leading-relaxed text-[#f3eee5]/65">{b.d}</p>
              <TLink to={b.to} className="biz-anim group mt-8 inline-flex items-center gap-2 text-sm">
                <span className="link-underline">{b.cta}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </TLink>
            </div>
          </article>
        ))}
        <div className="hidden w-[8vw] shrink-0 min-[900px]:block" />
      </div>
      <div className="absolute inset-x-10 bottom-10 hidden h-px bg-[#f3eee5]/15 min-[900px]:block">
        <div className="biz-progress h-px origin-left scale-x-0 bg-[#e06d6f]" />
      </div>
    </section>
  )
}

export default function Home() {
  const ref = useRef<HTMLDivElement>(null)
  const rates = useApp((s) => s.rates)
  useSiteAnimations(ref)
  const marquee = [...PRODUCTS.filter((p) => !p.proposed).map((p) => `${p.short} ${(rates[p.id] ?? p.rate).toFixed(2)}%`), 'SEC-regulated', 'Rated BBB+ by Datapro', 'STL Trustees custody']

  return (
    <div ref={ref}>
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden pt-28">
        <div className="pointer-events-none absolute top-24 right-[-14%] h-[620px] w-[860px] [mask-image:linear-gradient(to_right,transparent,black_28%)] max-lg:top-auto max-lg:right-[-40%] max-lg:bottom-[-10%] max-lg:h-[420px] max-lg:w-[620px] max-lg:opacity-35">
          <Ribbons className="h-full w-full" />
        </div>
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-10">
          <div data-fade data-immediate data-delay="0" className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#141210]/15 pb-5 text-[12px] tracking-[0.16em] text-[#141210]/55 uppercase">
            <span>Asset management</span>
            <span className="hidden size-1 rounded-full bg-[#141210]/30 sm:block" />
            <span>Advisory</span>
            <span className="hidden size-1 rounded-full bg-[#141210]/30 sm:block" />
            <span>Securities trading</span>
            <span className="ml-auto hidden lg:block">Abuja · Lagos</span>
          </div>
          <h1 data-split="chars" data-immediate className="mt-10 max-w-[11ch] font-editorial text-[clamp(3.4rem,10.5vw,10.5rem)] leading-[0.88] tracking-[-0.02em]">
            Wealth, held to a <span className="text-[#961a1c]">higher</span> standard.
          </h1>
          <div className="mt-12 grid items-end gap-10 pb-20 lg:grid-cols-[1fr_auto]">
            <div data-fade data-immediate data-delay="0.7" className="max-w-md">
              <p className="text-[17px] leading-relaxed text-[#141210]/70">
                Sovereign-backed treasury placements, money market and dollar funds, and expert advisory — from an SEC-regulated house rated <span className="text-[#141210]">BBB+</span>.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <MagneticButton to="/register">Start investing</MagneticButton>
                <TLink to="/platform" className="group flex items-center gap-2 text-[15px] font-medium">
                  <span className="link-underline">See the platform</span>
                  <ArrowDown className="size-4 -rotate-90 transition-transform group-hover:translate-x-0.5" />
                </TLink>
              </div>
            </div>
            <div data-fade data-immediate data-delay="1">
              <Ledger />
            </div>
          </div>
        </div>
      </section>

      <Marquee items={marquee} />

      {/* STATEMENT */}
      <section className="mx-auto max-w-[1440px] px-5 py-32 sm:px-10 sm:py-44">
        <Eyebrow>Our purpose</Eyebrow>
        <p data-scrub-words className="mt-10 max-w-5xl font-editorial text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.08]">
          To be a leading financial services group in Nigeria by creating value sustainably — proffering pristine solutions through people, process efficiency and digital transformation.
        </p>
        <div className="mt-20 grid gap-px overflow-hidden border border-[#141210]/15 bg-[#141210]/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: <span>BBB+</span>, l: 'Investment-grade rating, Datapro 2025' },
            { v: <span data-count="1000" data-prefix="₦" />, l: 'Minimum to start in the Money Market Fund' },
            { v: <span data-count="48" data-suffix="h" />, l: 'Withdrawals on Liquidity Management Flex' },
            { v: <span data-count="19.75" data-decimals="2" data-suffix="%" />, l: 'On the 364-day Treasury Backed Investment' },
          ].map((s, i) => (
            <div key={i} className="bg-[#f3eee5] p-8">
              <p className="num font-editorial text-6xl">{s.v}</p>
              <p className="mt-4 max-w-[14rem] text-sm text-[#141210]/60">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <Businesses />

      {/* PRODUCTS TEASER */}
      <section className="mx-auto max-w-[1440px] px-5 py-32 sm:px-10 sm:py-40">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow>Products</Eyebrow>
            <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95]">
              Where your capital works hardest.
            </h2>
          </div>
          <TLink to="/products" className="group inline-flex items-center gap-2 text-[15px] font-medium">
            <span className="link-underline">All six products</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </TLink>
        </div>
        <div data-stagger className="mt-14 grid border-t border-l border-[#141210]/15 md:grid-cols-3">
          {PRODUCTS.filter((p) => ['tbi', 'mmf', 'dollar'].includes(p.id)).map((p) => (
            <TLink key={p.id} to="/products" className="group relative block overflow-hidden border-r border-b border-[#141210]/15 p-8">
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#141210] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
              <div className="relative transition-colors duration-500 group-hover:text-[#f3eee5]">
                <p className="text-xs tracking-[0.18em] uppercase opacity-50">{p.category} · {p.currency}</p>
                <p className="mt-8 font-editorial text-4xl leading-tight">{p.name}</p>
                <p className="num mt-10 font-editorial text-7xl">
                  {(rates[p.id] ?? p.rate).toFixed(2)}
                  <span className="text-3xl">%</span>
                </p>
                <p className="mt-2 text-sm opacity-60">from {money(p.minimum, p.currency, { decimals: 0, compact: p.minimum >= 1e6 })}</p>
              </div>
            </TLink>
          ))}
        </div>
      </section>

      {/* PLATFORM TEASER */}
      <section className="overflow-hidden border-t border-[#141210]/15 bg-[#ebe4d8]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-5 py-28 sm:px-10 lg:grid-cols-2">
          <div>
            <Eyebrow>The platform</Eyebrow>
            <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">
              Every naira, accounted for — live, in your pocket.
            </h2>
            <p data-fade className="mt-8 max-w-md text-[16px] leading-relaxed text-[#141210]/65">
              Open an account, deposit, invest, download certificates and redeem — all without a single email. Interest accrues by the second, right in front of you.
            </p>
            <div data-fade className="mt-10">
              <MagneticButton to="/platform">Explore the platform</MagneticButton>
            </div>
          </div>
          <div className="flex justify-center">
            <div data-parallax="0.25">
              <Phone tab={1}>{SCREENS[2]!.node}</Phone>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  )
}

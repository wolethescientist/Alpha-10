import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { gsap, ScrollSmoother, useGSAP } from '../gsap'
import { CtaBand, PageHero } from '../kit'
import { TLink } from '../SiteLayout'
import { useSiteAnimations } from '../useSiteAnimations'

const SECTIONS = [
  {
    id: 'asset-management',
    n: '01',
    t: 'Asset Management',
    lead: 'Strategic wealth management that maximises returns while minimising risk, through sustainable investment strategies and a top-down, bottom-up portfolio approach.',
    items: [
      ['Treasury Backed Investment', 'FGN treasury bills and bonds at 100bps above the instrument rate.'],
      ['Liquidity Management Investment', 'Money market, fixed income, equities and alternatives with flexible payouts.'],
      ['Liquidity Management Flex', 'From ₦10,000, with 48-hour withdrawals after 30 days.'],
      ['FX Liquidity Management Flex', 'SEC-approved USD money market and fixed income instruments.'],
      ['Alpha10 Money Market Fund', 'An open-ended mutual fund for capital preservation and steady income.'],
      ['Alpha10 Dollar Fund', 'Sovereign and corporate Eurobonds, from $100.'],
    ],
    cta: { to: '/products', label: 'Compare products' },
  },
  {
    id: 'advisory',
    n: '02',
    t: 'Advisory',
    lead: 'Expert guidance in financial, business, corporate and investment advisory — addressing growth, expansion, corporate finance, enterprise risk, strategy and restructuring.',
    items: [
      ['Investment advisory', 'Tailored strategies for individual and institutional investors.'],
      ['Business advisory', 'Management-focused guidance for growing companies.'],
      ['Financial advisory', 'Coverage across every segment of the market.'],
      ['Project advisory & management', 'Project-specific consultation, structuring and oversight.'],
      ['Debt & capital market advisory', 'Guidance on debt instruments and capital-raising.'],
      ['Succession & estate planning', 'Long-term structuring to protect what you have built.'],
      ['Consultancy services', 'General consulting across business domains.'],
    ],
    cta: { to: '/contact', label: 'Speak to an adviser' },
  },
  {
    id: 'securities-trading',
    n: '03',
    t: 'Securities Trading',
    lead: 'Facilitating trades between wholesale market participants with a focus on efficiency, technology and an unwavering commitment to execution.',
    items: [
      ['Trade execution', 'Fixed income, equities and OTC markets.'],
      ['Best pricing', 'For non-standard volumes of securities.'],
      ['Anonymity', 'When executing large-ticket transactions.'],
      ['Price discovery', 'Fair pricing through rigorous market analysis.'],
      ['Market intelligence', 'Insight drawn from deep client relationships.'],
      ['Liquidity provision', 'Across fixed income and OTC markets.'],
      ['Counterparty risk management', 'Preventing counterparty risk in execution.'],
      ['Market bridge', 'Connecting parties unable to trade directly due to approval limits.'],
      ['Trade matching', 'Matching local and foreign trades.'],
      ['Repos & funding', 'Facilitating repurchase agreements and transaction funding.'],
    ],
    cta: { to: '/contact', label: 'Contact the desk' },
  },
] as const

function ServiceSection({ s, dark }: { s: (typeof SECTIONS)[number]; dark: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const left = ref.current!.querySelector<HTMLElement>('.svc-left')!
        const list = ref.current!.querySelector<HTMLElement>('.svc-list')!
        gsap.timeline({
          scrollTrigger: { trigger: left, start: 'top 120px', end: () => `+=${Math.max(0, list.offsetHeight - left.offsetHeight)}`, pin: true, pinSpacing: false, invalidateOnRefresh: true },
        })
        gsap.utils.toArray<HTMLElement>('.svc-item').forEach((item) => {
          gsap.fromTo(item.querySelector('.svc-num'), { color: dark ? 'rgba(243,238,229,0.25)' : 'rgba(20,18,16,0.25)' }, { color: '#961a1c', scrollTrigger: { trigger: item, start: 'top 60%', end: 'bottom 40%', toggleActions: 'play reverse play reverse' }, duration: 0.3 })
        })
      })
    },
    { scope: ref },
  )
  return (
    <section ref={ref} id={s.id} className={dark ? 'bg-[#141210] text-[#f3eee5]' : ''}>
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-28 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-36">
        <div className="svc-left self-start">
          <p data-fade className="font-editorial text-8xl text-[#961a1c]">{s.n}</p>
          <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.8rem,5vw,5rem)] leading-[0.98]">{s.t}</h2>
          <p data-fade className={`mt-6 max-w-md leading-relaxed ${dark ? 'text-[#f3eee5]/65' : 'text-[#141210]/65'}`}>{s.lead}</p>
          <TLink to={s.cta.to} className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium">
            <span className="link-underline">{s.cta.label}</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </TLink>
        </div>
        <ol className="svc-list">
          {s.items.map(([t, d], i) => (
            <li key={t} className="svc-item group relative py-8">
              <div data-line className={`absolute inset-x-0 top-0 h-px ${dark ? 'bg-[#f3eee5]/15' : 'bg-[#141210]/15'}`} />
              <div data-fade className="grid grid-cols-[3.5rem_1fr] gap-4">
                <span className="svc-num num font-editorial text-3xl">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-editorial text-3xl leading-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-4xl">{t}</p>
                  <p className={`mt-2 text-[15px] ${dark ? 'text-[#f3eee5]/55' : 'text-[#141210]/60'}`}>{d}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function Services() {
  const ref = useRef<HTMLDivElement>(null)
  useSiteAnimations(ref)
  return (
    <div ref={ref}>
      <PageHero eyebrow="Services" title={<>Three disciplines. <span className="text-[#961a1c]">One house.</span></>} intro="Asset management, advisory and securities trading — for individuals, corporates and institutional investors across Nigeria.">
        <nav data-fade data-immediate data-delay="0.7" className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={(e) => {
                e.preventDefault()
                ScrollSmoother.get()?.scrollTo(`#${s.id}`, true, 'top 80px')
              }} className="rounded-full border border-[#141210]/20 px-5 py-2.5 text-sm transition-colors hover:bg-[#141210] hover:text-[#f3eee5]">
              {s.n} {s.t}
            </a>
          ))}
        </nav>
      </PageHero>
      {SECTIONS.map((s, i) => (
        <ServiceSection key={s.id} s={s} dark={i === 1} />
      ))}
      <CtaBand line="Built around you —" title="Not sure where to start?" body="Tell us your goals and a relationship manager will recommend the right mix." />
    </div>
  )
}

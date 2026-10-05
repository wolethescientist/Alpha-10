import { useRef } from 'react'
import { gsap, useGSAP } from '../gsap'
import { CtaBand, Eyebrow, MagneticButton, PageHero, Phone, SCREENS } from '../kit'
import { useSiteAnimations } from '../useSiteAnimations'

const STEPS = [
  { k: 'Open', t: 'An account in minutes, not weeks.', d: 'BVN verified instantly with NIBSS, documents scanned from your phone, a relationship manager assigned before you finish your coffee.' },
  { k: 'Fund', t: 'Deposit and watch it land.', d: 'Transfer, card or USSD. Your balance updates in seconds and starts earning the same day.' },
  { k: 'Grow', t: 'Every naira, accounted for.', d: 'Interest accrues by the second. Charts, maturities and certificates are always one tap away.' },
  { k: 'Redeem', t: 'Your money back without paperwork.', d: 'No emails, no forms. Redeem in-app and follow it from request to payout.' },
]

const FEATURES = [
  ['Live portfolio', 'Balances, allocation and interest that update every second.'],
  ['Self-service redemptions', 'Early-exit charges shown upfront, tracked to payout.'],
  ['Investment certificates', 'Embassy-ready PDFs, the moment you invest.'],
  ['Markets & research', 'NGX, FX, yields and weekly insight in one place.'],
  ['Goals & auto-invest', 'Plan for a home, school fees or Hajj on autopilot.'],
  ['Your RM, in-app', 'Chat with your relationship manager directly.'],
  ['Bank-grade security', 'Two-factor sign-in, transaction PINs, device control.'],
  ['Statements on demand', 'Any date range, as PDF or spreadsheet.'],
]

function Showcase() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const screens = gsap.utils.toArray<HTMLElement>('.sc-screen')
        const words = gsap.utils.toArray<HTMLElement>('.sc-word')
        const copies = gsap.utils.toArray<HTMLElement>('.sc-copy')
        gsap.set(screens.slice(1), { autoAlpha: 0, yPercent: 12 })
        gsap.set(copies.slice(1), { autoAlpha: 0, y: 30 })
        gsap.set(words.slice(1), { opacity: 0.15 })
        const tl = gsap.timeline({
          defaults: { duration: 1, ease: 'power2.inOut' },
          scrollTrigger: { trigger: ref.current, start: 'top top', end: `+=${STEPS.length * 90}%`, pin: true, scrub: 0.8, snap: window.matchMedia('(pointer: fine)').matches ? { snapTo: 1 / (STEPS.length - 1), duration: 0.6, ease: 'power2.inOut' } : undefined },
        })
        for (let i = 1; i < STEPS.length; i++) {
          tl.to(screens[i - 1]!, { autoAlpha: 0, yPercent: -12, scale: 0.94 }, i - 1)
            .to(screens[i]!, { autoAlpha: 1, yPercent: 0 }, i - 1)
            .to(copies[i - 1]!, { autoAlpha: 0, y: -30 }, i - 1)
            .to(copies[i]!, { autoAlpha: 1, y: 0 }, i - 0.6)
            .to(words[i - 1]!, { opacity: 0.15 }, i - 1)
            .to(words[i]!, { opacity: 1 }, i - 1)
            .to('.sc-phone', { rotate: i % 2 ? -3 : 3, duration: 1 }, i - 1)
        }
        tl.fromTo('.sc-bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: STEPS.length - 1 }, 0)
      })
    },
    { scope: ref },
  )
  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mx-auto grid min-h-screen max-w-[1440px] items-center gap-6 px-5 pt-24 pb-10 sm:gap-10 sm:px-10 sm:py-20 lg:grid-cols-[1fr_1fr]">
        <div>
          <Eyebrow>How it works</Eyebrow>
          <div className="mt-5 space-y-0 sm:mt-8 sm:space-y-1">
            {STEPS.map((s) => (
              <p key={s.k} className="sc-word font-editorial text-4xl leading-[1.05] sm:text-7xl">
                {s.k}
                <span className="text-[#961a1c]">.</span>
              </p>
            ))}
          </div>
          <div className="relative mt-5 h-14 max-w-md sm:mt-8 sm:h-32">
            {STEPS.map((s) => (
              <div key={s.k} className="sc-copy absolute inset-0">
                <p className="text-lg font-medium">{s.t}</p>
                <p className="mt-2 hidden text-[15px] leading-relaxed text-[#141210]/65 sm:block">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-px max-w-md bg-[#141210]/15">
            <div className="sc-bar h-px origin-left bg-[#961a1c]" />
          </div>
        </div>
        <div className="flex justify-center max-sm:-mb-[290px] max-sm:origin-top max-sm:scale-[0.5]">
          <div className="sc-phone">
            <Phone>
              <div className="relative h-[400px]">
                {SCREENS.map((s) => (
                  <div key={s.key} className="sc-screen absolute inset-0">
                    {s.node}
                  </div>
                ))}
              </div>
            </Phone>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Platform() {
  const ref = useRef<HTMLDivElement>(null)
  useSiteAnimations(ref)
  return (
    <div ref={ref}>
      <PageHero eyebrow="The platform" title={<>Wealth, in your <span className="text-[#961a1c]">pocket.</span></>} intro="A client portal and staff console designed together — so investing with Alpha10 is as effortless online as it is with your relationship manager.">
        <div data-fade data-immediate data-delay="0.7" className="flex flex-wrap gap-4">
          <MagneticButton to="/login">Try the live demo</MagneticButton>
        </div>
      </PageHero>

      <Showcase />

      <section className="bg-[#141210] text-[#f3eee5]">
        <div className="mx-auto max-w-[1440px] px-5 py-28 sm:px-10 sm:py-36">
          <Eyebrow light>Everything included</Eyebrow>
          <h2 data-split="lines" className="mt-6 max-w-3xl font-editorial text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">
            Built for how Nigerians invest today.
          </h2>
          <div data-stagger className="mt-16 grid border-t border-l border-[#f3eee5]/10 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(([t, d], i) => (
              <div key={t} className="group border-r border-b border-[#f3eee5]/10 p-8 transition-colors duration-500 hover:bg-[#961a1c]">
                <p className="num font-editorial text-2xl text-[#e06d6f] transition-colors group-hover:text-[#f3eee5]">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-10 text-lg font-medium">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#f3eee5]/55 group-hover:text-[#f3eee5]/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] items-center gap-16 px-5 py-32 sm:px-10 lg:grid-cols-2">
        <div>
          <Eyebrow>For the team</Eyebrow>
          <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.98]">A staff console that moves at client speed.</h2>
          <p data-fade className="mt-8 max-w-md leading-relaxed text-[#141210]/65">
            Live AUM and flows, a maker-checker approvals queue, client files, product rates and broadcasts. Approve a redemption here and the client’s tracker updates instantly.
          </p>
          <div data-fade className="mt-10">
            <MagneticButton to="/login?staff=1" tone="crimson">Open the staff console</MagneticButton>
          </div>
        </div>
        <div data-clip className="bg-[#141210] p-8 text-[#f3eee5] sm:p-10">
          <p className="text-xs tracking-[0.18em] text-[#f3eee5]/50 uppercase">Assets under management</p>
          <p className="mt-2 font-editorial text-6xl">
            ₦<span data-count="13.7" data-decimals="1" />bn
          </p>
          <div className="mt-8 grid grid-cols-3 gap-px bg-[#f3eee5]/10 text-sm">
            {[
              ['Clients', '49'],
              ['Approvals', '8'],
              ['Net flows', '+₦384m'],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#141210] py-4 pr-4">
                <p className="text-[#f3eee5]/50">{k}</p>
                <p className="num mt-1 text-xl">{v}</p>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 400 120" className="mt-8 w-full" data-draw>
            <path d="M0 110 C 40 100, 60 95, 90 88 S 150 70, 190 66 S 260 40, 300 34 S 360 14, 400 8" stroke="#e06d6f" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      </section>

      <CtaBand line="See it live —" title="Take the demo for a spin." body="Sign in as a client or as staff — every flow works end to end." />
    </div>
  )
}

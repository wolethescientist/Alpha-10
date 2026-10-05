import { useRef } from 'react'
import { gsap, useGSAP } from '../gsap'
import { CtaBand, Eyebrow } from '../kit'
import { useSiteAnimations } from '../useSiteAnimations'

const PILATE = [
  ['P', 'Professionalism', 'The foundation of every execution — rigour, preparation and discretion in all we do.'],
  ['I', 'Innovation', 'Creative solutions to old problems, built with technology and good judgement.'],
  ['L', 'Listening', 'Service that responds to what clients actually need, before they have to ask twice.'],
  ['A', 'Accountability', 'Our stakeholders come first. We own our decisions and their outcomes.'],
  ['T', 'Trust', 'Dependable and reliable — every single time, in every single market.'],
  ['E', 'Equity', 'Fair and just in our dealings with clients, colleagues and communities.'],
] as const

function Values() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.value-item')
        gsap.set(items.slice(1), { autoAlpha: 0 })
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: `+=${items.length * 70}%`, scrub: 0.6, pin: true } })
        items.forEach((item, i) => {
          if (i === 0) return
          tl.to(items[i - 1]!, { autoAlpha: 0, yPercent: -30, duration: 1 }, i)
            .fromTo(item, { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, i)
            .to('.value-letter', { yPercent: (-100 / items.length) * i, duration: 1, ease: 'power2.inOut' }, i)
        })
      })
    },
    { scope: ref },
  )
  return (
    <section ref={ref} className="relative bg-[#141210] text-[#f3eee5]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col justify-center px-5 py-24 sm:px-10">
        <Eyebrow light>Our values · PILATE</Eyebrow>
        <div className="mt-12 grid items-center gap-12 min-[900px]:grid-cols-[auto_1fr]">
          <div className="hidden h-[min(42vh,380px)] overflow-hidden min-[900px]:block">
            <div className="value-letter">
              {PILATE.map(([l]) => (
                <p key={l} className="h-[min(42vh,380px)] font-editorial text-[min(42vh,380px)] leading-none text-[#961a1c]">
                  {l}
                </p>
              ))}
            </div>
          </div>
          <div className="relative min-[900px]:h-64">
            {PILATE.map(([l, w, d]) => (
              <div key={l} className="value-item mb-10 min-[900px]:absolute min-[900px]:inset-0 min-[900px]:mb-0">
                <p className="font-editorial text-6xl text-[#961a1c] min-[900px]:hidden">{l}</p>
                <p className="font-editorial text-5xl sm:text-6xl">{w}</p>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#f3eee5]/65">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  useSiteAnimations(ref)
  return (
    <div ref={ref}>
      <section className="relative overflow-hidden pt-40 pb-24 sm:pt-48">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
          <Eyebrow>About Alpha10</Eyebrow>
          <h1 data-split="chars" data-immediate className="mt-8 max-w-[13ch] font-editorial text-[clamp(3.4rem,9vw,9rem)] leading-[0.92] tracking-[-0.02em]">
            A house built on <span className="text-[#961a1c]">discipline.</span>
          </h1>
          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1fr]">
            <p data-fade data-immediate data-delay="0.5" className="text-[19px] leading-relaxed text-[#141210]/75">
              Alpha10 Group is a Nigerian financial services group committed to wealth management and financial inclusion. Our name reflects an ambition to build ten distinct businesses — and “Alpha” our intent to lead in each of them.
            </p>
            <p data-fade data-immediate data-delay="0.65" className="text-[17px] leading-relaxed text-[#141210]/60">
              Today the group operates across asset management, advisory and securities trading, serving individuals, SMEs, corporates, institutional investors and the public sector in Nigeria and beyond — from offices in Abuja and Lagos.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden">
        <div data-clip className="relative mx-5 h-[70vh] overflow-hidden bg-[#961a1c] sm:mx-10">
          <img src="/mark-light.png" alt="" aria-hidden data-parallax="0.4" className="absolute top-1/2 left-1/2 w-[min(70vw,640px)] -translate-x-1/2 -translate-y-1/2 opacity-90" />
          <p className="absolute bottom-8 left-8 max-w-sm text-sm text-[#f3eee5]/75">The Alpha10 mark — three interlocking waves for our three businesses, moving as one.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-px px-5 py-32 sm:px-10 md:grid-cols-2">
        {[
          { k: 'Vision', t: 'To be a leading financial services group in Nigeria by creating value sustainably.' },
          { k: 'Mission', t: 'To proffer pristine solutions by leveraging people, process efficiency and digital transformation.' },
        ].map((b) => (
          <div key={b.k} className="border-t border-[#141210]/15 py-10 md:pr-16">
            <p data-fade className="text-xs tracking-[0.22em] text-[#961a1c] uppercase">{b.k}</p>
            <p data-split="lines" className="mt-6 font-editorial text-4xl leading-[1.1] sm:text-5xl">{b.t}</p>
          </div>
        ))}
      </section>

      <Values />

      <section className="mx-auto max-w-[1440px] px-5 py-32 sm:px-10">
        <Eyebrow>Regulated & rated</Eyebrow>
        <div data-stagger className="mt-12 grid border-t border-l border-[#141210]/15 md:grid-cols-3">
          {[
            { v: 'SEC', t: 'Registered and regulated', d: 'Alpha10 Fund Management Limited is registered with and regulated by the Securities and Exchange Commission, Nigeria.' },
            { v: 'BBB+', t: 'Investment-grade rating', d: 'Rated BBB+ by Datapro (September 2025) for governance, liquidity of portfolios, capitalisation and low risk.' },
            { v: 'STL', t: 'Independent custody', d: 'Mutual fund assets are held by STL Trustees Limited, independent of the fund manager.' },
          ].map((c) => (
            <div key={c.v} className="border-r border-b border-[#141210]/15 p-8 sm:p-10">
              <p className="font-editorial text-7xl text-[#961a1c]">{c.v}</p>
              <p className="mt-8 text-lg font-medium">{c.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#141210]/60">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#141210]/15 bg-[#ebe4d8]">
        <div className="mx-auto grid max-w-[1440px] gap-16 px-5 py-28 sm:px-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Eyebrow>Beyond the balance sheet</Eyebrow>
            <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.6rem,5vw,4.6rem)] leading-[1]">Investing in the communities we serve.</h2>
          </div>
          <div data-stagger className="space-y-10">
            {[
              { t: 'Financial literacy', d: 'Financial planning seminars that help individuals make better decisions and reach their economic goals with practical strategies.' },
              { t: 'Youth & women empowerment', d: 'Mentorship from experienced professionals, educational support and skill-building programmes that open doors for under-represented groups.' },
            ].map((c, i) => (
              <div key={c.t} className="flex gap-6 border-t border-[#141210]/15 pt-8">
                <span className="num font-editorial text-4xl text-[#961a1c]">0{i + 1}</span>
                <div>
                  <p className="text-xl font-medium">{c.t}</p>
                  <p className="mt-2 leading-relaxed text-[#141210]/65">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand line="A higher standard —" />
    </div>
  )
}

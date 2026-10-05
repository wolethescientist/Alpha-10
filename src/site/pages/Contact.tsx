import { ArrowUpRight, Check, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { cx } from '../../components/ui'
import { FAQS } from '../../lib/content'
import { gsap, ScrollTrigger, useGSAP } from '../gsap'
import { Eyebrow, PageHero } from '../kit'
import { useSiteAnimations } from '../useSiteAnimations'

const field = 'w-full border-b border-[#141210]/25 bg-transparent py-4 text-lg outline-none transition-colors placeholder:text-[#141210]/35 focus:border-[#961a1c]'

function ContactForm() {
  const ref = useRef<HTMLFormElement>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const { contextSafe } = useGSAP({ scope: ref })
  const submit = contextSafe((e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    gsap.timeline({ onComplete: () => setSent(true) })
      .to('.cf-field', { y: -20, autoAlpha: 0, stagger: 0.05, duration: 0.5, ease: 'power3.in', delay: 0.6 })
  })
  return (
    <form ref={ref} onSubmit={submit} className="relative min-h-[460px]">
      {sent ? (
        <SentMessage />
      ) : (
        <div className="space-y-2">
          <div className="cf-field grid gap-2 sm:grid-cols-2 sm:gap-8">
            <input required className={field} placeholder="Full name" aria-label="Full name" />
            <input required type="tel" className={field} placeholder="Phone number" aria-label="Phone number" />
          </div>
          <input required type="email" className={cx(field, 'cf-field')} placeholder="Email address" aria-label="Email address" />
          <select className={cx(field, 'cf-field appearance-none')} aria-label="Enquiry type" defaultValue="Asset management">
            {['Asset management', 'Advisory services', 'Securities trading', 'Existing account', 'Something else'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <textarea rows={3} className={cx(field, 'cf-field resize-none')} placeholder="How can we help?" aria-label="Message" />
          <label className="cf-field flex items-start gap-3 pt-4 text-sm text-[#141210]/60">
            <input required type="checkbox" className="mt-0.5 size-4 accent-[#961a1c]" /> I consent to Alpha10’s privacy policy and terms.
          </label>
          <div className="cf-field pt-6">
            <button disabled={busy} className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-[#141210] pr-2 pl-7 text-[15px] font-medium text-[#f3eee5]">
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#961a1c] transition-transform duration-500 group-hover:scale-y-100" />
              <span className="relative">{busy ? 'Sending…' : 'Send message'}</span>
              <span className="relative grid size-10 place-items-center rounded-full bg-[#f3eee5] text-[#141210] transition-transform duration-500 group-hover:-rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

function SentMessage() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.timeline()
        .from('.sm-circle', { scale: 0, duration: 0.7, ease: 'back.out(2)' })
        .from('.sm-check', { drawSVG: '0%', duration: 0.5 }, '-=0.2')
        .from('.sm-text', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out' }, '-=0.2')
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="flex min-h-[460px] flex-col items-start justify-center">
      <span className="sm-circle grid size-20 place-items-center rounded-full bg-[#961a1c]">
        <svg viewBox="0 0 24 24" className="size-9" fill="none">
          <path className="sm-check" d="M5 12.5l4.5 4.5L19 7.5" stroke="#f3eee5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="sm-text mt-8 font-editorial text-5xl">Thank you.</p>
      <p className="sm-text mt-3 max-w-sm text-[#141210]/65">A member of our team will be in touch within one business day.</p>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const ref = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: ref })
  const toggle = contextSafe((i: number) => {
    const next = open === i ? null : i
    gsap.utils.toArray<HTMLElement>('.faq-body').forEach((el, k) => gsap.to(el, { height: k === next ? 'auto' : 0, duration: 0.6, ease: 'expo.inOut', onComplete: () => ScrollTrigger.refresh() }))
    setOpen(next)
  })
  return (
    <div ref={ref} className="border-t border-[#141210]/15">
      {FAQS.map((f, i) => (
        <div key={f.q} className="border-b border-[#141210]/15">
          <button onClick={() => toggle(i)} className="group flex w-full items-center justify-between gap-6 py-7 text-left">
            <span className="font-editorial text-2xl leading-snug transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl">{f.q}</span>
            <span className={cx('grid size-10 shrink-0 place-items-center rounded-full border border-[#141210]/20 transition-all duration-500', open === i && 'rotate-45 border-[#961a1c] bg-[#961a1c] text-white')}>
              <Plus className="size-4" />
            </span>
          </button>
          <div className="faq-body overflow-hidden" style={{ height: i === 0 ? 'auto' : 0 }}>
            <p className="max-w-2xl pb-8 text-[16px] leading-relaxed text-[#141210]/65">{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null)
  useSiteAnimations(ref)
  return (
    <div ref={ref}>
      <PageHero eyebrow="Contact" title={<>Let’s talk about your <span className="text-[#961a1c]">future.</span></>} intro="Speak to a relationship manager about investing, advisory or trading — or visit us in Abuja and Lagos." />

      <section className="mx-auto grid max-w-[1440px] gap-20 px-5 pb-32 sm:px-10 lg:grid-cols-[1fr_1.2fr]">
        <div data-stagger className="space-y-12">
          {[
            { k: 'Abuja · Head office', v: '13 Mambolo Street, Wuse Zone 2, Abuja' },
            { k: 'Lagos', v: '5th Floor, Eleganza Biro House, Plot 634 Adeyemo Alakija Street, Victoria Island' },
            { k: 'Call us', v: '+234 913 444 4497' },
            { k: 'Write to us', v: 'enquiries@alpha10group.com' },
          ].map((c) => (
            <div key={c.k}>
              <p className="text-xs tracking-[0.2em] text-[#961a1c] uppercase">{c.k}</p>
              <p className="mt-3 max-w-sm font-editorial text-3xl leading-snug">{c.v}</p>
            </div>
          ))}
        </div>
        <div data-fade>
          <ContactForm />
        </div>
      </section>

      <section className="border-t border-[#141210]/15 bg-[#ebe4d8]">
        <div className="mx-auto grid max-w-[1440px] gap-16 px-5 py-28 sm:px-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 data-split="lines" className="mt-6 font-editorial text-[clamp(2.6rem,5vw,4.6rem)] leading-[1]">Answers, before you ask.</h2>
            <p data-fade className="mt-6 max-w-sm text-[#141210]/60">Still unsure? Our customer experience team is a call or an email away.</p>
          </div>
          <div data-fade>
            <Faq />
          </div>
        </div>
      </section>

      <section className="bg-[#141210] text-[#f3eee5]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-8 px-5 py-16 sm:px-10">
          <p className="max-w-2xl text-[#f3eee5]/70">
            <span className="mr-2 inline-flex items-center gap-2 text-[#f3eee5]"><Check className="size-4 text-[#e06d6f]" /> Whistleblowing.</span>
            Report suspected misconduct confidentially. Good-faith reporters are protected from retaliation.
          </p>
          <a href="https://alpha10group.com/whistleblowing/" target="_blank" rel="noreferrer" className="link-underline text-sm">Read the policy</a>
        </div>
      </section>
    </div>
  )
}

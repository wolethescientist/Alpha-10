import { ArrowUpRight } from 'lucide-react'
import { createContext, useContext, useLayoutEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cx, Logo } from '../components/ui'
import { useApp } from '../store/app'
import { gsap, ScrollSmoother, ScrollTrigger, useGSAP } from './gsap'

export const NAV = [
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/products', label: 'Products' },
  { to: '/platform', label: 'Platform' },
  { to: '/contact', label: 'Contact' },
]
const LABELS: Record<string, string> = { '/': 'Alpha10', '/login': 'Client login', '/register': 'Open an account', '/demo': 'Presenter guide', ...Object.fromEntries(NAV.map((n) => [n.to, n.label])) }

const TransitionCtx = createContext<{ go: (to: string) => void } | null>(null)

/** A link that plays the curtain transition before navigating. */
export function TLink({ to, children, className, ...rest }: { to: string; children: ReactNode; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const ctx = useContext(TransitionCtx)
  return (
    <Link
      to={to}
      className={className}
      {...rest}
      onClick={(e) => {
        rest.onClick?.(e)
        if (!ctx || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        ctx.go(to)
      }}
    >
      {children}
    </Link>
  )
}

function Curtain({ label, innerRef }: { label: string; innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="pointer-events-none invisible fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#961a1c] text-[#f3eee5]" aria-hidden>
      <img src="/mark-light.png" alt="" className="curtain-mark h-16 w-auto" />
      <p className="curtain-label mt-6 font-editorial text-4xl">{label}</p>
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(ref.current, { autoAlpha: 1 })
        .fromTo(ref.current, { clipPath: 'circle(0% at 95% 4%)' }, { clipPath: 'circle(150% at 95% 4%)', duration: 0.9, ease: 'power4.inOut' })
        .from('.mm-link', { yPercent: 120, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, '-=0.45')
        .from('.mm-foot', { autoAlpha: 0, y: 20, duration: 0.6 }, '-=0.5')
    },
    { scope: ref },
  )
  useLayoutEffect(() => {
    if (open) tl.current?.timeScale(1).play()
    else tl.current?.timeScale(1.6).reverse()
  }, [open])
  return (
    <div ref={ref} className="invisible fixed inset-0 z-[60] flex flex-col bg-[#141210] px-6 pt-28 pb-10 text-[#f3eee5] lg:hidden">
      <nav className="flex-1 space-y-1">
        {[{ to: '/', label: 'Home' }, ...NAV].map((n) => (
          <div key={n.to} className="overflow-hidden">
            <TLink to={n.to} onClick={onClose} className="mm-link block font-editorial text-6xl leading-[1.1]">
              {n.label}
            </TLink>
          </div>
        ))}
      </nav>
      <div className="mm-foot flex flex-wrap gap-3">
        <TLink to="/login" onClick={onClose} className="rounded-full border border-[#f3eee5]/30 px-5 py-3 text-sm">Client login</TLink>
        <TLink to="/register" onClick={onClose} className="rounded-full bg-[#961a1c] px-5 py-3 text-sm">Open an account</TLink>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-[#141210] text-[#f3eee5]/70">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 sm:px-10">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="font-editorial text-5xl leading-[1.02] text-[#f3eee5] sm:text-6xl">
              Your future,
              <br />
              <span className="text-[#e06d6f]">our future.</span>
            </p>
            <TLink to="/register" className="group mt-8 inline-flex items-center gap-2 text-sm text-[#f3eee5]">
              <span className="link-underline">Open an account</span>
              <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </TLink>
          </div>
          <div className="text-sm">
            <p className="text-xs tracking-[0.18em] text-[#f3eee5]/40 uppercase">Explore</p>
            <ul className="mt-5 space-y-2.5">
              {[{ to: '/', label: 'Home' }, ...NAV].map((n) => (
                <li key={n.to}>
                  <TLink to={n.to} className="link-underline">{n.label}</TLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm">
            <p className="text-xs tracking-[0.18em] text-[#f3eee5]/40 uppercase">Offices</p>
            <p className="mt-5 leading-relaxed">13 Mambolo Street, Wuse Zone 2, Abuja</p>
            <p className="mt-4 leading-relaxed">5th Floor, Eleganza Biro House, Plot 634 Adeyemo Alakija St, Victoria Island, Lagos</p>
          </div>
          <div className="text-sm">
            <p className="text-xs tracking-[0.18em] text-[#f3eee5]/40 uppercase">Contact</p>
            <p className="mt-5">+234 913 444 4497</p>
            <p className="mt-1.5">enquiries@alpha10group.com</p>
            <div className="mt-6 space-y-2.5">
              <TLink to="/login" className="link-underline block w-fit">Client login</TLink>
              <TLink to="/login?staff=1" className="link-underline block w-fit">Staff console</TLink>
              <TLink to="/demo" className="link-underline block w-fit">Presenter guide</TLink>
            </div>
          </div>
        </div>
        <div className="mt-20 flex items-end justify-between overflow-hidden border-t border-[#f3eee5]/10 pt-10">
          <Logo variant="light" className="h-[min(22vw,180px)] opacity-90" />
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-8 text-xs text-[#f3eee5]/40">
          <span>© {new Date().getFullYear()} Alpha10 Group · Alpha10 Fund Management Limited is registered and regulated by the SEC, Nigeria.</span>
          <span>Interactive prototype · rates and market data are simulated</span>
        </div>
      </div>
    </footer>
  )
}

export function SiteLayout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const session = useApp((s) => s.session)
  const curtain = useRef<HTMLDivElement>(null)
  const header = useRef<HTMLElement>(null)
  const covering = useRef(false)
  const [ready, setReady] = useState(false)
  const [menu, setMenu] = useState(false)
  const [label, setLabel] = useState('Alpha10')
  const [scrolled, setScrolled] = useState(false)

  // smooth scrolling for the whole marketing site; pages mount after it exists so pins measure correctly
  useGSAP(() => {
    gsap.set(curtain.current, { yPercent: 100, y: 0, autoAlpha: 1 })
    ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.15, effects: true, smoothTouch: 0 })
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setScrolled(self.scroll() > 30)
        gsap.to(header.current, { yPercent: self.direction === 1 && self.scroll() > 300 ? -100 : 0, duration: 0.45, ease: 'power3.out', overwrite: true })
      },
    })
    setReady(true)
  })

  const go = (to: string) => {
    const path = to.split('?')[0]!
    if (path === loc.pathname) {
      ScrollSmoother.get()?.scrollTo(0, true)
      return
    }
    setLabel(LABELS[path] ?? 'Alpha10')
    covering.current = true
    gsap.timeline()
      .fromTo(curtain.current, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'power4.inOut' })
      .from(curtain.current!.querySelectorAll('.curtain-mark, .curtain-label'), { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, '-=0.35')
      .add(() => navigate(to))
  }

  // reveal the new page once it has rendered
  useLayoutEffect(() => {
    ScrollSmoother.get()?.scrollTop(0)
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
    if (!covering.current) return
    covering.current = false
    gsap.to(curtain.current, { yPercent: -100, duration: 0.85, ease: 'power4.inOut', delay: 0.1 })
  }, [loc.pathname])

  return (
    <TransitionCtx.Provider value={{ go }}>
      <div className="paper-grain font-grotesk text-[#141210] selection:bg-[#961a1c] selection:text-white">
        <header ref={header} className={cx('fixed inset-x-0 top-0 z-[70] transition-[background,border-color] duration-500', scrolled || menu ? 'border-b border-[#141210]/10 bg-[#f3eee5]/85 backdrop-blur-md' : 'border-b border-transparent', menu && 'border-transparent bg-transparent backdrop-blur-none')}>
          <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-10">
            <TLink to="/" aria-label="Alpha10 home" onClick={() => setMenu(false)}>
              {menu ? <Logo variant="light" className="h-9" /> : <Logo variant="dark" className="h-9" />}
            </TLink>
            <nav className="hidden items-center gap-1 text-[14px] lg:flex">
              {NAV.map((n) => {
                const active = loc.pathname === n.to
                return (
                  <TLink key={n.to} to={n.to} className={cx('relative rounded-full px-4 py-2 transition-colors', active ? 'text-[#f3eee5]' : 'text-[#141210]/70 hover:text-[#141210]')}>
                    {active && <span className="absolute inset-0 rounded-full bg-[#141210]" />}
                    <span className="relative">{n.label}</span>
                  </TLink>
                )
              })}
            </nav>
            <div className="flex items-center gap-4 text-[14px]">
              <TLink to={session?.role === 'client' ? '/app' : '/login'} className={cx('link-underline hidden sm:inline', menu && 'text-[#f3eee5]')}>
                {session?.role === 'client' ? 'Dashboard' : 'Client login'}
              </TLink>
              <TLink to="/register" className="hidden rounded-full bg-[#141210] px-5 py-2.5 font-medium text-[#f3eee5] transition-colors hover:bg-[#961a1c] sm:inline-block">
                Open an account
              </TLink>
              <button onClick={() => setMenu((m) => !m)} className={cx('relative grid size-11 place-items-center rounded-full lg:hidden', menu ? 'bg-[#f3eee5] text-[#141210]' : 'bg-[#141210] text-[#f3eee5]')} aria-label={menu ? 'Close menu' : 'Open menu'}>
                <span className={cx('absolute h-px w-4 bg-current transition-transform duration-300', menu ? 'rotate-45' : '-translate-y-1')} />
                <span className={cx('absolute h-px w-4 bg-current transition-transform duration-300', menu ? '-rotate-45' : 'translate-y-1')} />
              </button>
            </div>
          </div>
        </header>
        <MobileMenu open={menu} onClose={() => setMenu(false)} />

        <div id="smooth-wrapper">
          <div id="smooth-content">
            {ready && (
              <>
                <main key={loc.pathname}>
                  <Outlet />
                </main>
                <Footer />
              </>
            )}
          </div>
        </div>
        <Curtain label={label} innerRef={curtain} />
      </div>
    </TransitionCtx.Provider>
  )
}

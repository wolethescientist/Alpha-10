import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BellRing,
  Building2,
  FileCheck2,
  LineChart,
  Lock,
  MessageCircle,
  Repeat,
  ShieldCheck,
  Smartphone,
  Target,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { AnimatedNumber, Button, Logo, Segmented } from '../../components/ui'
import { money } from '../../lib/format'
import { PRODUCTS, project, RISK_LABEL } from '../../lib/products'
import { useApp } from '../../store/app'

const heroSeries = Array.from({ length: 40 }, (_, i) => ({ v: 100 + i * 2.2 + Math.sin(i / 2.5) * 6 + Math.cos(i / 1.3) * 2 }))

const FEATURES = [
  { icon: Zap, title: 'Instant deposits', body: 'Fund by transfer, card or USSD and watch your balance update in seconds.' },
  { icon: Repeat, title: 'Self-service redemptions', body: 'Redeem or switch plans yourself with a live tracker — no emails required.' },
  { icon: FileCheck2, title: 'Certificates on demand', body: 'Download embassy-ready investment certificates the moment you invest.' },
  { icon: LineChart, title: 'Live market intelligence', body: 'NGX, FX, T-bill yields and weekly research in one place.' },
  { icon: Target, title: 'Goal-based saving', body: 'Plan for a home, school fees or Hajj and let auto-invest do the rest.' },
  { icon: MessageCircle, title: 'Your RM, in-app', body: 'Chat with your relationship manager directly inside the portal.' },
  { icon: Lock, title: 'Bank-grade security', body: 'Two-factor login, transaction PINs and device management built in.' },
  { icon: BellRing, title: 'Proactive alerts', body: 'Maturity reminders, income credits and market moves as they happen.' },
]

export default function Landing() {
  const session = useApp((s) => s.session)
  const [amount, setAmount] = useState(5_000_000)
  const [tenor, setTenor] = useState<'91' | '182' | '364'>('364')
  const rate = { '91': 18.6, '182': 19.25, '364': 19.75 }[tenor]
  const proj = project(amount, rate, Number(tenor))
  const earned = proj[proj.length - 1]!.value - amount

  return (
    <div className="min-h-screen bg-bg">
      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden text-white">
        <img src="/mark-light.png" alt="" aria-hidden className="pointer-events-none absolute -top-24 -right-32 w-[620px] animate-float opacity-[0.07]" />
        <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo variant="light" className="h-10" />
          <nav className="hidden items-center gap-8 text-sm text-white/75 md:flex">
            <a href="#products" className="hover:text-white">Products</a>
            <a href="#features" className="hover:text-white">Why Alpha10</a>
            <a href="#calculator" className="hover:text-white">Calculator</a>
            <Link to="/login?staff=1" className="hover:text-white">Staff</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to={session?.role === 'client' ? '/app' : '/login'}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                {session?.role === 'client' ? 'Dashboard' : 'Log in'}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="white" size="sm">Open account</Button>
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white/85">
              <Award className="size-3.5 text-gold-400" /> BBB+ investment-grade rating · Datapro 2025
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Your future,
              <br />
              <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-brand-300 bg-clip-text text-transparent italic">our future.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Treasury-backed returns, money market and dollar funds, expert advisory — now in a beautifully simple portal built for how Nigerians invest today.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" variant="gold" iconRight={<ArrowRight className="size-4" />}>
                  Start investing
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Explore the demo
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm text-white/60">
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold-400" /> SEC-regulated</span>
              <span className="flex items-center gap-2"><Building2 className="size-4 text-gold-400" /> STL Trustees custody</span>
              <span className="flex items-center gap-2"><Smartphone className="size-4 text-gold-400" /> Web & mobile</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="relative">
            <div className="glass rounded-[2rem] p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Total portfolio</p>
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">+18.4% YTD</span>
              </div>
              <p className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
                <AnimatedNumber value={48_726_410.55} format={(n) => money(n)} duration={2.2} />
              </p>
              <div className="mt-4 h-36">
                <ResponsiveContainer>
                  <AreaChart data={heroSeries}>
                    <defs>
                      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d9b96a" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#d9b96a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#e9d39d" strokeWidth={2.2} fill="url(#hg)" animationDuration={2200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { l: 'Treasury', v: '19.75%' },
                  { l: 'Money Market', v: '18.42%' },
                  { l: 'Dollar Fund', v: '7.38%' },
                ].map((x) => (
                  <div key={x.l} className="rounded-2xl bg-white/[0.06] p-3">
                    <p className="text-[11px] text-white/55">{x.l}</p>
                    <p className="num mt-1 font-semibold text-emerald-300">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="glass absolute -bottom-8 -left-4 hidden items-center gap-3 rounded-2xl px-4 py-3 shadow-xl sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">✓</span>
              <div>
                <p className="text-sm font-semibold">Deposit received</p>
                <p className="text-xs text-white/60">₦2,500,000.00 · just now</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-700 uppercase dark:text-brand-300">Asset management</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">An investment for every ambition.</h2>
          <p className="mt-4 text-lg text-muted">From ₦1,000 money market units to sovereign-backed treasury placements and Eurobond funds.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.filter((p) => !p.proposed).map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="card group relative overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-xl">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: p.color }} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">{p.category} · {p.currency}</span>
                <span className="text-xs text-faint">Risk: {RISK_LABEL[p.risk]}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">{p.name}</h3>
              <p className="mt-2 min-h-12 text-sm text-muted">{p.tagline}</p>
              <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
                <div>
                  <p className="text-xs text-muted">Indicative return</p>
                  <p className="num text-2xl font-semibold text-gain">{p.rate.toFixed(2)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Minimum</p>
                  <p className="num font-semibold">{money(p.minimum, p.currency, { decimals: 0 })}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="bg-surface-2/60 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-700 uppercase dark:text-brand-300">Treasury Backed Investment</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">See what your money could earn.</h2>
            <p className="mt-4 text-lg text-muted">Sovereign-backed, default-risk-free, and 100 basis points above the instrument rate.</p>
          </div>
          <div className="card p-7 sm:p-9">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Investment amount</span>
              <span className="num font-semibold">{money(amount, 'NGN', { decimals: 0 })}</span>
            </div>
            <input type="range" className="range mt-4" min={1_000_000} max={100_000_000} step={500_000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ ['--p' as string]: `${((amount - 1e6) / 99e6) * 100}%` }} />
            <div className="mt-6">
              <Segmented value={tenor} onChange={setTenor} options={[{ value: '91', label: '91 days' }, { value: '182', label: '182 days' }, { value: '364', label: '364 days' }]} />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-surface-2 p-5">
                <p className="text-xs text-muted">You could earn</p>
                <p className="mt-1 text-2xl font-semibold text-gain">
                  <AnimatedNumber value={earned} format={(n) => money(n, 'NGN', { decimals: 0 })} duration={0.6} />
                </p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-5">
                <p className="text-xs text-muted">Rate</p>
                <p className="num mt-1 text-2xl font-semibold">{rate.toFixed(2)}%</p>
              </div>
            </div>
            <Link to="/register">
              <Button className="mt-6 w-full" size="lg">
                Invest now
              </Button>
            </Link>
            <p className="mt-3 text-center text-[11px] text-faint">Indicative, before withholding tax. Rates are illustrative for this prototype.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-700 uppercase dark:text-brand-300">The new client experience</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Everything you need. Nothing you don’t.</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-700/8 text-brand-700 dark:text-brand-300">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="crimson-gradient relative overflow-hidden rounded-[2rem] px-8 py-16 text-center text-white sm:px-16">
          <img src="/mark-light.png" alt="" aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 w-96 opacity-10" />
          <h2 className="relative font-display text-4xl font-semibold sm:text-5xl">Open an account in minutes.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/75">BVN verification, document upload and your first investment — all online, all in one sitting.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="white">Open account</Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                Presenter guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="h-10" />
            <p className="mt-4 max-w-sm text-sm text-muted">Alpha10 Fund Management Limited is registered and regulated by the Securities and Exchange Commission, Nigeria.</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Offices</p>
            <p className="mt-3 text-muted">13 Mambolo Street, Wuse Zone 2, Abuja</p>
            <p className="mt-2 text-muted">5th Floor, Eleganza Biro House, Plot 634 Adeyemo Alakija St, Victoria Island, Lagos</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Contact</p>
            <p className="mt-3 text-muted">+234 913 444 4497</p>
            <p className="mt-2 text-muted">enquiries@alpha10group.com</p>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-faint">Interactive prototype · all balances, rates and market data are simulated.</div>
      </footer>
    </div>
  )
}

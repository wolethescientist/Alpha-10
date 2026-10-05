import { motion } from 'framer-motion'
import { ArrowRight, Keyboard, Wand2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Logo } from '../../components/ui'
import { useApp } from '../../store/app'

const SCRIPT = [
  {
    t: 'Open with the brand',
    d: 'Start on the landing page. Point out the Alpha10 colours, the “your future, our future” promise and the live returns calculator.',
    to: '/',
    cta: 'Landing page',
  },
  {
    t: 'Self-service onboarding',
    d: 'Click “Open account”. Use “Fill demo data” on each step to show BVN verification, account-name lookup, the risk quiz and document scanning — then land on a brand-new dashboard.',
    to: '/register',
    cta: 'Sign-up flow',
  },
  {
    t: 'The dashboard moment',
    d: 'Sign in as the Retail persona (OTP: tap “Autofill demo code”). The balance counts up, interest accrues every second, and the market ticker moves. Let the guided tour run.',
    to: '/login',
    cta: 'Sign in',
  },
  {
    t: 'Deposit with animation',
    d: 'Click Deposit → ₦1m → Bank transfer → “I’ve sent the money”. Watch the processing steps, confetti and the balance count up to the new figure.',
  },
  {
    t: 'Invest & get a certificate',
    d: 'Invest → Treasury Backed → 364 days. The projected income animates as you type. On success, open the embassy-ready certificate and download the PDF.',
  },
  {
    t: 'Redeem without emailing anyone',
    d: 'Portfolio → Redeem. Early-exit charges are shown upfront, a PIN authorises it, and a live tracker moves from Requested → Approved → Paid.',
  },
  {
    t: 'Live markets',
    d: 'Open Markets. Use the Demo panel to trigger a Rally or Sell-off and watch every chart, price and the yield curve react.',
  },
  {
    t: 'Flip to the staff console',
    d: 'Demo panel → Staff console. Show AUM, live activity (the deposit you just made is there), RM leaderboard and the approvals queue.',
  },
  {
    t: 'Both sides, connected',
    d: 'Turn off “Auto-approve redemptions”, redeem as the client, then approve it from Approvals — the client’s tracker updates live. Change a product rate or launch the Halal Fund and watch it appear for clients.',
  },
  {
    t: 'Close on mobile',
    d: 'Open “Mobile view” from the Demo panel to show the same portal in a phone frame — ready for iOS and Android.',
  },
]

export default function DemoGuide() {
  const { login, resetDemo, activeClientId } = useApp()
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-bg">
      <div className="hero-gradient text-white">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Link to="/">
            <Logo variant="light" className="h-10" />
          </Link>
          <p className="mt-10 text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Presenter guide</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">A 10-minute walkthrough</h1>
          <p className="mt-4 max-w-2xl text-white/65">Everything is simulated in the browser — no backend, no real money. Data persists between refreshes so you can rehearse, and resets with one click.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="lg" onClick={() => { resetDemo(); login('client', 'c_retail'); nav('/app') }} iconRight={<ArrowRight className="size-4" />}>
              Reset & start demo
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => { login('staff', activeClientId); nav('/staff') }}>
              Open staff console
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="card flex gap-4 p-5">
            <Wand2 className="size-6 shrink-0 text-gold-500" />
            <div>
              <p className="font-semibold">Demo panel</p>
              <p className="text-sm text-muted">The dark “Demo” button (bottom-left) switches personas, moves markets, simulates interest and resets data.</p>
            </div>
          </div>
          <div className="card flex gap-4 p-5">
            <Keyboard className="size-6 shrink-0 text-gold-500" />
            <div>
              <p className="font-semibold">Shortcuts</p>
              <p className="text-sm text-muted"><kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">Shift + D</kbd> toggles the panel. Any 6-digit OTP and 4-digit PIN work.</p>
            </div>
          </div>
        </div>
        <ol className="space-y-4">
          {SCRIPT.map((s, i) => (
            <motion.li key={s.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} className="card flex gap-5 p-6">
              <span className="font-display text-3xl font-semibold text-brand-700/30 dark:text-brand-400/40">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <p className="font-display text-xl font-semibold">{s.t}</p>
                <p className="mt-1.5 text-[15px] text-muted">{s.d}</p>
              </div>
              {s.to && (
                <Link to={s.to} className="self-center">
                  <Button size="sm" variant="outline">{s.cta}</Button>
                </Link>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  MessageCircle,
  Phone,
  Repeat,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Donut, ValueArea } from '../../components/charts'
import { AnimatedNumber, Avatar, Badge, Button, Card, CardHeader, cx, Money, ProgressRing, Sparkline } from '../../components/ui'
import { daysBetween, date, greeting, money, pct } from '../../lib/format'
import { displayName, useNow, useTotals } from '../../lib/hooks'
import { change, formatPrice } from '../../lib/market'
import { portfolioHistory, rmMap } from '../../lib/mock'
import { accrued, holdingValue, maturityDate, productMap } from '../../lib/products'
import { ARTICLES } from '../../lib/content'
import { useAccount, useApp } from '../../store/app'
import { useFx, useMarket } from '../../store/market'
import { useUI } from '../../store/ui'
import { TxnRow } from './Transactions'

const RANGES = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365, ALL: 720 } as const
type Range = keyof typeof RANGES

export default function Dashboard() {
  const acc = useAccount()
  const fx = useFx()
  const totals = useTotals()
  const open = useUI((s) => s.open)
  const hide = useApp((s) => s.hideBalances)
  const [range, setRange] = useState<Range>('3M')
  const [ccy, setCcy] = useState<'NGN' | 'USD'>('NGN')
  const name = displayName(acc.profile)
  const rm = rmMap[acc.profile.rmId]!
  const instruments = useMarket((s) => s.instruments)
  useNow(1000)

  const history = useMemo(() => portfolioHistory(acc, fx, RANGES[range]), [acc, range]) // eslint-disable-line react-hooks/exhaustive-deps
  const series = useMemo(() => {
    const s = [...history.slice(0, -1), { date: new Date().toISOString(), value: totals.totalNGN }]
    return ccy === 'USD' ? s.map((p) => ({ ...p, value: p.value / fx })) : s
  }, [history, totals.totalNGN, ccy, fx])
  const first = series[0]?.value ?? 0
  const last = series[series.length - 1]?.value ?? 0
  const delta = last - first
  const deltaPct = first > 0 ? (delta / first) * 100 : 0
  const headline = ccy === 'NGN' ? totals.totalNGN : totals.totalNGN / fx

  // interest earned per day across holdings (NGN equivalent)
  const perDay = acc.holdings.reduce((a, h) => a + ((h.principal * h.rate) / 36500) * (productMap[h.productId].currency === 'USD' ? fx : 1), 0)

  const allocation = useMemo(() => {
    const m = new Map<string, { name: string; value: number; color: string }>()
    for (const h of acc.holdings) {
      const p = productMap[h.productId]
      const v = holdingValue(h) * (p.currency === 'USD' ? fx : 1)
      const cur = m.get(p.id)
      m.set(p.id, { name: p.short, value: (cur?.value ?? 0) + v, color: p.color })
    }
    const cash = acc.wallet.NGN + acc.wallet.USD * fx
    if (cash > 0) m.set('cash', { name: 'Cash', value: cash, color: 'var(--faint)' })
    return [...m.values()].sort((a, b) => b.value - a.value)
  }, [acc, fx])

  const maturities = acc.holdings
    .filter((h) => h.tenorDays)
    .map((h) => ({ h, mat: maturityDate(h)! }))
    .sort((a, b) => +new Date(a.mat) - +new Date(b.mat))

  const empty = acc.holdings.length === 0
  const noMoney = empty && acc.wallet.NGN + acc.wallet.USD === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {greeting()}, {acc.profile.type === 'corporate' ? name : acc.profile.firstName}
          </h1>
        </div>
        <Badge tone="gold" className="self-start sm:self-auto">{acc.profile.tier} client · {acc.profile.riskProfile}</Badge>
      </div>

      {acc.profile.kycStatus !== 'verified' && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-4 sm:flex-row sm:items-center">
          <AlertCircle className="size-5 shrink-0 text-amber-600" />
          <p className="flex-1 text-sm">
            <b>Your documents are under review.</b> <span className="text-muted">You can invest up to ₦5m while compliance completes verification — usually within a few hours.</span>
          </p>
          <Link to="/app/settings?tab=kyc">
            <Button size="sm" variant="outline">View KYC status</Button>
          </Link>
        </motion.div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        {/* HERO BALANCE */}
        <div data-tour="balance" className="crimson-gradient relative overflow-hidden rounded-[1.75rem] p-6 text-white shadow-[0_30px_60px_-30px_rgb(150_26_28/0.6)] sm:p-8">
          <img src="/mark-light.png" alt="" aria-hidden className="pointer-events-none absolute -top-16 -right-20 w-80 opacity-[0.07]" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-white/70">Total portfolio value</p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                <Money value={headline} currency={ccy} animated />
              </p>
              <div className={cx('mt-3 flex flex-wrap items-center gap-2 text-sm', noMoney && 'hidden')}>
                <span className={cx('num rounded-full px-2.5 py-0.5 font-semibold', delta >= 0 ? 'bg-emerald-400/20 text-emerald-200' : 'bg-red-400/20 text-red-200')}>
                  {delta >= 0 ? '▲' : '▼'} {hide ? '••••' : money(Math.abs(delta), ccy, { compact: true })} ({pct(deltaPct)})
                </span>
                <span className="text-white/60">past {range === 'ALL' ? '2 years' : range}</span>
              </div>
            </div>
            <div className="rounded-full bg-white/10 p-1">
              {(['NGN', 'USD'] as const).map((c) => (
                <button key={c} onClick={() => setCcy(c)} className={cx('rounded-full px-3 py-1 text-xs font-semibold transition', ccy === c ? 'bg-white text-brand-800' : 'text-white/75')}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {noMoney ? (
            <div className="relative mt-6 rounded-2xl border border-dashed border-white/25 p-6 text-center">
              <p className="font-display text-xl font-semibold">Your growth chart starts here</p>
              <p className="mt-1 text-sm text-white/70">Add money to begin earning — interest starts accruing the same day.</p>
              <Button variant="white" size="sm" className="mt-4" icon={<ArrowDownLeft className="size-4" />} onClick={() => open({ kind: 'deposit' })}>
                Make your first deposit
              </Button>
            </div>
          ) : (
            <div className="relative mt-4 -mx-2">
              <ValueArea data={series} currency={ccy} height={170} color="#ffffff" id="hero" showAxis={false} />
            </div>
          )}
          <div className={cx('relative mt-2 flex flex-wrap gap-1.5', noMoney && 'hidden')}>
            {(Object.keys(RANGES) as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cx('rounded-full px-3 py-1 text-xs font-semibold transition', range === r ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white')}>
                {r}
              </button>
            ))}
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: 'Naira assets', v: <Money value={totals.ngn} currency="NGN" compact /> },
              { l: 'Dollar assets', v: <Money value={totals.usd} currency="USD" compact /> },
              { l: 'Cash available', v: <Money value={acc.wallet.NGN} currency="NGN" compact /> },
              {
                l: 'Interest earned',
                v: hide ? <span>••••</span> : <span className="num">{money(totals.interestTotalNGN, 'NGN', { decimals: 2 })}</span>,
              },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/[0.08] p-3.5 backdrop-blur">
                <p className="text-[11px] text-white/60">{x.l}</p>
                <p className="mt-1 truncate text-[15px] font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
          {perDay > 0 && (
            <p className="relative mt-4 flex items-start gap-2 text-xs text-white/70">
              <span className="relative mt-1 flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
              </span>
              <span>
                Earning about <b className="num text-white">{hide ? '••••' : money(perDay, 'NGN')}</b> per day · interest accrues every second
              </span>
            </p>
          )}
        </div>

        {/* QUICK ACTIONS + RM */}
        <div className="flex flex-col gap-6">
          <Card className="p-5" data-tour="quick-actions">
            <CardHeader title="Quick actions" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { l: 'Deposit', icon: ArrowDownLeft, f: () => open({ kind: 'deposit' }), primary: true },
                { l: 'Invest', icon: TrendingUp, f: () => open({ kind: 'invest' }) },
                { l: 'Redeem', icon: ArrowUpRight, f: () => open({ kind: 'redeem' }) },
                { l: 'Switch', icon: Repeat, f: () => open({ kind: 'switch' }) },
                { l: 'Withdraw', icon: Banknote, f: () => open({ kind: 'withdraw' }) },
                { l: 'Auto-invest', icon: CalendarClock, to: '/app/auto-invest' },
              ].map((a) => {
                const inner = (
                  <>
                    <span className={cx('grid size-11 place-items-center rounded-2xl transition group-hover:scale-105', a.primary ? 'bg-brand-700 text-white shadow-[0_8px_20px_-8px_rgb(150_26_28/0.7)]' : 'bg-brand-700/8 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300')}>
                      <a.icon className="size-5" />
                    </span>
                    <span className="text-xs font-semibold">{a.l}</span>
                  </>
                )
                return a.to ? (
                  <Link key={a.l} to={a.to} className="group flex flex-col items-center gap-2 rounded-2xl py-3 transition hover:bg-surface-2">
                    {inner}
                  </Link>
                ) : (
                  <button key={a.l} onClick={a.f} className="group flex flex-col items-center gap-2 rounded-2xl py-3 transition hover:bg-surface-2">
                    {inner}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="flex-1 p-5" data-tour="rm">
            <CardHeader title="Your relationship manager" />
            <div className="mt-4 flex items-center gap-4">
              <div className="relative">
                <Avatar name={rm.name} hue={rm.hue} size={56} />
                <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-gain ring-2 ring-surface" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{rm.name}</p>
                <p className="text-xs text-muted">{rm.title}</p>
                <p className="mt-0.5 text-xs text-gain">Online · replies in ~5 min</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/app/support">
                <Button size="sm" variant="secondary" className="w-full" icon={<MessageCircle className="size-4" />}>
                  Message
                </Button>
              </Link>
              <a href={`tel:${rm.phone.replace(/\s/g, '')}`}>
                <Button size="sm" variant="secondary" className="w-full" icon={<Phone className="size-4" />}>
                  Call
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>

      {empty ? (
        <Card className="overflow-hidden">
          <div className="grid items-center gap-6 p-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-display text-2xl font-semibold">Let’s make your first investment</p>
              <p className="mt-2 text-muted">Start with as little as ₦1,000 in the Alpha10 Money Market Fund, or ₦10,000 in Liquidity Management Flex.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => open({ kind: 'deposit' })} icon={<ArrowDownLeft className="size-4" />}>
                Add money
              </Button>
              <Link to="/app/invest">
                <Button variant="outline">Explore products</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <Card className="p-6">
            <CardHeader title="Asset allocation" subtitle="NGN equivalent at today’s rate" />
            <div className="mt-6">
              <Donut data={allocation} centerLabel="Total" centerValue={<Money value={totals.totalNGN} compact />} size={180} />
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader
              title="My investments"
              subtitle={`${acc.holdings.length} active positions`}
              action={
                <Link to="/app/portfolio" className="text-[13px] font-semibold text-brand-700 dark:text-brand-300">
                  View portfolio →
                </Link>
              }
            />
            <div className="mt-4 divide-y divide-line">
              {acc.holdings.slice(0, 5).map((h) => {
                const p = productMap[h.productId]
                const mat = maturityDate(h)
                const progress = mat ? Math.min(1, daysBetween(h.startDate, new Date()) / h.tenorDays!) : undefined
                return (
                  <div key={h.id} className="flex items-center gap-4 py-3.5">
                    <span className="h-10 w-1 rounded-full" style={{ background: p.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        {h.status === 'redeeming' && <Badge tone="info">Redeeming</Badge>}
                      </div>
                      <p className="num text-xs text-muted">
                        {h.rate.toFixed(2)}% p.a. {mat ? `· matures ${date(mat)}` : `· ${p.liquidity.split('·')[0]}`}
                      </p>
                      {progress !== undefined && (
                        <div className="mt-2 h-1 w-full max-w-48 overflow-hidden rounded-full bg-line">
                          <motion.div className="h-full rounded-full" style={{ background: p.color }} initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1 }} />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        <Money value={holdingValue(h)} currency={p.currency} />
                      </p>
                      <p className="num text-xs text-gain">+{hide ? '••' : money(accrued(h), p.currency)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <CardHeader
            title="Recent activity"
            action={
              <Link to="/app/transactions" className="text-[13px] font-semibold text-brand-700 dark:text-brand-300">
                All transactions →
              </Link>
            }
          />
          <div className="mt-3 divide-y divide-line">
            {acc.txns.slice(0, 6).map((t) => (
              <TxnRow key={t.id} t={t} />
            ))}
            {acc.txns.length === 0 && <p className="py-8 text-center text-sm text-muted">No transactions yet.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader
            title="Markets"
            subtitle="Live · simulated"
            action={
              <Link to="/app/markets" className="text-[13px] font-semibold text-brand-700 dark:text-brand-300">
                More →
              </Link>
            }
          />
          <div className="mt-3 divide-y divide-line">
            {['NGXASI', 'USDNGN', 'TB364', 'BRENT', ...acc.watchlist.slice(0, 2)].map((sym) => {
              const ins = instruments.find((i) => i.symbol === sym)
              if (!ins) return null
              const c = change(ins)
              return (
                <div key={sym} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{ins.symbol}</p>
                    <p className="truncate text-xs text-muted">{ins.name}</p>
                  </div>
                  <Sparkline data={ins.history.slice(-40)} width={64} height={26} />
                  <div className="w-24 text-right">
                    <p key={ins.price} className={cx('num rounded px-1 text-sm font-semibold', c.pct >= 0 ? 'flash-up' : 'flash-down')}>
                      {formatPrice(ins)}
                    </p>
                    <p className={cx('num text-xs font-semibold', c.pct >= 0 ? 'text-gain' : 'text-loss')}>{pct(c.pct)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader title="Upcoming maturities" />
          <div className="mt-4 space-y-3">
            {maturities.length === 0 && <p className="text-sm text-muted">No fixed-tenor investments.</p>}
            {maturities.slice(0, 3).map(({ h, mat }) => {
              const p = productMap[h.productId]
              const left = daysBetween(new Date(), mat)
              return (
                <div key={h.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3.5">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface text-center">
                    <div>
                      <p className="num text-base leading-none font-bold">{Math.max(0, left)}</p>
                      <p className="text-[9px] text-muted uppercase">days</p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.short}</p>
                    <p className="text-xs text-muted">{date(mat)}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    <Money value={h.principal + (h.principal * h.rate * h.tenorDays!) / 36500} currency={p.currency} compact />
                  </p>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader
            title="Goals"
            action={
              <Link to="/app/goals" className="text-[13px] font-semibold text-brand-700 dark:text-brand-300">
                Manage →
              </Link>
            }
          />
          <div className="mt-4 space-y-4">
            {acc.goals.length === 0 && (
              <div className="rounded-2xl bg-surface-2 p-5 text-center text-sm text-muted">
                Save towards a home, school fees or Hajj.
                <Link to="/app/goals" className="mt-2 block font-semibold text-brand-700 dark:text-brand-300">
                  Create a goal
                </Link>
              </div>
            )}
            {acc.goals.slice(0, 2).map((g) => (
              <div key={g.id} className="flex items-center gap-4">
                <ProgressRing value={g.saved / g.target} size={60} stroke={6}>
                  <span className="text-lg">{g.emoji}</span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{g.name}</p>
                  <p className="text-xs text-muted">
                    <Money value={g.saved} currency={g.currency} compact /> of {money(g.target, g.currency, { compact: true })}
                  </p>
                </div>
                <span className="num text-sm font-semibold">{Math.round((g.saved / g.target) * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Link to={`/app/insights/${ARTICLES[0]!.slug}`} className="group relative overflow-hidden rounded-[1.25rem] bg-[#141414] p-6 text-white">
          <img src="/mark-light.png" alt="" aria-hidden className="absolute -right-10 -bottom-10 w-48 opacity-10 transition group-hover:scale-110" />
          <Badge tone="gold">Market insight</Badge>
          <p className="relative mt-4 font-display text-xl leading-snug font-semibold">{ARTICLES[0]!.title}</p>
          <p className="relative mt-2 line-clamp-3 text-sm text-white/60">{ARTICLES[0]!.summary}</p>
          <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">
            Read the update <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      <p className="text-center text-xs text-faint">
        USD balances converted at <AnimatedNumber value={fx} format={(n) => money(n, 'NGN')} /> per dollar
      </p>
    </div>
  )
}

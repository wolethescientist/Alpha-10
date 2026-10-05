import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from '../../components/charts'
import { Badge, Card, CardHeader, cx, PageHeader, Segmented, Sparkline } from '../../components/ui'
import { money, pct } from '../../lib/format'
import { useTotals } from '../../lib/hooks'
import { change, formatPrice, type Instrument } from '../../lib/market'
import { useAccount, useApp } from '../../store/app'
import { useMarket } from '../../store/market'

function LivePrice({ ins, className }: { ins: Instrument; className?: string }) {
  const up = ins.history.length > 1 && ins.price >= ins.history[ins.history.length - 2]!
  return (
    <span key={ins.price} className={cx('num rounded px-1', up ? 'flash-up' : 'flash-down', className)}>
      {formatPrice(ins)}
    </span>
  )
}

function IndexCard({ ins, active, onClick }: { ins: Instrument; active: boolean; onClick: () => void }) {
  const c = change(ins)
  return (
    <button onClick={onClick} className={cx('card p-4 text-left transition', active ? 'ring-2 ring-brand-700' : 'hover:-translate-y-0.5')}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted">{ins.name}</p>
        <span className={cx('num text-xs font-semibold', c.pct >= 0 ? 'text-gain' : 'text-loss')}>{pct(c.pct)}</span>
      </div>
      <p className="mt-2 text-xl font-semibold">
        <LivePrice ins={ins} />
      </p>
      <div className="mt-2">
        <Sparkline data={ins.history.slice(-50)} width={180} height={30} />
      </div>
    </button>
  )
}

export default function Markets() {
  const instruments = useMarket((s) => s.instruments)
  const mood = useMarket((s) => s.mood)
  const acc = useAccount()
  const toggleWatch = useApp((s) => s.toggleWatch)
  const totals = useTotals(false)
  const [sel, setSel] = useState('NGXASI')
  const [sort, setSort] = useState<'all' | 'gainers' | 'losers' | 'watch'>('all')
  const by = (s: string) => instruments.find((i) => i.symbol === s)!
  const selected = by(sel)
  const c = change(selected)

  const chartData = selected.history.map((v, i) => ({ i, value: v }))
  const equities = useMemo(() => {
    const list = instruments.filter((i) => i.kind === 'equity' && (sort !== 'watch' || acc.watchlist.includes(i.symbol)))
    if (sort === 'gainers') return [...list].sort((a, b) => change(b).pct - change(a).pct)
    if (sort === 'losers') return [...list].sort((a, b) => change(a).pct - change(b).pct)
    return list
  }, [instruments, sort, acc.watchlist])

  const tb91 = by('TB91').price
  const tb364 = by('TB364').price
  const b10 = by('FGN10Y').price
  const curve = [
    { t: '91d', y: tb91 },
    { t: '182d', y: (tb91 + tb364) / 2 + 0.15 },
    { t: '364d', y: tb364 },
    { t: '2y', y: tb364 - 0.4 },
    { t: '5y', y: (tb364 + b10) / 2 - 0.3 },
    { t: '10y', y: b10 },
    { t: '20y', y: b10 + 0.35 },
  ]

  // portfolio projection fan, 5 years, monthly steps
  const projection = useMemo(() => {
    const base = totals.totalNGN
    return Array.from({ length: 61 }, (_, m) => {
      const t = m / 12
      const mid = base * Math.pow(1.17, t)
      const spread = 0.035 * Math.sqrt(t) * base * Math.pow(1.17, t)
      return { m, label: m % 12 === 0 ? `Y${t}` : '', base: mid, band: [mid - spread * 1.6, mid + spread * 1.2] as [number, number] }
    })
  }, [totals.totalNGN])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Research"
        title="Markets"
        subtitle="Live prices across Nigerian equities, fixed income, FX and global markets."
        action={
          <span className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold ring-1 ring-line">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gain opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-gain" />
            </span>
            Live · simulated feed {mood !== 'calm' && <Badge tone={mood === 'rally' ? 'gain' : 'loss'}>{mood === 'rally' ? 'Rally' : 'Sell-off'}</Badge>}
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['NGXASI', 'USDNGN', 'TB364', 'BRENT'].map((s) => (
          <IndexCard key={s} ins={by(s)} active={sel === s} onClick={() => setSel(s)} />
        ))}
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{selected.name}</p>
            <p className="mt-1 font-display text-4xl font-semibold">
              <LivePrice ins={selected} />
            </p>
            <p className={cx('num mt-1 text-sm font-semibold', c.pct >= 0 ? 'text-gain' : 'text-loss')}>
              {c.abs >= 0 ? '+' : '−'}
              {Math.abs(c.abs).toLocaleString('en-NG', { maximumFractionDigits: selected.decimals })} ({pct(c.pct)}) today
            </p>
          </div>
          <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto">
            {['NGXASI', 'NGX30', 'USDNGN', 'GBPNGN', 'TB91', 'FGN10Y', 'GOLD', 'SPX', 'UST10Y'].map((s) => (
              <button key={s} onClick={() => setSel(s)} className={cx('rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition', sel === s ? 'bg-brand-700 text-white' : 'bg-surface-2 text-muted hover:text-ink')}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="mk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.pct >= 0 ? '#0f9d6b' : '#d23c3c'} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={c.pct >= 0 ? '#0f9d6b' : '#d23c3c'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="i" hide />
              <YAxis domain={['auto', 'auto']} tickFormatter={(v) => formatPrice(selected, v)} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={80} orientation="right" />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold shadow-xl">{formatPrice(selected, payload[0]!.value as number)}</div>
                  ) : null
                }
                cursor={{ stroke: 'var(--faint)', strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="value" stroke={c.pct >= 0 ? '#0f9d6b' : '#d23c3c'} strokeWidth={2} fill="url(#mk)" isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <CardHeader title="Nigerian equities" subtitle="NGX · prices in naira" action={<Segmented size="sm" value={sort} onChange={setSort} options={[{ value: 'all', label: 'All' }, { value: 'gainers', label: 'Gainers' }, { value: 'losers', label: 'Losers' }, { value: 'watch', label: '★ Watchlist' }]} />} />
          <div className="relative mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-2 font-medium" />
                  <th className="pb-2 font-medium">Symbol</th>
                  <th className="pb-2 font-medium">Sector</th>
                  <th className="pb-2 text-right font-medium">Price</th>
                  <th className="pb-2 text-right font-medium">Change</th>
                  <th className="pb-2 pl-4 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <AnimatePresence initial={false}>
                  {equities.map((e) => {
                    const ec = change(e)
                    const watched = acc.watchlist.includes(e.symbol)
                    return (
                      <motion.tr key={e.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td className="py-2.5 pr-2">
                          <button onClick={() => toggleWatch(e.symbol)} aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}>
                            <Star className={cx('size-4', watched ? 'fill-gold-400 text-gold-400' : 'text-faint')} />
                          </button>
                        </td>
                        <td className="py-2.5">
                          <p className="font-semibold">{e.symbol}</p>
                          <p className="text-xs text-muted">{e.name}</p>
                        </td>
                        <td className="py-2.5 text-xs text-muted">{e.sector}</td>
                        <td className="py-2.5 text-right font-semibold"><LivePrice ins={e} /></td>
                        <td className={cx('num py-2.5 text-right font-semibold', ec.pct >= 0 ? 'text-gain' : 'text-loss')}>{pct(ec.pct)}</td>
                        <td className="py-2.5 pl-4"><Sparkline data={e.history.slice(-40)} width={80} height={24} /></td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {equities.length === 0 && <p className="py-8 text-center text-sm text-muted">Star a stock to add it to your watchlist.</p>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="FGN yield curve" subtitle="Treasury bills & bonds · live" />
            <div className="mt-4 h-48">
              <ResponsiveContainer>
                <LineChart data={curve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="t" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={({ active, payload, label }) => (active && payload?.length ? <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-xl"><span className="text-muted">{label}</span> <b className="num">{(payload[0]!.value as number).toFixed(2)}%</b></div> : null)} />
                  <Line type="monotone" dataKey="y" stroke="#961a1c" strokeWidth={2} dot={{ r: 4, fill: '#961a1c', stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Currencies" subtitle="Official window (NFEM)" />
            <div className="mt-3 divide-y divide-line">
              {['USDNGN', 'GBPNGN', 'EURNGN'].map((s) => {
                const ins = by(s)
                const ic = change(ins)
                return (
                  <div key={s} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold">{ins.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold"><LivePrice ins={ins} /></p>
                      <p className={cx('num text-xs font-semibold', ic.pct >= 0 ? 'text-loss' : 'text-gain')}>{pct(ic.pct)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <CardHeader title={<span className="flex items-center gap-2"><Activity className="size-4 text-brand-700" /> Your portfolio projection</span>} subtitle="Five-year range of outcomes based on your current mix — base case ~17% p.a." />
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <ComposedChart data={projection} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={(v) => money(v, 'NGN', { compact: true })} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={64} orientation="right" />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="band" name="Range" stroke="none" fill="#961a1c" fillOpacity={0.12} animationDuration={1200} />
              <Line type="monotone" dataKey="base" name="Base case" stroke="#961a1c" strokeWidth={2} dot={false} animationDuration={1200} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-brand-700" /> Base case</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-sm bg-brand-700/15" /> Likely range</span>
          <span>Projections are illustrative and not guaranteed.</span>
        </div>
      </Card>
    </div>
  )
}

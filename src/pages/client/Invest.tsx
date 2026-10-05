import { motion } from 'framer-motion'
import { ArrowRight, Calculator, Check, Scale, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from '../../components/charts'
import { AnimatedNumber, Badge, Button, Card, CardHeader, cx, Modal, PageHeader, Segmented, Select } from '../../components/ui'
import { money } from '../../lib/format'
import { PRODUCTS, project, RISK_LABEL, WHT_RATE, type Product } from '../../lib/products'
import type { ProductId } from '../../lib/types'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'

export function RiskMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" title={`Risk: ${RISK_LABEL[level]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx('h-1.5 w-4 rounded-full', i <= level ? 'bg-brand-700 dark:bg-brand-400' : 'bg-line')} />
      ))}
    </div>
  )
}

function ProductCard({ p, rate, i }: { p: Product; rate: number; i: number }) {
  const open = useUI((s) => s.open)
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card group relative flex flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-xl">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: p.color }} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <Badge>{p.category}</Badge>
          <Badge tone={p.currency === 'USD' ? 'gold' : 'neutral'}>{p.currency}</Badge>
        </div>
        <RiskMeter level={p.risk} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{p.name}</h3>
      <p className="mt-1.5 text-sm text-muted">{p.tagline}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2 p-4">
        <div>
          <p className="text-[11px] text-muted">Return</p>
          <p className="num text-xl font-semibold text-gain">{rate.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Minimum</p>
          <p className="num text-xl font-semibold">{money(p.minimum, p.currency, { decimals: 0, compact: p.minimum >= 1e6 })}</p>
        </div>
      </div>
      <ul className="mt-4 flex-1 space-y-1.5 text-[13px] text-muted">
        {p.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-gain" /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link to={`/app/invest/${p.id}`}>
          <Button variant="outline" size="sm" className="w-full">Details</Button>
        </Link>
        <Button size="sm" onClick={() => open({ kind: 'invest', productId: p.id })}>Invest</Button>
      </div>
    </motion.div>
  )
}

export function ReturnsCalculator({ initial = 'tbi' as ProductId }) {
  const rates = useApp((s) => s.rates)
  const enabled = useApp((s) => s.enabled)
  const [pid, setPid] = useState<ProductId>(initial)
  const p = PRODUCTS.find((x) => x.id === pid)!
  const [amount, setAmount] = useState(p.currency === 'NGN' ? 5_000_000 : 5_000)
  const [monthly, setMonthly] = useState(0)
  const [years, setYears] = useState(3)
  const rate = rates[pid] ?? p.rate
  const maxAmt = p.currency === 'NGN' ? 100_000_000 : 100_000
  const maxMonthly = p.currency === 'NGN' ? 2_000_000 : 2_000
  const data = useMemo(() => project(amount, rate, years * 365, monthly).map((d) => ({ ...d, label: `${(d.day / 365).toFixed(1)}y` })), [amount, rate, years, monthly])
  const end = data[data.length - 1]!
  const gain = end.value - end.contributed
  const net = p.unitPrice ? gain : gain * (1 - WHT_RATE)

  return (
    <Card className="p-6">
      <CardHeader title={<span className="flex items-center gap-2"><Calculator className="size-4 text-brand-700" /> Returns calculator</span>} subtitle="Model how your money could grow — compounding included." />
      <div className="mt-6 grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <Select
            value={pid}
            onChange={(e) => {
              const np = PRODUCTS.find((x) => x.id === e.target.value)!
              setPid(np.id)
              setAmount(np.currency === 'NGN' ? 5_000_000 : 5_000)
              setMonthly(0)
            }}
          >
            {PRODUCTS.filter((x) => enabled[x.id]).map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} ({x.currency})
              </option>
            ))}
          </Select>
          {[
            { label: 'Initial investment', v: amount, set: setAmount, min: p.minimum, max: maxAmt, step: p.currency === 'NGN' ? 50_000 : 50 },
            { label: 'Monthly top-up', v: monthly, set: setMonthly, min: 0, max: maxMonthly, step: p.currency === 'NGN' ? 10_000 : 10 },
          ].map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{s.label}</span>
                <span className="num font-semibold">{money(s.v, p.currency, { decimals: 0 })}</span>
              </div>
              <input type="range" className="range mt-3" min={s.min} max={s.max} step={s.step} value={s.v} onChange={(e) => s.set(Number(e.target.value))} style={{ ['--p' as string]: `${((s.v - s.min) / (s.max - s.min)) * 100}%` }} />
            </div>
          ))}
          <div>
            <p className="mb-2 text-sm text-muted">Time horizon</p>
            <Segmented value={String(years)} onChange={(v) => setYears(Number(v))} options={[1, 3, 5, 10].map((y) => ({ value: String(y), label: `${y}y` }))} />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="text-[11px] text-muted">You put in</p>
              <p className="mt-1 text-lg font-semibold"><AnimatedNumber value={end.contributed} format={(n) => money(n, p.currency, { compact: true })} duration={0.5} /></p>
            </div>
            <div className="rounded-2xl bg-gain/[0.08] p-4">
              <p className="text-[11px] text-muted">Net returns</p>
              <p className="mt-1 text-lg font-semibold text-gain"><AnimatedNumber value={net} format={(n) => money(n, p.currency, { compact: true })} duration={0.5} /></p>
            </div>
            <div className="rounded-2xl bg-brand-700 p-4 text-white">
              <p className="text-[11px] text-white/70">Future value</p>
              <p className="mt-1 text-lg font-semibold"><AnimatedNumber value={end.contributed + net} format={(n) => money(n, p.currency, { compact: true })} duration={0.5} /></p>
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="calc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#961a1c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#961a1c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} minTickGap={30} />
                <YAxis tickFormatter={(v) => money(v, p.currency, { compact: true })} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={64} orientation="right" />
                <Tooltip content={<ChartTooltip currency={p.currency} />} />
                <Area type="monotone" dataKey="value" name="Projected value" stroke="#961a1c" strokeWidth={2} fill="url(#calc)" animationDuration={500} />
                <Line type="monotone" dataKey="contributed" name="Contributions" stroke="var(--faint)" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={500} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-brand-700" /> Projected value at {rate.toFixed(2)}%</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-faint" /> Your contributions</span>
            <span>{p.unitPrice ? 'Fund yields are net of fees.' : 'Net of 10% WHT.'} Illustrative only.</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Invest() {
  const rates = useApp((s) => s.rates)
  const enabled = useApp((s) => s.enabled)
  const [filter, setFilter] = useState<'all' | 'NGN' | 'USD' | 'funds'>('all')
  const [compare, setCompare] = useState(false)
  const list = PRODUCTS.filter((p) => enabled[p.id] && (filter === 'all' || (filter === 'funds' ? p.category === 'Mutual Fund' : p.currency === filter)))

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Asset management"
        title="Invest with Alpha10"
        subtitle="Professionally managed by an SEC-licensed fund manager. Compare, model and invest in seconds."
        action={<Button variant="outline" icon={<Scale className="size-4" />} onClick={() => setCompare(true)}>Compare products</Button>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'NGN', label: 'Naira' }, { value: 'USD', label: 'Dollar' }, { value: 'funds', label: 'Mutual funds' }]} />
        <p className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="size-4 text-gain" /> Fund assets held with STL Trustees Limited
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} rate={rates[p.id] ?? p.rate} i={i} />
        ))}
      </div>

      {!enabled.halal && (
        <Link to="/app/halal" className="group flex items-center gap-5 rounded-[1.25rem] border border-dashed border-gold-400/60 bg-gold-400/[0.06] p-6">
          <span className="text-3xl">☪︎</span>
          <div className="flex-1">
            <p className="font-semibold">Coming soon: Alpha10 Halal Fund</p>
            <p className="text-sm text-muted">A Shariah-compliant, profit-sharing investment. Join the waitlist.</p>
          </div>
          <ArrowRight className="size-5 text-gold-600 transition group-hover:translate-x-1" />
        </Link>
      )}

      <ReturnsCalculator />

      <Modal open={compare} onClose={() => setCompare(false)} title="Compare products" size="xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-3 pr-4 font-medium text-muted" />
                {PRODUCTS.filter((p) => enabled[p.id]).map((p) => (
                  <th key={p.id} className="px-3 py-3 align-bottom">
                    <span className="mb-2 block h-1 w-8 rounded-full" style={{ background: p.color }} />
                    <span className="font-semibold">{p.short}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                { l: 'Currency', f: (p: Product) => p.currency },
                { l: 'Return', f: (p: Product) => <span className="num font-semibold text-gain">{(rates[p.id] ?? p.rate).toFixed(2)}%</span> },
                { l: 'Minimum', f: (p: Product) => <span className="num">{money(p.minimum, p.currency, { decimals: 0 })}</span> },
                { l: 'Tenor', f: (p: Product) => p.tenorLabel },
                { l: 'Liquidity', f: (p: Product) => p.liquidity },
                { l: 'Risk', f: (p: Product) => <RiskMeter level={p.risk} /> },
                { l: 'Ideal for', f: (p: Product) => p.idealFor },
              ].map((r) => (
                <tr key={r.l}>
                  <td className="py-3 pr-4 font-medium whitespace-nowrap text-muted">{r.l}</td>
                  {PRODUCTS.filter((p) => enabled[p.id]).map((p) => (
                    <td key={p.id} className="px-3 py-3 align-top text-[13px]">{r.f(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}

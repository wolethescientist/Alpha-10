import { motion } from 'framer-motion'
import { ArrowUpRight, Award, MoreHorizontal, Plus, Repeat } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from '../../components/charts'
import { RedemptionTracker } from '../../components/flows/RedeemFlow'
import { Badge, Button, Card, CardHeader, cx, Empty, Money, PageHeader, Segmented, StatusBadge } from '../../components/ui'
import { date, daysBetween, money, relative } from '../../lib/format'
import { useTotals } from '../../lib/hooks'
import { accrued, holdingValue, maturityDate, PAYOUT_LABEL, productMap } from '../../lib/products'
import type { Holding } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { useFx } from '../../store/market'
import { useUI } from '../../store/ui'

function HoldingCard({ h }: { h: Holding }) {
  const p = productMap[h.productId]
  const open = useUI((s) => s.open)
  const [menu, setMenu] = useState(false)
  const mat = maturityDate(h)
  const held = daysBetween(h.startDate, new Date())
  const progress = h.tenorDays ? Math.min(1, held / h.tenorDays) : Math.min(1, held / p.lockInDays)
  const locked = held < p.lockInDays
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card relative p-5">
      <div className="flex items-start gap-4">
        <span className="mt-1 h-12 w-1.5 rounded-full" style={{ background: p.color }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{p.name}</p>
            <Badge tone={p.currency === 'USD' ? 'gold' : 'neutral'}>{p.currency}</Badge>
            {h.status === 'redeeming' ? <Badge tone="info">Redemption in progress</Badge> : locked ? <Badge tone="warning">In lock-in</Badge> : <Badge tone="gain">Liquid</Badge>}
          </div>
          <p className="num mt-1 text-xs text-muted">
            Started {date(h.startDate)} · {h.rate.toFixed(2)}% p.a.{h.payout ? ` · interest ${PAYOUT_LABEL[h.payout].toLowerCase()}` : ''}
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setMenu((m) => !m)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2" aria-label="More actions">
            <MoreHorizontal className="size-4" />
          </button>
          {menu && (
            <div className="card absolute right-0 z-10 mt-1 w-48 p-1.5" onMouseLeave={() => setMenu(false)}>
              <button onClick={() => { setMenu(false); open({ kind: 'switch', holdingId: h.id }) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"><Repeat className="size-4" /> Switch plan</button>
              <Link to={`/app/portfolio/${h.id}/certificate`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"><Award className="size-4" /> Certificate</Link>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-muted">Invested</p>
          <p className="text-sm font-semibold"><Money value={h.principal} currency={p.currency} /></p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Interest earned</p>
          <p className="text-sm font-semibold text-gain"><Money value={accrued(h)} currency={p.currency} /></p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted">Current value</p>
          <p className="text-sm font-semibold"><Money value={holdingValue(h)} currency={p.currency} /></p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[11px] text-muted">
          <span>{h.tenorDays ? `Day ${Math.min(held, h.tenorDays)} of ${h.tenorDays}` : locked ? `Lock-in: ${p.lockInDays - held} days left` : 'Lock-in complete'}</span>
          {mat && <span>Matures {date(mat)}</span>}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full rounded-full" style={{ background: p.color }} initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1 }} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary" icon={<Plus className="size-4" />} onClick={() => open({ kind: 'invest', productId: p.id })}>Top up</Button>
        <Button size="sm" variant="secondary" icon={<ArrowUpRight className="size-4" />} disabled={h.status === 'redeeming'} onClick={() => open({ kind: 'redeem', holdingId: h.id })}>Redeem</Button>
        <Link to={`/app/portfolio/${h.id}/certificate`}>
          <Button size="sm" variant="secondary" className="w-full" icon={<Award className="size-4" />}>Certificate</Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function Portfolio() {
  const acc = useAccount()
  const fx = useFx()
  const totals = useTotals()
  const allRedemptions = useApp((s) => s.redemptions)
  const redemptions = allRedemptions.filter((r) => r.clientId === acc.profile.id)
  const [ccy, setCcy] = useState<'all' | 'NGN' | 'USD'>('all')
  const open = useUI((s) => s.open)
  const list = acc.holdings.filter((h) => ccy === 'all' || productMap[h.productId].currency === ccy)
  const principalNGN = acc.holdings.reduce((a, h) => a + h.principal * (productMap[h.productId].currency === 'USD' ? fx : 1), 0)
  const weighted = principalNGN > 0 ? acc.holdings.reduce((a, h) => a + h.rate * h.principal * (productMap[h.productId].currency === 'USD' ? fx : 1), 0) / principalNGN : 0
  const income = acc.holdings.map((h) => {
    const p = productMap[h.productId]
    return { name: p.short, value: accrued(h) * (p.currency === 'USD' ? fx : 1), color: p.color }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio" subtitle="Your investments, interest and redemptions in one view." action={<Button icon={<Plus className="size-4" />} onClick={() => open({ kind: 'invest' })}>New investment</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: 'Portfolio value', v: <Money value={totals.totalNGN} animated /> },
          { l: 'Amount invested', v: <Money value={principalNGN} /> },
          { l: 'Interest earned', v: <span className="text-gain"><Money value={totals.interestTotalNGN} /></span> },
          { l: 'Weighted yield', v: <span className="num">{weighted.toFixed(2)}% p.a.</span> },
        ].map((s) => (
          <Card key={s.l} className="p-5">
            <p className="text-[13px] text-muted">{s.l}</p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight">{s.v}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={ccy} onChange={setCcy} options={[{ value: 'all', label: 'All holdings' }, { value: 'NGN', label: 'Naira' }, { value: 'USD', label: 'Dollar' }]} />
        <Button variant="ghost" size="sm" icon={<Repeat className="size-4" />} onClick={() => open({ kind: 'switch' })}>Switch plan</Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <Empty icon={<Plus className="size-6" />} title="No investments here yet" body="Start with any amount from ₦1,000." action={<Button onClick={() => open({ kind: 'invest' })}>Invest now</Button>} />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((h) => (
            <HoldingCard key={h.id} h={h} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {income.length > 0 && (
          <Card className="p-6">
            <CardHeader title="Interest earned by product" subtitle="NGN equivalent, since each investment started" />
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <BarChart data={income} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => money(v, 'NGN', { compact: true })} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56} animationDuration={900}>
                    {income.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        <Card className="p-6">
          <CardHeader title="Redemption requests" subtitle="Tracked live, end to end" />
          <div className="mt-4 space-y-4">
            {redemptions.length === 0 && <p className="rounded-2xl bg-surface-2 p-5 text-sm text-muted">No redemptions yet. When you redeem, you can follow every step here.</p>}
            {redemptions.slice(0, 4).map((r) => (
              <div key={r.id} className={cx('rounded-2xl border border-line p-4')}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{productMap[r.productId].short} · <span className="num">{money(r.net, r.currency)}</span></p>
                    <p className="text-xs text-muted">{r.id} · {relative(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.status !== 'paid' && r.status !== 'rejected' && (
                  <div className="mt-4">
                    <RedemptionTracker id={r.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

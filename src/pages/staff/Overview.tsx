import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ClipboardCheck, ShieldCheck, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip, Donut, ValueArea } from '../../components/charts'
import { AnimatedNumber, Avatar, Badge, Button, Card, CardHeader, cx, PageHeader } from '../../components/ui'
import { money, relative, uid } from '../../lib/format'
import { RMS } from '../../lib/mock'
import { aumByProduct, aumTrend, netFlows, useStaffClients } from '../../lib/staff'
import type { ActivityItem } from '../../lib/types'
import { useApp } from '../../store/app'

const ACT_ICON: Record<ActivityItem['kind'], typeof Users> = { deposit: ArrowDownLeft, investment: TrendingUp, redemption: ArrowUpRight, signup: UserPlus, kyc: ShieldCheck, switch: ArrowLeftRight, system: ClipboardCheck }

const NAMES = ['Tunde A.', 'Ifeoma N.', 'Musa K.', 'Funke B.', 'Obinna E.', 'Hadiza U.', 'Segun L.', 'Amina G.', 'Kelechi O.', 'Zainab I.']
const EVENTS: { kind: ActivityItem['kind']; text: string; amount?: [number, number] }[] = [
  { kind: 'deposit', text: 'deposited via bank transfer', amount: [50_000, 8_000_000] },
  { kind: 'investment', text: 'invested in Treasury Backed', amount: [1_000_000, 25_000_000] },
  { kind: 'investment', text: 'invested in Money Market Fund', amount: [10_000, 2_000_000] },
  { kind: 'investment', text: 'invested in Flex', amount: [10_000, 3_000_000] },
  { kind: 'signup', text: 'opened a new account online' },
  { kind: 'kyc', text: 'uploaded KYC documents' },
]

/** Trickles simulated platform activity into the feed so the console feels live. */
function useLiveFeed() {
  useEffect(() => {
    const t = setInterval(() => {
      const e = EVENTS[Math.floor(Math.random() * EVENTS.length)]!
      const who = NAMES[Math.floor(Math.random() * NAMES.length)]!
      const amount = e.amount ? Math.round((e.amount[0] + Math.random() * (e.amount[1] - e.amount[0])) / 1000) * 1000 : undefined
      useApp.setState((s) => ({ activity: [{ id: uid('a_'), date: new Date().toISOString(), kind: e.kind, text: `${who} ${e.text}`, amount, currency: 'NGN' as const }, ...s.activity].slice(0, 60) }))
    }, 7000)
    return () => clearInterval(t)
  }, [])
}

export default function Overview() {
  useLiveFeed()
  const rows = useStaffClients()
  const activity = useApp((s) => s.activity)
  const redemptions = useApp((s) => s.redemptions)
  const accounts = useApp((s) => s.accounts)
  const total = rows.reduce((a, r) => a + r.aum, 0)
  const trend = aumTrend(total)
  const flows = netFlows()
  const byProduct = aumByProduct(rows)
  const pendingRed = redemptions.filter((r) => r.status === 'pending')
  const pendingKyc = Object.values(accounts).filter((a) => a.profile.kycStatus === 'pending').length + rows.filter((r) => !r.accountId && r.kyc === 'incomplete').length
  const regions = ['North', 'Southwest', 'South-South', 'South-East'].map((r, i) => ({ name: r, value: rows.filter((x) => x.region === r).reduce((a, x) => a + x.aum, 0), color: ['var(--p-tbi)', 'var(--p-lmi)', 'var(--p-lmf)', 'var(--p-fxflex)'][i]! }))
  const rmBoard = RMS.map((rm) => ({ rm, aum: rows.filter((r) => r.rmId === rm.id).reduce((a, r) => a + r.aum, 0), clients: rows.filter((r) => r.rmId === rm.id).length })).sort((a, b) => b.aum - a.aum)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Alpha10 Fund Management" title="Business overview" subtitle="Live view of assets, flows, clients and operations." action={<Link to="/staff/approvals"><Button icon={<ClipboardCheck className="size-4" />}>Approvals ({pendingRed.length + pendingKyc})</Button></Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: 'Assets under management', v: <AnimatedNumber value={total} format={(n) => money(n, 'NGN', { compact: true })} />, s: <span className="text-gain">▲ 2.8% this month</span>, icon: Wallet },
          { l: 'Active clients', v: <span className="num">{rows.length.toLocaleString()}</span>, s: `${rows.filter((r) => r.type === 'corporate').length} corporate · ${rows.filter((r) => r.type !== 'corporate').length} individual`, icon: Users },
          { l: 'Net flows (30d)', v: <span className="num">{money(flows[flows.length - 1]!.net, 'NGN', { compact: true, sign: true })}</span>, s: 'Inflows less redemptions', icon: TrendingUp },
          { l: 'Pending approvals', v: <span className="num">{pendingRed.length + pendingKyc}</span>, s: `${pendingRed.length} redemptions · ${pendingKyc} KYC`, icon: ClipboardCheck },
        ].map((k, i) => (
          <motion.div key={k.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cx('p-5', i === 0 && 'crimson-gradient border-0 text-white')}>
              <div className="flex items-center justify-between">
                <p className={cx('text-[13px]', i === 0 ? 'text-white/70' : 'text-muted')}>{k.l}</p>
                <k.icon className={cx('size-4', i === 0 ? 'text-white/60' : 'text-faint')} />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{k.v}</p>
              <p className={cx('mt-1 text-xs', i === 0 ? 'text-white/70' : 'text-muted')}>{k.s}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <CardHeader title="AUM trend" subtitle="Last 12 months · NGN equivalent" />
          <div className="mt-4">
            <ValueArea data={trend} height={260} id="aum" xFormat={(d) => new Date(d).toLocaleDateString('en-GB', { month: 'short' })} />
          </div>
        </Card>
        <Card className="flex flex-col p-6">
          <CardHeader title="Live activity" subtitle="Across all channels" action={<span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-gain opacity-75" /><span className="relative inline-flex size-2.5 rounded-full bg-gain" /></span>} />
          <div className="mt-3 max-h-[290px] flex-1 overflow-y-auto scrollbar-thin">
            <AnimatePresence initial={false}>
              {activity.slice(0, 14).map((a) => {
                const I = ACT_ICON[a.kind]
                return (
                  <motion.div key={a.id} layout initial={{ opacity: 0, x: -12, backgroundColor: 'rgba(150,26,28,0.08)' }} animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }} transition={{ duration: 0.8 }} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted"><I className="size-4" /></span>
                    <p className="min-w-0 flex-1 truncate text-[13px]">{a.text}</p>
                    <div className="text-right">
                      {a.amount && <p className="num text-[13px] font-semibold">{money(a.amount, a.currency ?? 'NGN', { compact: true })}</p>}
                      <p className="text-[11px] text-faint">{relative(a.date)}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <CardHeader title="Monthly flows" subtitle="Subscriptions vs redemptions" />
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={flows} stackOffset="sign" margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => money(v, 'NGN', { compact: true })} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={60} />
                <ReferenceLine y={0} stroke="var(--line)" />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="inflow" name="Subscriptions" stackId="f" fill="var(--color-gain)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Redemptions" stackId="f" fill="#961a1c" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-gain" /> Subscriptions</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-700" /> Redemptions</span>
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="AUM by region" />
          <div className="mt-5">
            <Donut data={regions} centerLabel="Regions" centerValue="4" size={150} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <CardHeader title="AUM by product" />
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={byProduct} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: unknown) => money(Number(v), 'NGN', { compact: true }), fontSize: 11, fill: 'var(--muted)' }}>
                  {byProduct.map((d) => (
                    <Cell key={d.id} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Relationship managers" subtitle="Book size" />
          <div className="mt-4 space-y-3">
            {rmBoard.map(({ rm, aum, clients }, i) => (
              <div key={rm.id} className="flex items-center gap-3">
                <span className="num w-4 text-xs font-bold text-faint">{i + 1}</span>
                <Avatar name={rm.name} hue={rm.hue} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{rm.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                    <motion.div className="h-full rounded-full bg-brand-700" initial={{ width: 0 }} animate={{ width: `${(aum / rmBoard[0]!.aum) * 100}%` }} transition={{ duration: 1, delay: i * 0.08 }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="num text-sm font-semibold">{money(aum, 'NGN', { compact: true })}</p>
                  <p className="text-[11px] text-muted">{clients} clients · {rm.region}</p>
                </div>
              </div>
            ))}
          </div>
          {pendingRed.length > 0 && (
            <Link to="/staff/approvals" className="mt-5 flex items-center justify-between rounded-2xl bg-amber-500/10 p-4 text-sm">
              <span><b>{pendingRed.length} redemption{pendingRed.length > 1 ? 's' : ''}</b> awaiting approval</span>
              <Badge tone="warning">Review →</Badge>
            </Link>
          )}
        </Card>
      </div>
    </div>
  )
}

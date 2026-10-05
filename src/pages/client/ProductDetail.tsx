import { ArrowLeft, Check, FileText, Landmark, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Donut } from '../../components/charts'
import { Badge, Button, Card, CardHeader } from '../../components/ui'
import { money } from '../../lib/format'
import { PAYOUT_LABEL, productMap, RISK_LABEL } from '../../lib/products'
import type { ProductId } from '../../lib/types'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'
import { ReturnsCalculator, RiskMeter } from './Invest'

const ALLOC_COLORS = ['var(--p-tbi)', 'var(--p-lmi)', 'var(--p-lmf)', 'var(--p-fxflex)']

export default function ProductDetail() {
  const { id } = useParams()
  const p = productMap[id as ProductId]
  const rate = useApp((s) => (p ? (s.rates[p.id] ?? p.rate) : 0))
  const open = useUI((s) => s.open)
  if (!p) return <Navigate to="/app/invest" replace />

  return (
    <div className="space-y-6">
      <Link to="/app/invest" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All products
      </Link>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#141414] p-8 text-white sm:p-10">
        <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: p.color }} />
        <img src="/mark-light.png" alt="" aria-hidden className="absolute -right-16 -bottom-20 w-80 opacity-[0.07]" />
        <div className="relative flex flex-wrap gap-2">
          <Badge tone="gold">{p.category}</Badge>
          <Badge className="bg-white/10 text-white/80">{p.currency}</Badge>
          {p.trustee && <Badge className="bg-white/10 text-white/80">Trustee: {p.trustee}</Badge>}
        </div>
        <h1 className="relative mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">{p.name}</h1>
        <p className="relative mt-3 max-w-2xl text-white/65">{p.description}</p>
        <div className="relative mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { l: 'Current return', v: <span className="text-emerald-300">{rate.toFixed(2)}%</span> },
            { l: 'Minimum', v: money(p.minimum, p.currency, { decimals: 0 }) },
            { l: 'Tenor', v: p.tenorLabel.split('·')[0] },
            { l: 'Risk', v: RISK_LABEL[p.risk] },
          ].map((x) => (
            <div key={x.l}>
              <p className="text-xs text-white/50">{x.l}</p>
              <p className="num mt-1 text-xl font-semibold">{x.v}</p>
            </div>
          ))}
        </div>
        <Button size="lg" variant="gold" className="relative mt-8" onClick={() => open({ kind: 'invest', productId: p.id })}>
          Invest in {p.short}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Key features" />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gain/15 text-gain">
                  <Check className="size-3.5" />
                </span>
                {f}
              </li>
            ))}
            <li className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gain/15 text-gain"><Check className="size-3.5" /></span>
              Investment certificate usable for visa applications
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gain/15 text-gain"><Check className="size-3.5" /></span>
              Online access, monthly statements, 5-day redemptions
            </li>
          </ul>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line p-5">
              <p className="flex items-center gap-2 text-sm font-semibold"><Landmark className="size-4 text-brand-700" /> Liquidity</p>
              <p className="mt-2 text-sm text-muted">{p.liquidity}</p>
            </div>
            <div className="rounded-2xl border border-line p-5">
              <p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-brand-700" /> Ideal for</p>
              <p className="mt-2 text-sm text-muted">{p.idealFor}</p>
            </div>
          </div>
          {p.tenors && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold">Rates by tenor</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {p.tenors.map((t) => (
                  <div key={t.days} className="rounded-xl bg-surface-2 p-3 text-center">
                    <p className="text-xs text-muted">{t.label}</p>
                    <p className="num font-semibold text-gain">{t.rate.toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {p.payouts && (
            <p className="mt-6 text-sm text-muted">
              <b className="text-ink">Interest payout options:</b> {p.payouts.map((x) => PAYOUT_LABEL[x]).join(', ')}
            </p>
          )}
        </Card>
        <Card className="p-6">
          <CardHeader title="Asset allocation" subtitle="Target mix" action={<RiskMeter level={p.risk} />} />
          <div className="mt-6">
            <Donut hideValues data={p.allocation.map((a, i) => ({ ...a, color: ALLOC_COLORS[i % ALLOC_COLORS.length]! }))} centerLabel="Mix" centerValue={<span>{p.allocation.length} assets</span>} size={170} />
          </div>
          <div className="mt-6 space-y-2">
            {['Product fact sheet', 'Terms & conditions', p.trustee ? 'Trust deed summary' : 'Investment mandate'].map((d) => (
              <button key={d} className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-left text-sm hover:bg-surface-2">
                <FileText className="size-4 text-muted" /> <span className="flex-1">{d}</span> <span className="text-xs text-faint">PDF</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
      {!p.proposed && <ReturnsCalculator key={p.id} initial={p.id} />}
    </div>
  )
}

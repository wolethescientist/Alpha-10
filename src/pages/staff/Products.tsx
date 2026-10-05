import { Rocket } from 'lucide-react'
import { Badge, Button, Card, PageHeader, Toggle } from '../../components/ui'
import { money } from '../../lib/format'
import { PRODUCTS } from '../../lib/products'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'

export default function Products() {
  const { rates, enabled, setRate, setEnabled } = useApp()
  const toast = useUI((s) => s.toast)
  return (
    <div className="space-y-6">
      <PageHeader title="Products & rates" subtitle="Change a rate or launch a product here — every client sees it instantly." />
      <div className="grid gap-5 lg:grid-cols-2">
        {PRODUCTS.map((p) => {
          const rate = rates[p.id] ?? p.rate
          const min = Math.max(0, p.rate - 5)
          const max = p.rate + 5
          return (
            <Card key={p.id} className="relative overflow-hidden p-6">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: p.color }} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{p.name}</p>
                    <Badge tone={p.currency === 'USD' ? 'gold' : 'neutral'}>{p.currency}</Badge>
                    {p.proposed && <Badge tone="brand">Proposed</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted">{p.tenorLabel} · min {money(p.minimum, p.currency, { decimals: 0 })}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {enabled[p.id] ? 'Live' : 'Hidden'}
                  <Toggle
                    checked={enabled[p.id]}
                    onChange={(v) => {
                      setEnabled(p.id, v)
                      toast({ kind: v ? 'success' : 'info', title: v ? `${p.short} is live` : `${p.short} hidden`, body: v ? 'Clients have been notified.' : 'No longer offered to clients.' })
                    }}
                    label={`Toggle ${p.name}`}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <p className="text-sm text-muted">Headline rate</p>
                <p className="num font-display text-3xl font-semibold text-gain">{rate.toFixed(2)}%</p>
              </div>
              <input
                type="range"
                className="range mt-3"
                min={min}
                max={max}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(p.id, Number(e.target.value))}
                style={{ ['--p' as string]: `${((rate - min) / (max - min)) * 100}%` }}
                aria-label={`${p.name} rate`}
              />
              <div className="mt-1 flex justify-between text-[11px] text-faint">
                <span>{min.toFixed(1)}%</span>
                <span>Original {p.rate.toFixed(2)}%</span>
                <span>{max.toFixed(1)}%</span>
              </div>
              {p.proposed && !enabled[p.id] && (
                <Button className="mt-5 w-full" variant="gold" icon={<Rocket className="size-4" />} onClick={() => { setEnabled(p.id, true); toast({ kind: 'success', title: `${p.name} launched 🚀`, body: 'Every client has been notified in-app.' }) }}>
                  Launch to clients
                </Button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

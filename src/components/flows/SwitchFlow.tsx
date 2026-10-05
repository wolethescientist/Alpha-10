import { ArrowDown, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { money } from '../../lib/format'
import { holdingValue, PRODUCTS, productMap } from '../../lib/products'
import type { ProductId } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { Badge, Button, cx, SuccessMark } from '../ui'
import { celebrate, PinStep, Processing, Row } from './shared'

export function SwitchFlow({ holdingId, onClose }: { holdingId?: string; onClose: () => void }) {
  const acc = useAccount()
  const enabled = useApp((s) => s.enabled)
  const rates = useApp((s) => s.rates)
  const switchPlan = useApp((s) => s.switchPlan)
  const [hid, setHid] = useState(holdingId)
  const [to, setTo] = useState<ProductId>()
  const [tenor, setTenor] = useState<number>()
  const [step, setStep] = useState<'from' | 'to' | 'pin' | 'processing' | 'done'>(holdingId ? 'to' : 'from')
  const h = acc.holdings.find((x) => x.id === hid)
  const from = h ? productMap[h.productId] : undefined
  const target = to ? productMap[to] : undefined
  const value = h ? holdingValue(h) : 0
  const newRate = target ? (tenor && target.tenors?.find((t) => t.days === tenor)?.rate) || rates[target.id] || target.rate : 0

  if (step === 'from')
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Select the investment you want to move.</p>
        {acc.holdings.filter((x) => x.status === 'active').map((x) => {
          const xp = productMap[x.productId]
          return (
            <button key={x.id} onClick={() => { setHid(x.id); setStep('to') }} className="flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left hover:border-brand-700/40">
              <span className="h-10 w-1.5 rounded-full" style={{ background: xp.color }} />
              <span className="flex-1 font-semibold">{xp.name}</span>
              <span className="num font-semibold">{money(holdingValue(x), xp.currency)}</span>
            </button>
          )
        })}
      </div>
    )
  if (!h || !from) return null

  if (step === 'pin') return <PinStep onComplete={() => setStep('processing')} />
  if (step === 'processing')
    return (
      <Processing
        steps={[`Valuing ${from.short} position`, `Allocating to ${target!.short}`, 'Updating your portfolio']}
        onDone={() => {
          switchPlan(h.id, to!, tenor)
          setStep('done')
          setTimeout(celebrate, 200)
        }}
      />
    )
  if (step === 'done')
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <SuccessMark />
        <p className="mt-6 font-display text-2xl font-semibold">Plan switched</p>
        <p className="mt-2 text-sm text-muted">
          {money(value, from.currency)} is now in {target!.name} earning {newRate.toFixed(2)}% p.a.
        </p>
        <Button className="mt-6 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    )

  const options = PRODUCTS.filter((x) => enabled[x.id] && x.currency === from.currency && x.id !== from.id)
  const yearlyDiff = target ? (value * (newRate - h.rate)) / 100 : 0
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-surface-2 p-4">
        <p className="text-xs text-muted">Moving from</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-semibold">{from.name}</p>
          <p className="num font-semibold">{money(value, from.currency)}</p>
        </div>
        <p className="num mt-0.5 text-xs text-muted">Current rate {h.rate.toFixed(2)}%</p>
      </div>
      <div className="flex justify-center">
        <span className="grid size-9 place-items-center rounded-full bg-brand-700 text-white">
          <ArrowDown className="size-4" />
        </span>
      </div>
      <div className="space-y-2">
        {options.map((x) => (
          <button
            key={x.id}
            onClick={() => {
              setTo(x.id)
              setTenor(x.tenors?.[0]?.days)
            }}
            className={cx('flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition', to === x.id ? 'border-brand-700 ring-1 ring-brand-700' : 'border-line hover:border-brand-700/30')}
          >
            <span className="h-9 w-1.5 rounded-full" style={{ background: x.color }} />
            <span className="flex-1">
              <span className="block font-semibold">{x.name}</span>
              <span className="block text-xs text-muted">{x.tenorLabel}</span>
            </span>
            <span className="num font-semibold text-gain">{(rates[x.id] ?? x.rate).toFixed(2)}%</span>
          </button>
        ))}
      </div>
      {target?.tenors && (
        <div className="flex flex-wrap gap-2">
          {target.tenors.map((t) => (
            <button key={t.days} onClick={() => setTenor(t.days)} className={cx('rounded-full border px-3.5 py-1.5 text-[13px] font-semibold', tenor === t.days ? 'border-brand-700 bg-brand-700 text-white' : 'border-line text-muted')}>
              {t.label} · {t.rate}%
            </button>
          ))}
        </div>
      )}
      {target && (
        <div className="rounded-2xl border border-line px-5 py-2 divide-y divide-line">
          <Row label="Rate change" value={<span className="flex items-center gap-2">{h.rate.toFixed(2)}% <ArrowRight className="size-3.5" /> <b className={newRate >= h.rate ? 'text-gain' : 'text-loss'}>{newRate.toFixed(2)}%</b></span>} />
          <Row label="Impact on annual income" value={<span className={yearlyDiff >= 0 ? 'text-gain' : 'text-loss'}>{money(yearlyDiff, from.currency, { sign: true })}</span>} />
          <Row label="Switching fee" value={<Badge tone="gain">Free</Badge>} />
        </div>
      )}
      <Button className="w-full" size="lg" disabled={!target} onClick={() => setStep('pin')}>
        {target ? `Switch to ${target.short}` : 'Choose a destination'}
      </Button>
    </div>
  )
}

import { motion } from 'framer-motion'
import { Building2, Check, Clock, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { money } from '../../lib/format'
import { daysHeld, earlyExitCharge, holdingValue, productMap } from '../../lib/products'
import type { RedemptionRequest } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { Badge, Button, cx, Segmented } from '../ui'
import { AmountInput, amountOf, celebrate, PinStep, Row } from './shared'
import { formatInput } from '../../lib/format'

export function RedemptionTracker({ id }: { id: string }) {
  const rq = useApp((s) => s.redemptions.find((r) => r.id === id))
  if (!rq) return null
  const stages = [
    { key: 'pending', label: 'Request received', sub: 'Submitted securely' },
    { key: 'approved', label: 'Approved', sub: 'Verified by operations' },
    { key: 'paid', label: 'Paid', sub: rq.destination },
  ]
  const idx = rq.status === 'pending' ? 0 : rq.status === 'approved' ? 1 : rq.status === 'paid' ? 2 : -1
  return (
    <div className="space-y-0">
      {stages.map((s, i) => {
        const done = i <= idx
        const current = i === idx + 1 && rq.status !== 'rejected'
        return (
          <div key={s.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                animate={done ? { scale: [0.8, 1.1, 1] } : {}}
                className={cx('grid size-9 place-items-center rounded-full border-2 transition-colors', done ? 'border-gain bg-gain text-white' : current ? 'border-brand-700 text-brand-700' : 'border-line text-faint')}
              >
                {done ? <Check className="size-4" /> : current ? <Clock className="size-4 animate-pulse" /> : <span className="text-xs">{i + 1}</span>}
              </motion.div>
              {i < stages.length - 1 && (
                <div className="relative my-1 h-10 w-0.5 overflow-hidden rounded-full bg-line">
                  <motion.div className="absolute inset-x-0 top-0 bg-gain" initial={{ height: 0 }} animate={{ height: i < idx ? '100%' : 0 }} transition={{ duration: 0.6 }} />
                </div>
              )}
            </div>
            <div className="pt-1.5">
              <p className={cx('text-sm font-semibold', !done && !current && 'text-faint')}>{s.label}</p>
              <p className="text-xs text-muted">{s.sub}</p>
            </div>
          </div>
        )
      })}
      {rq.status === 'rejected' && <p className="mt-2 rounded-xl bg-loss/10 p-3 text-sm text-loss">Declined: {rq.note || 'Please contact your RM.'}</p>}
    </div>
  )
}

export function RedeemFlow({ holdingId, onClose }: { holdingId?: string; onClose: () => void }) {
  const acc = useAccount()
  const request = useApp((s) => s.requestRedemption)
  const autoApprove = useApp((s) => s.autoApprove)
  const [hid, setHid] = useState(holdingId)
  const [step, setStep] = useState<'select' | 'amount' | 'pin' | 'track'>(holdingId ? 'amount' : 'select')
  const [mode, setMode] = useState<'full' | 'partial'>('full')
  const [raw, setRaw] = useState('')
  const [dest, setDest] = useState<'bank' | 'wallet'>('bank')
  const [rq, setRq] = useState<RedemptionRequest | null>(null)
  const active = acc.holdings.filter((h) => h.status === 'active')
  const h = acc.holdings.find((x) => x.id === hid)
  const p = h ? productMap[h.productId] : undefined
  const value = h ? holdingValue(h) : 0
  const amount = mode === 'full' ? value : Math.min(amountOf(raw), value)
  const charge = useMemo(() => (h ? earlyExitCharge(h, amount) : 0), [h, amount])
  const bank = acc.banks.find((b) => b.currency === p?.currency) ?? acc.banks[0]
  const bankLabel = bank ? `${bank.bank.replace(' (Domiciliary)', '')} ••${bank.number.slice(-4)}` : 'Bank account'

  if (step === 'select')
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Which investment would you like to redeem?</p>
        {active.length === 0 && <p className="rounded-xl bg-surface-2 p-4 text-sm text-muted">You don’t have any active investments yet.</p>}
        {active.map((x) => {
          const xp = productMap[x.productId]
          return (
            <button key={x.id} onClick={() => { setHid(x.id); setStep('amount') }} className="flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left hover:border-brand-700/40">
              <span className="h-10 w-1.5 rounded-full" style={{ background: xp.color }} />
              <span className="flex-1">
                <span className="block font-semibold">{xp.name}</span>
                <span className="block text-xs text-muted">Held {daysHeld(x)} days</span>
              </span>
              <span className="num font-semibold">{money(holdingValue(x), xp.currency)}</span>
            </button>
          )
        })}
      </div>
    )

  if (step === 'track' && rq)
    return (
      <div className="space-y-6 py-2">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.16em] text-brand-700 uppercase dark:text-brand-300">Redemption {rq.id}</p>
          <p className="mt-2 font-display text-4xl font-semibold">{money(rq.net, rq.currency)}</p>
          <p className="mt-1 text-sm text-muted">to {rq.destination}</p>
        </div>
        <div className="rounded-2xl bg-surface-2 p-5">
          <RedemptionTracker id={rq.id} />
        </div>
        <p className="text-center text-xs text-muted">{autoApprove ? 'Track progress live — we’ll notify you at every step.' : 'Your request is with our operations team for approval. We’ll notify you at every step.'}</p>
        <Button className="w-full" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    )

  if (!h || !p) return null

  if (step === 'pin')
    return (
      <PinStep
        onComplete={() => {
          const r = request(h.id, amount, dest, bankLabel)
          setRq(r)
          setStep('track')
          if (autoApprove) setTimeout(celebrate, 7400)
        }}
      />
    )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4">
        <span className="h-10 w-1.5 rounded-full" style={{ background: p.color }} />
        <div className="flex-1">
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-muted">Held {daysHeld(h)} days · lock-in {p.lockInDays} days</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Current value</p>
          <p className="num font-semibold">{money(value, p.currency)}</p>
        </div>
      </div>
      <Segmented value={mode} onChange={setMode} options={[{ value: 'full', label: 'Full redemption' }, { value: 'partial', label: 'Partial' }]} />
      {mode === 'partial' && (
        <>
          <AmountInput value={raw} onChange={setRaw} currency={p.currency} autoFocus />
          <div className="flex gap-2">
            {[0.25, 0.5, 0.75].map((f) => (
              <button key={f} onClick={() => setRaw(formatInput((value * f).toFixed(2)))} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-muted hover:text-ink">
                {f * 100}%
              </button>
            ))}
          </div>
        </>
      )}
      <div>
        <p className="mb-2 text-[13px] font-medium">Pay to</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button onClick={() => setDest('bank')} className={cx('flex items-center gap-3 rounded-2xl border p-3.5 text-left', dest === 'bank' ? 'border-brand-700 ring-1 ring-brand-700' : 'border-line')}>
            <Building2 className="size-5 text-brand-700 dark:text-brand-300" />
            <span>
              <span className="block text-sm font-semibold">Bank account</span>
              <span className="block text-xs text-muted">{bankLabel}</span>
            </span>
          </button>
          <button onClick={() => setDest('wallet')} className={cx('flex items-center gap-3 rounded-2xl border p-3.5 text-left', dest === 'wallet' ? 'border-brand-700 ring-1 ring-brand-700' : 'border-line')}>
            <Wallet className="size-5 text-brand-700 dark:text-brand-300" />
            <span>
              <span className="block text-sm font-semibold">Cash account</span>
              <span className="block text-xs text-muted">Reinvest anytime</span>
            </span>
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-line px-5 py-2 divide-y divide-line">
        <Row label="Redemption amount" value={money(amount, p.currency)} />
        <Row
          label={
            <span className="flex items-center gap-2">
              Early exit charge {charge > 0 && <Badge tone="warning">{p.earlyCharge * 100}% of accrued income</Badge>}
            </span>
          }
          value={charge > 0 ? `−${money(charge, p.currency)}` : money(0, p.currency)}
        />
        <Row label="You receive" value={<span className="text-gain">{money(amount - charge, p.currency)}</span>} strong />
        <Row label="Expected payout" value={p.id === 'lmf' ? 'Within 48 hours' : 'Within 5 business days'} />
      </div>
      {charge > 0 && <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">This investment is within its {p.lockInDays}-day {h.tenorDays ? 'tenor' : 'lock-in'}. Redeeming now forfeits {p.earlyCharge * 100}% of the interest earned so far.</p>}
      <Button className="w-full" size="lg" disabled={amount <= 0} onClick={() => setStep('pin')}>
        Redeem {money(amount - charge, p.currency)}
      </Button>
    </div>
  )
}

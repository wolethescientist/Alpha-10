import { motion } from 'framer-motion'
import { ArrowRight, Building2, CreditCard, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, date, money } from '../../lib/format'
import { PAYOUT_LABEL, PRODUCTS, productMap, WHT_RATE } from '../../lib/products'
import type { Holding, PayoutOption, ProductId } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { AnimatedNumber, Badge, Button, cx, Stepper, SuccessMark } from '../ui'
import { AmountInput, amountOf, celebrate, Processing, QuickAmounts, Row } from './shared'

export function InvestFlow({ initialProduct, goalId, onClose }: { initialProduct?: ProductId; goalId?: string; onClose: () => void }) {
  const acc = useAccount()
  const enabled = useApp((s) => s.enabled)
  const rates = useApp((s) => s.rates)
  const invest = useApp((s) => s.invest)
  const nav = useNavigate()
  const [step, setStep] = useState(initialProduct ? 1 : 0)
  const [pid, setPid] = useState<ProductId | undefined>(initialProduct)
  const p = pid ? productMap[pid] : undefined
  const [raw, setRaw] = useState('')
  const [tenor, setTenor] = useState<number | undefined>(p?.tenors?.[2]?.days ?? p?.tenors?.[0]?.days)
  const [payout, setPayout] = useState<PayoutOption>(p?.payouts?.includes('maturity') ? 'maturity' : (p?.payouts?.[0] ?? 'maturity'))
  const [source, setSource] = useState<'wallet' | 'external'>('wallet')
  const [agree, setAgree] = useState(false)
  const [holding, setHolding] = useState<Holding | null>(null)
  const amount = amountOf(raw)

  if (!p || step === 0)
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">Choose a product to invest in.</p>
        {PRODUCTS.filter((x) => enabled[x.id]).map((x) => (
          <button
            key={x.id}
            onClick={() => {
              setPid(x.id)
              setTenor(x.tenors?.[2]?.days ?? x.tenors?.[0]?.days)
              setPayout(x.payouts?.includes('maturity') ? 'maturity' : (x.payouts?.[0] ?? 'maturity'))
              setStep(1)
            }}
            className="group flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left transition hover:border-brand-700/40 hover:bg-surface-2/50"
          >
            <span className="h-12 w-1.5 rounded-full" style={{ background: x.color }} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold">{x.name}</span>
                <Badge tone={x.currency === 'USD' ? 'gold' : 'neutral'}>{x.currency}</Badge>
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted">{x.tagline}</span>
            </span>
            <span className="text-right">
              <span className="num block font-semibold text-gain">{(rates[x.id] ?? x.rate).toFixed(2)}%</span>
              <span className="block text-[11px] text-faint">from {money(x.minimum, x.currency, { decimals: 0, compact: true })}</span>
            </span>
            <ArrowRight className="size-4 text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </button>
        ))}
      </div>
    )

  const rate = (tenor && p.tenors?.find((t) => t.days === tenor)?.rate) || rates[p.id] || p.rate
  const days = tenor ?? 365
  const gross = p.compounding || p.unitPrice ? amount * (Math.pow(1 + rate / 100 / 365, days) - 1) : (amount * rate * days) / 36500
  const wht = p.unitPrice ? 0 : gross * WHT_RATE
  const walletBal = acc.wallet[p.currency]
  const insufficient = source === 'wallet' && amount > walletBal
  const belowMin = amount < p.minimum
  const kycLimited = acc.profile.kycStatus !== 'verified' && amount > (p.currency === 'NGN' ? 5_000_000 : 5_000)

  if (step === 3)
    return (
      <Processing
        steps={source === 'external' ? ['Collecting payment', 'Booking your investment', 'Generating your certificate'] : ['Debiting cash account', 'Booking your investment', 'Generating your certificate']}
        onDone={() => {
          const h = invest({ productId: p.id, amount, tenorDays: tenor, payout: p.payouts ? payout : undefined, source, method: 'Bank transfer', goalId })
          setHolding(h)
          setStep(4)
          setTimeout(celebrate, 250)
        }}
      />
    )

  if (step === 4 && holding)
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <SuccessMark />
        <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-gain uppercase">Investment confirmed</p>
        <p className="mt-2 font-display text-4xl font-semibold">
          <AnimatedNumber value={amount} format={(n) => money(n, p.currency)} />
        </p>
        <p className="mt-2 text-sm text-muted">is now working for you in {p.name}</p>
        <div className="mt-6 w-full rounded-2xl bg-surface-2 p-5 text-left">
          <Row label="Rate" value={`${rate.toFixed(2)}% p.a.`} />
          {tenor && <Row label="Matures" value={date(addDays(new Date(), tenor), 'long')} />}
          <Row label="Projected income" value={<span className="text-gain">{money(gross - wht, p.currency)}</span>} />
        </div>
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
          <Button
            onClick={() => {
              onClose()
              nav(`/app/portfolio/${holding.id}/certificate`)
            }}
          >
            View certificate
          </Button>
        </div>
      </div>
    )

  return (
    <div className="space-y-5">
      <Stepper steps={['Product', 'Details', 'Review']} current={step} />
      <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4">
        <span className="h-10 w-1.5 rounded-full" style={{ background: p.color }} />
        <div className="flex-1">
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-muted">{p.tenorLabel}</p>
        </div>
        {!initialProduct && step === 1 && (
          <button onClick={() => setStep(0)} className="text-xs font-semibold text-brand-700 dark:text-brand-300">
            Change
          </button>
        )}
      </div>

      {step === 1 && (
        <>
          <AmountInput value={raw} onChange={setRaw} currency={p.currency} autoFocus />
          <QuickAmounts amounts={p.currency === 'NGN' ? [p.minimum, p.minimum * 5, p.minimum * 10].filter((v, i, a) => a.indexOf(v) === i) : [p.minimum, p.minimum * 5, p.minimum * 20]} currency={p.currency} onPick={setRaw} />
          {p.tenors && (
            <div>
              <p className="mb-2 text-[13px] font-medium">Tenor</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {p.tenors.map((t) => (
                  <button key={t.days} onClick={() => setTenor(t.days)} className={cx('rounded-xl border px-2 py-2.5 text-center transition', tenor === t.days ? 'border-brand-700 bg-brand-700/[0.05] ring-1 ring-brand-700' : 'border-line hover:border-brand-700/30')}>
                    <span className="block text-[13px] font-semibold">{t.label}</span>
                    <span className="num block text-xs text-gain">{t.rate.toFixed(2)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {p.payouts && (
            <div>
              <p className="mb-2 text-[13px] font-medium">Interest payout</p>
              <div className="flex flex-wrap gap-2">
                {p.payouts.map((o) => (
                  <button key={o} onClick={() => setPayout(o)} className={cx('rounded-full border px-4 py-2 text-[13px] font-semibold transition', payout === o ? 'border-brand-700 bg-brand-700 text-white' : 'border-line text-muted hover:text-ink')}>
                    {PAYOUT_LABEL[o]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-[13px] font-medium">Fund from</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={() => setSource('wallet')} className={cx('flex items-center gap-3 rounded-2xl border p-3.5 text-left', source === 'wallet' ? 'border-brand-700 ring-1 ring-brand-700' : 'border-line')}>
                <Wallet className="size-5 text-brand-700 dark:text-brand-300" />
                <span>
                  <span className="block text-sm font-semibold">Cash account</span>
                  <span className="num block text-xs text-muted">{money(walletBal, p.currency)} available</span>
                </span>
              </button>
              <button onClick={() => setSource('external')} className={cx('flex items-center gap-3 rounded-2xl border p-3.5 text-left', source === 'external' ? 'border-brand-700 ring-1 ring-brand-700' : 'border-line')}>
                <span className="flex -space-x-1 text-brand-700 dark:text-brand-300">
                  <Building2 className="size-5" />
                  <CreditCard className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">Pay now</span>
                  <span className="block text-xs text-muted">Transfer or card</span>
                </span>
              </button>
            </div>
          </div>
          {amount > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gain/25 bg-gain/[0.06] p-4">
              <p className="text-xs font-medium text-muted">Projected income over {tenor ? p.tenors?.find((t) => t.days === tenor)?.label : '1 year'}</p>
              <p className="mt-1 text-2xl font-semibold text-gain">
                <AnimatedNumber value={gross - wht} format={(n) => money(n, p.currency, { sign: true })} duration={0.5} />
              </p>
              <p className="mt-0.5 text-xs text-muted">at {rate.toFixed(2)}% p.a.{wht > 0 ? ' · net of 10% WHT' : ''}</p>
            </motion.div>
          )}
          {kycLimited && <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Your KYC is under review — investments above {p.currency === 'NGN' ? '₦5m' : '$5k'} unlock once you’re verified.</p>}
          <Button className="w-full" size="lg" disabled={belowMin || insufficient || kycLimited} onClick={() => setStep(2)}>
            {belowMin ? `Minimum ${money(p.minimum, p.currency, { decimals: 0 })}` : insufficient ? 'Insufficient cash balance — choose “Pay now”' : 'Review investment'}
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="rounded-2xl border border-line px-5 py-2 divide-y divide-line">
            <Row label="Amount" value={money(amount, p.currency)} strong />
            <Row label="Rate" value={`${rate.toFixed(2)}% p.a.`} />
            {tenor && <Row label="Tenor" value={`${p.tenors?.find((t) => t.days === tenor)?.label} · matures ${date(addDays(new Date(), tenor))}`} />}
            {p.payouts && <Row label="Interest payout" value={PAYOUT_LABEL[payout]} />}
            {p.unitPrice && <Row label="Units allotted" value={`${(amount / p.unitPrice).toLocaleString()} @ ${money(p.unitPrice, p.currency)}`} />}
            <Row label="Funding" value={source === 'wallet' ? 'Cash account' : 'Bank transfer / card'} />
            <Row label="Projected gross income" value={money(gross, p.currency)} />
            {wht > 0 && <Row label="Withholding tax (10%)" value={`−${money(wht, p.currency)}`} />}
            <Row label="Projected net income" value={<span className="text-gain">{money(gross - wht, p.currency)}</span>} strong />
          </div>
          <div className="rounded-2xl bg-surface-2 p-4 text-xs leading-relaxed text-muted">
            <b className="text-ink">Liquidity:</b> {p.liquidity}. {p.trustee && <>Trustee: {p.trustee}. </>}Rates are indicative and may change before booking.
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-brand-700" />
            <span className="text-muted">I have read the product terms and understand the early-exit conditions.</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!agree} onClick={() => setStep(3)}>
              Confirm & invest
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

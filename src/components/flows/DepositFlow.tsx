import { motion } from 'framer-motion'
import { Building2, Check, Copy, CreditCard, Hash, Lock, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { money } from '../../lib/format'
import type { Currency } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { useUI } from '../../store/ui'
import { AnimatedNumber, Button, cx, Input, Segmented, SuccessMark } from '../ui'
import { AmountInput, amountOf, celebrate, Processing, QuickAmounts } from './shared'

type Method = 'transfer' | 'card' | 'ussd'
const METHODS: { id: Method; label: string; sub: string; icon: typeof Building2; ngnOnly?: boolean }[] = [
  { id: 'transfer', label: 'Bank transfer', sub: 'Instant · no fees', icon: Building2 },
  { id: 'card', label: 'Debit card', sub: 'Visa, Mastercard, Verve', icon: CreditCard },
  { id: 'ussd', label: 'USSD', sub: 'Any Nigerian bank', icon: Hash, ngnOnly: true },
]

function CopyLine({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="num mt-0.5 font-semibold">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value).catch(() => {})
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="size-4 text-gain" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}

export function DepositFlow({ initialCurrency, onClose }: { initialCurrency?: Currency; onClose: () => void }) {
  const acc = useAccount()
  const deposit = useApp((s) => s.deposit)
  const openFlow = useUI((s) => s.open)
  const [step, setStep] = useState<'amount' | 'pay' | 'processing' | 'done'>('amount')
  const [currency, setCurrency] = useState<Currency>(initialCurrency ?? 'NGN')
  const [raw, setRaw] = useState('')
  const [method, setMethod] = useState<Method>('transfer')
  const [before, setBefore] = useState(0)
  const [seconds, setSeconds] = useState(29 * 60 + 59)
  const amount = amountOf(raw)
  const min = currency === 'NGN' ? 1000 : 10

  useEffect(() => {
    if (step !== 'pay' || method !== 'transfer') return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [step, method])

  const methodLabel = method === 'transfer' ? 'Bank transfer' : method === 'card' ? 'Debit card ••4081' : 'USSD *737#'

  if (step === 'processing')
    return (
      <Processing
        steps={method === 'card' ? ['Authorising with your bank', 'Confirming payment', 'Crediting your Alpha10 account'] : ['Listening for your transfer', 'Payment received from your bank', 'Crediting your Alpha10 account']}
        onDone={() => {
          setBefore(acc.wallet[currency])
          deposit(currency, amount, methodLabel)
          setStep('done')
          setTimeout(celebrate, 250)
        }}
      />
    )

  if (step === 'done')
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <SuccessMark />
        <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-gain uppercase">Deposit successful</p>
        <p className="mt-2 font-display text-4xl font-semibold">
          <AnimatedNumber value={amount} format={(n) => money(n, currency)} />
        </p>
        <p className="mt-2 text-sm text-muted">has been credited to your {currency} cash account</p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 w-full rounded-2xl bg-surface-2 p-5">
          <p className="text-xs font-medium text-muted">New available balance</p>
          <p className="mt-1 text-2xl font-semibold">
            <DelayedCount from={before} to={before + amount} currency={currency} />
          </p>
        </motion.div>
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
          <Button onClick={() => openFlow({ kind: 'invest' })}>Invest it now</Button>
        </div>
      </div>
    )

  if (step === 'pay')
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-surface-2 p-4 text-center">
          <p className="text-xs text-muted">You’re depositing</p>
          <p className="num mt-1 font-display text-3xl font-semibold">{money(amount, currency)}</p>
        </div>
        {method === 'transfer' && (
          <>
            <div className="rounded-2xl border border-line px-5 py-1 divide-y divide-line">
              <CopyLine label="Bank" value={currency === 'NGN' ? 'Providus Bank' : 'Zenith Bank (Domiciliary)'} />
              <CopyLine label="Account number" value={currency === 'NGN' ? '9912345678' : '5071148820'} />
              <CopyLine label="Account name" value={`ALPHA10 / ${(acc.profile.companyName ?? acc.profile.firstName + ' ' + acc.profile.lastName).toUpperCase()}`} />
            </div>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gain opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-gain" />
              </span>
              This dedicated account expires in <span className="num font-semibold text-ink">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>
            </p>
            <Button className="w-full" size="lg" onClick={() => setStep('processing')}>
              I’ve sent the money
            </Button>
          </>
        )}
        {method === 'card' && (
          <>
            <div className="crimson-gradient relative overflow-hidden rounded-2xl p-5 text-white shadow-xl">
              <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
              <p className="text-xs text-white/70">Debit card</p>
              <p className="num mt-6 text-lg tracking-[0.2em]">5399 •••• •••• 4081</p>
              <div className="mt-4 flex justify-between text-xs">
                <span>{(acc.profile.firstName + ' ' + acc.profile.lastName).toUpperCase()}</span>
                <span>09/28</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input defaultValue="09/28" aria-label="Expiry" />
              <Input defaultValue="•••" aria-label="CVV" />
            </div>
            <Button className="w-full" size="lg" icon={<Lock className="size-4" />} onClick={() => setStep('processing')}>
              Pay {money(amount, currency)}
            </Button>
            <p className="text-center text-[11px] text-faint">Secured by 3-D Secure · PCI-DSS compliant</p>
          </>
        )}
        {method === 'ussd' && (
          <>
            <div className="rounded-2xl border border-line p-6 text-center">
              <p className="text-xs text-muted">Dial this code on the phone linked to your bank</p>
              <p className="num mt-3 font-display text-3xl font-semibold tracking-wide text-brand-700 dark:text-brand-300">*737*000*{Math.round(amount)}#</p>
              <p className="mt-3 text-xs text-muted">GTBank · change bank for a different code</p>
            </div>
            <Button className="w-full" size="lg" icon={<Smartphone className="size-4" />} onClick={() => setStep('processing')}>
              I’ve dialled the code
            </Button>
          </>
        )}
        <button onClick={() => setStep('amount')} className="w-full text-center text-sm font-medium text-muted hover:text-ink">
          ← Change amount or method
        </button>
      </div>
    )

  return (
    <div className="space-y-5">
      <Segmented
        value={currency}
        onChange={(c) => {
          setCurrency(c)
          setRaw('')
          if (c === 'USD' && method === 'ussd') setMethod('transfer')
        }}
        options={[
          { value: 'NGN', label: '🇳🇬 Naira' },
          { value: 'USD', label: '🇺🇸 Dollar' },
        ]}
      />
      <AmountInput value={raw} onChange={setRaw} currency={currency} autoFocus />
      <QuickAmounts amounts={currency === 'NGN' ? [50_000, 250_000, 1_000_000, 5_000_000] : [100, 500, 1_000, 5_000]} currency={currency} onPick={setRaw} />
      <div>
        <p className="mb-2 text-[13px] font-medium">Payment method</p>
        <div className="grid gap-2">
          {METHODS.filter((m) => currency === 'NGN' || !m.ngnOnly).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cx('flex items-center gap-4 rounded-2xl border p-4 text-left transition', method === m.id ? 'border-brand-700 bg-brand-700/[0.04] ring-1 ring-brand-700' : 'border-line hover:border-brand-700/30')}
            >
              <span className={cx('grid size-10 place-items-center rounded-xl', method === m.id ? 'bg-brand-700 text-white' : 'bg-surface-2 text-muted')}>
                <m.icon className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="block text-xs text-muted">{m.sub}</span>
              </span>
              <span className={cx('grid size-5 place-items-center rounded-full border-2', method === m.id ? 'border-brand-700' : 'border-line')}>
                {method === m.id && <span className="size-2.5 rounded-full bg-brand-700" />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Button className="w-full" size="lg" disabled={amount < min} onClick={() => setStep('pay')}>
        {amount < min ? `Minimum deposit ${money(min, currency, { decimals: 0 })}` : `Continue · ${money(amount, currency)}`}
      </Button>
    </div>
  )
}

function DelayedCount({ from, to, currency }: { from: number; to: number; currency: Currency }) {
  const [v, setV] = useState(from)
  useEffect(() => {
    const t = setTimeout(() => setV(to), 900)
    return () => clearTimeout(t)
  }, [to])
  return <AnimatedNumber value={v} format={(n) => money(n, currency)} duration={1.6} />
}

import { useState } from 'react'
import { money } from '../../lib/format'
import type { Currency } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { AnimatedNumber, Button, Segmented, Select, SuccessMark } from '../ui'
import { AmountInput, amountOf, PinStep, Processing } from './shared'

export function WithdrawFlow({ onClose }: { onClose: () => void }) {
  const acc = useAccount()
  const withdraw = useApp((s) => s.withdrawWallet)
  const [currency, setCurrency] = useState<Currency>('NGN')
  const [raw, setRaw] = useState('')
  const [bankId, setBankId] = useState(acc.banks.find((b) => b.currency === 'NGN')?.id ?? acc.banks[0]?.id)
  const [step, setStep] = useState<'form' | 'pin' | 'processing' | 'done'>('form')
  const amount = amountOf(raw)
  const bal = acc.wallet[currency]
  const bank = acc.banks.find((b) => b.id === bankId)
  const label = bank ? `${bank.bank.replace(' (Domiciliary)', '')} ••${bank.number.slice(-4)}` : ''

  if (step === 'pin') return <PinStep onComplete={() => setStep('processing')} />
  if (step === 'processing') return <Processing steps={['Verifying request', 'Initiating NIP transfer', 'Payout confirmed']} onDone={() => { withdraw(currency, amount, label); setStep('done') }} />
  if (step === 'done')
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <SuccessMark />
        <p className="mt-6 font-display text-3xl font-semibold">
          <AnimatedNumber value={amount} format={(n) => money(n, currency)} />
        </p>
        <p className="mt-2 text-sm text-muted">is on its way to {label}</p>
        <Button className="mt-6 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    )

  return (
    <div className="space-y-5">
      <Segmented value={currency} onChange={(c) => { setCurrency(c); setRaw(''); setBankId(acc.banks.find((b) => b.currency === c)?.id ?? acc.banks[0]?.id) }} options={[{ value: 'NGN', label: 'Naira' }, { value: 'USD', label: 'Dollar' }]} />
      <AmountInput value={raw} onChange={setRaw} currency={currency} autoFocus />
      <p className="text-xs text-muted">
        Available: <span className="num font-semibold text-ink">{money(bal, currency)}</span>
      </p>
      {acc.banks.length > 0 ? (
        <Select value={bankId} onChange={(e) => setBankId(e.target.value)}>
          {acc.banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bank} · {b.number} ({b.currency})
            </option>
          ))}
        </Select>
      ) : (
        <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Add a bank account in Settings → Bank accounts first.</p>
      )}
      <Button className="w-full" size="lg" disabled={amount <= 0 || amount > bal || !bank} onClick={() => setStep('pin')}>
        {amount > bal ? 'Amount exceeds available balance' : 'Withdraw'}
      </Button>
    </div>
  )
}

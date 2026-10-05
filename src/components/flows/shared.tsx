import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { formatInput, parseAmount, SYMBOL } from '../../lib/format'
import type { Currency } from '../../lib/types'
import { BrandLoader, cx } from '../ui'

export function celebrate() {
  const colors = ['#961a1c', '#c93f42', '#d9b96a', '#ffffff']
  confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { y: 0.55 }, colors, zIndex: 80 })
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 80 }), 180)
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 80 }), 260)
}

export function Processing({ steps, onDone, interval = 1100 }: { steps: string[]; onDone: () => void; interval?: number }) {
  const [i, setI] = useState(0)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (i >= steps.length) {
      done.current()
      return
    }
    const t = setTimeout(() => setI((x) => x + 1), interval)
    return () => clearTimeout(t)
  }, [i, steps.length, interval])
  return (
    <div className="flex flex-col items-center py-10">
      <BrandLoader label={steps[Math.min(i, steps.length - 1)]} />
      <div className="mt-8 w-full max-w-xs space-y-2.5">
        {steps.map((s, k) => (
          <div key={s} className="flex items-center gap-3 text-sm">
            <span className={cx('grid size-5 place-items-center rounded-full text-[10px] transition-colors', k < i ? 'bg-gain text-white' : k === i ? 'bg-brand-700/15 ring-2 ring-brand-700' : 'bg-surface-2')}>
              {k < i ? '✓' : ''}
            </span>
            <span className={cx('transition-colors', k <= i ? 'text-ink' : 'text-faint')}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AmountInput({ value, onChange, currency, autoFocus }: { value: string; onChange: (v: string) => void; currency: Currency; autoFocus?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/50 px-5 py-4 transition focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-600/10">
      <p className="text-xs font-medium text-muted">Amount</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-3xl font-semibold text-faint">{SYMBOL[currency]}</span>
        <input
          autoFocus={autoFocus}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(formatInput(e.target.value))}
          placeholder="0.00"
          className="num w-full min-w-0 bg-transparent font-display text-4xl font-semibold tracking-tight outline-none placeholder:text-faint/60"
        />
      </div>
    </div>
  )
}

export function QuickAmounts({ amounts, currency, onPick }: { amounts: number[]; currency: Currency; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {amounts.map((a) => (
        <button key={a} type="button" onClick={() => onPick(formatInput(String(a)))} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-semibold text-muted transition hover:border-brand-700/40 hover:text-ink">
          {SYMBOL[currency]}
          {a >= 1e6 ? `${a / 1e6}m` : a >= 1e3 ? `${a / 1e3}k` : a}
        </button>
      ))}
    </div>
  )
}

export function PinStep({ onComplete, label = 'Enter your 4-digit transaction PIN' }: { onComplete: () => void; label?: string }) {
  const [pin, setPin] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])
  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(onComplete, 250)
      return () => clearTimeout(t)
    }
  }, [pin, onComplete])
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <p className="font-display text-xl font-semibold">Authorise transaction</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      <div className="relative mt-6 flex gap-3" onClick={() => ref.current?.focus()}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={pin.length === i ? { scale: [1, 1.06, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className={cx('grid size-14 place-items-center rounded-2xl border-2 text-2xl transition-colors', pin.length > i ? 'border-brand-700 bg-brand-700/5' : pin.length === i ? 'border-brand-700/50' : 'border-line')}
          >
            {pin.length > i && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-3 rounded-full bg-brand-700" />}
          </motion.div>
        ))}
        <input
          ref={ref}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          inputMode="numeric"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Transaction PIN"
        />
      </div>
      <button type="button" onClick={() => setPin('1234')} className="mt-5 text-xs font-medium text-faint hover:text-ink">
        Demo: tap to autofill PIN
      </button>
    </div>
  )
}

export function Row({ label, value, strong, className }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={cx('flex items-center justify-between gap-4 py-2.5 text-sm', className)}>
      <span className="text-muted">{label}</span>
      <span className={cx('num text-right', strong ? 'text-base font-semibold' : 'font-medium')}>{value}</span>
    </div>
  )
}

export const amountOf = parseAmount

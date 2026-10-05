import { motion } from 'framer-motion'
import { Plus, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AmountInput, amountOf, celebrate } from '../../components/flows/shared'
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, ProgressRing, Segmented, Select } from '../../components/ui'
import { addDays, date, daysBetween, money } from '../../lib/format'
import { PRODUCTS, productMap } from '../../lib/products'
import type { Currency, Goal, ProductId } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'
import { useUI } from '../../store/ui'

const EMOJIS = ['🏡', '🎓', '🕋', '🚗', '💍', '✈️', '🛟', '👶', '🏖️', '💼']

function GoalCard({ g, i }: { g: Goal; i: number }) {
  const removeGoal = useApp((s) => s.removeGoal)
  const contribute = useApp((s) => s.contributeGoal)
  const acc = useAccount()
  const toast = useUI((s) => s.toast)
  const [topUp, setTopUp] = useState(false)
  const [raw, setRaw] = useState('')
  const progress = g.saved / g.target
  const monthsLeft = Math.max(1, daysBetween(new Date(), g.targetDate) / 30.4)
  const needed = Math.max(0, (g.target - g.saved) / monthsLeft)
  const onTrack = g.monthly >= needed * 0.95
  const p = productMap[g.productId]

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
      <Card className="p-6">
        <div className="flex items-start gap-5">
          <ProgressRing value={progress} size={92} stroke={8}>
            <div className="text-center">
              <p className="text-2xl leading-none">{g.emoji}</p>
              <p className="num mt-1 text-xs font-bold">{Math.round(progress * 100)}%</p>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-xl font-semibold">{g.name}</p>
              <button onClick={() => removeGoal(g.id)} className="text-faint hover:text-loss" aria-label="Delete goal">
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="num mt-1 text-sm">
              <b>{money(g.saved, g.currency, { compact: true })}</b> <span className="text-muted">of {money(g.target, g.currency, { compact: true })}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={onTrack ? 'gain' : 'warning'}>{onTrack ? 'On track' : 'Needs a boost'}</Badge>
              <Badge>by {date(g.targetDate)}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
          <div>
            <p className="text-xs text-muted">Invested in</p>
            <p className="font-semibold">{p.short}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Monthly plan</p>
            <p className="num font-semibold">{money(g.monthly, g.currency, { compact: true })}</p>
          </div>
          {!onTrack && (
            <p className="col-span-2 text-xs text-muted">
              Save <b className="num text-ink">{money(needed, g.currency, { compact: true })}</b>/month to reach your goal on time.
            </p>
          )}
        </div>
        <Button className="mt-4 w-full" variant="secondary" icon={<Plus className="size-4" />} onClick={() => setTopUp(true)}>
          Add money
        </Button>
      </Card>
      <Modal open={topUp} onClose={() => setTopUp(false)} title={`Top up · ${g.name}`} size="sm">
        <div className="space-y-4">
          <AmountInput value={raw} onChange={setRaw} currency={g.currency} autoFocus />
          <p className="text-xs text-muted">From cash account · {money(acc.wallet[g.currency], g.currency)} available</p>
          <Button
            className="w-full"
            disabled={amountOf(raw) <= 0 || amountOf(raw) > acc.wallet[g.currency]}
            onClick={() => {
              contribute(g.id, amountOf(raw))
              setTopUp(false)
              setRaw('')
              celebrate()
              toast({ kind: 'success', title: 'Goal topped up', body: `${money(amountOf(raw), g.currency)} added to ${g.name}` })
            }}
          >
            {amountOf(raw) > acc.wallet[g.currency] ? 'Insufficient cash — deposit first' : 'Add to goal'}
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}

export default function Goals() {
  const acc = useAccount()
  const addGoal = useApp((s) => s.addGoal)
  const toast = useUI((s) => s.toast)
  const [open, setOpen] = useState(false)
  const [emoji, setEmoji] = useState('🏡')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<Currency>('NGN')
  const [target, setTarget] = useState('')
  const [months, setMonths] = useState(24)
  const [pid, setPid] = useState<ProductId>('lmf')
  const t = amountOf(target)
  const p = productMap[pid]
  const r = Math.pow(1 + p.rate / 100 / 365, 30.4) - 1
  const monthly = t > 0 ? (t * r) / (Math.pow(1 + r, months) - 1) : 0

  const totalSaved = acc.goals.reduce((a, g) => a + (g.currency === 'NGN' ? g.saved : 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Plan" title="Goals" subtitle="Give every naira a purpose. We’ll invest it and keep you on track." action={<Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>New goal</Button>} />
      {acc.goals.length > 0 && (
        <div className="crimson-gradient flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] p-6 text-white">
          <div>
            <p className="text-sm text-white/70">Saved towards goals (NGN)</p>
            <p className="num mt-1 font-display text-3xl font-semibold">{money(totalSaved, 'NGN')}</p>
          </div>
          <p className="text-sm text-white/75">{acc.goals.length} active goals · invested automatically</p>
        </div>
      )}
      {acc.goals.length === 0 ? (
        <Card>
          <Empty icon={<Target className="size-6" />} title="No goals yet" body="Saving for a home, school fees, Hajj or a rainy day? Create a goal and we’ll calculate exactly what to set aside." action={<Button onClick={() => setOpen(true)}>Create your first goal</Button>} />
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {acc.goals.map((g, i) => (
            <GoalCard key={g.id} g={g} i={i} />
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create a goal">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => setEmoji(e)} className={`grid size-11 place-items-center rounded-xl text-xl transition ${emoji === e ? 'bg-brand-700/10 ring-2 ring-brand-700' : 'bg-surface-2'}`}>
                {e}
              </button>
            ))}
          </div>
          <Field label="Goal name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dream home deposit" />
          </Field>
          <Segmented value={currency} onChange={(c) => { setCurrency(c); setPid(c === 'NGN' ? 'lmf' : 'dollar') }} options={[{ value: 'NGN', label: 'Naira goal' }, { value: 'USD', label: 'Dollar goal' }]} />
          <AmountInput value={target} onChange={setTarget} currency={currency} />
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Timeline</span>
              <span className="font-semibold">{months} months · {date(addDays(new Date(), months * 30.4))}</span>
            </div>
            <input type="range" className="range mt-3" min={3} max={120} value={months} onChange={(e) => setMonths(Number(e.target.value))} style={{ ['--p' as string]: `${((months - 3) / 117) * 100}%` }} />
          </div>
          <Field label="Invest in">
            <Select value={pid} onChange={(e) => setPid(e.target.value as ProductId)}>
              {PRODUCTS.filter((x) => x.currency === currency && !x.proposed && !x.tenors).map((x) => (
                <option key={x.id} value={x.id}>{x.name} · {x.rate}%</option>
              ))}
            </Select>
          </Field>
          {t > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-gain/[0.07] p-4">
              <p className="text-xs text-muted">Set aside each month</p>
              <p className="num text-2xl font-semibold text-gain">{money(monthly, currency)}</p>
              <p className="text-xs text-muted">Interest covers {money(t - monthly * months, currency, { compact: true })} of your target</p>
            </motion.div>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={!name || t <= 0}
            onClick={() => {
              addGoal({ name, emoji, target: t, currency, targetDate: addDays(new Date(), months * 30.4), productId: pid, monthly: Math.round(monthly) })
              setOpen(false)
              setName('')
              setTarget('')
              celebrate()
              toast({ kind: 'success', title: 'Goal created', body: `${emoji} ${name}` })
            }}
          >
            Create goal
          </Button>
        </div>
      </Modal>
    </div>
  )
}

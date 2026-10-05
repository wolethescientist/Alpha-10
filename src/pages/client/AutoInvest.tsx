import { motion } from 'framer-motion'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AmountInput, amountOf, Processing } from '../../components/flows/shared'
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, Select, SuccessMark, Toggle } from '../../components/ui'
import { addDays, date, money } from '../../lib/format'
import { PRODUCTS, productMap } from '../../lib/products'
import type { ProductId, StandingOrder } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'

const STEP: Record<StandingOrder['frequency'], number> = { weekly: 7, monthly: 30.4, quarterly: 91 }

function nextDates(so: Pick<StandingOrder, 'startDate' | 'frequency'>, n = 6) {
  const out: string[] = []
  let d = new Date(so.startDate)
  while (d < new Date()) d = new Date(addDays(d, STEP[so.frequency]))
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString())
    d = new Date(addDays(d, STEP[so.frequency]))
  }
  return out
}

export default function AutoInvest() {
  const acc = useAccount()
  const { addStandingOrder, toggleStandingOrder, removeStandingOrder } = useApp()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'form' | 'processing' | 'done'>('form')
  const [pid, setPid] = useState<ProductId>('lmf')
  const [raw, setRaw] = useState('')
  const [freq, setFreq] = useState<StandingOrder['frequency']>('monthly')
  const [start, setStart] = useState(addDays(new Date(), 3).slice(0, 10))
  const [bankId, setBankId] = useState(acc.banks[0]?.id)
  const p = productMap[pid]
  const amount = amountOf(raw)
  const bank = acc.banks.find((b) => b.id === bankId)
  const yearly = amount * (365 / STEP[freq])

  const close = () => {
    setOpen(false)
    setPhase('form')
    setRaw('')
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Grow" title="Auto-Invest" subtitle="Set it once. We debit your bank and invest for you on schedule — no paperwork, no standing-order forms." action={<Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>New plan</Button>} />

      {acc.standingOrders.length === 0 ? (
        <Card>
          <Empty icon={<CalendarClock className="size-6" />} title="No auto-invest plans" body="Build wealth on autopilot with a weekly, monthly or quarterly plan." action={<Button onClick={() => setOpen(true)}>Create a plan</Button>} />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {acc.standingOrders.map((so, i) => {
            const sp = productMap[so.productId]
            return (
              <motion.div key={so.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{sp.name}</p>
                        <Badge tone={so.active ? 'gain' : 'neutral'}>{so.active ? 'Active' : 'Paused'}</Badge>
                      </div>
                      <p className="num mt-1 font-display text-3xl font-semibold">
                        {money(so.amount, so.currency, { decimals: 0 })}
                        <span className="ml-1 text-base font-normal text-muted">/ {so.frequency.replace('ly', '')}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted">from {so.bank}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Toggle checked={so.active} onChange={() => toggleStandingOrder(so.id)} label="Pause or resume" />
                      <button onClick={() => removeStandingOrder(so.id)} className="grid size-8 place-items-center rounded-full text-faint hover:bg-surface-2 hover:text-loss" aria-label="Delete plan">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-5 mb-2 text-xs font-semibold text-muted">Upcoming debits</p>
                  <div className="no-scrollbar flex gap-2 overflow-x-auto">
                    {nextDates(so).map((d, k) => (
                      <div key={d} className={`shrink-0 rounded-xl px-3 py-2 text-center ${k === 0 && so.active ? 'bg-brand-700 text-white' : 'bg-surface-2'}`}>
                        <p className="text-[10px] uppercase opacity-70">{new Date(d).toLocaleDateString('en-GB', { month: 'short' })}</p>
                        <p className="num text-lg leading-tight font-semibold">{new Date(d).getDate()}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={close} title="New auto-invest plan">
        {phase === 'processing' ? (
          <Processing
            steps={['Creating NIBSS e-mandate', `Authorising ${bank?.bank ?? 'your bank'}`, 'Scheduling your plan']}
            onDone={() => {
              addStandingOrder({ productId: pid, amount, currency: p.currency, frequency: freq, startDate: new Date(start).toISOString(), bank: bank ? `${bank.bank} ••${bank.number.slice(-4)}` : 'Bank account' })
              setPhase('done')
            }}
          />
        ) : phase === 'done' ? (
          <div className="flex flex-col items-center py-6 text-center">
            <SuccessMark />
            <p className="mt-6 font-display text-2xl font-semibold">You’re on autopilot</p>
            <p className="mt-2 text-sm text-muted">First debit on {date(new Date(start).toISOString(), 'long')}.</p>
            <Button className="mt-6 w-full" onClick={close}>Done</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <Field label="Invest in">
              <Select value={pid} onChange={(e) => { setPid(e.target.value as ProductId); setRaw('') }}>
                {PRODUCTS.filter((x) => !x.proposed && !x.tenors).map((x) => (
                  <option key={x.id} value={x.id}>{x.name} ({x.currency})</option>
                ))}
              </Select>
            </Field>
            <AmountInput value={raw} onChange={setRaw} currency={p.currency} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Frequency">
                <Select value={freq} onChange={(e) => setFreq(e.target.value as StandingOrder['frequency'])}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </Select>
              </Field>
              <Field label="Start date">
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
            </div>
            <Field label="Debit from">
              <Select value={bankId} onChange={(e) => setBankId(e.target.value)}>
                {acc.banks.map((b) => (
                  <option key={b.id} value={b.id}>{b.bank} · {b.number}</option>
                ))}
              </Select>
            </Field>
            {amount > 0 && (
              <div className="rounded-2xl bg-surface-2 p-4 text-sm">
                You’ll invest <b className="num">{money(yearly, p.currency, { decimals: 0 })}</b> a year — worth about{' '}
                <b className="num text-gain">{money(yearly * (1 + p.rate / 200), p.currency, { decimals: 0 })}</b> after 12 months at {p.rate}%.
              </div>
            )}
            <Button className="w-full" size="lg" disabled={amount < p.minimum / 10 || !bank} onClick={() => setPhase('processing')}>
              Start plan
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

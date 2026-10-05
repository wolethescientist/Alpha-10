import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BadgePercent, Download, Gift, Receipt, Search, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, cx, Empty, Input, Modal, PageHeader, Segmented, Select, StatusBadge } from '../../components/ui'
import { Row } from '../../components/flows/shared'
import { date, money } from '../../lib/format'
import { productMap } from '../../lib/products'
import type { Txn, TxnType } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'

const META: Record<TxnType, { label: string; icon: typeof Receipt; tone: string; sign: 1 | -1 | 0 }> = {
  deposit: { label: 'Deposit', icon: ArrowDownLeft, tone: 'bg-gain/10 text-gain', sign: 1 },
  investment: { label: 'Investment', icon: TrendingUp, tone: 'bg-brand-700/10 text-brand-700 dark:text-brand-300', sign: 0 },
  redemption: { label: 'Redemption', icon: ArrowUpRight, tone: 'bg-sky-500/10 text-sky-600', sign: 0 },
  interest: { label: 'Interest', icon: BadgePercent, tone: 'bg-gain/10 text-gain', sign: 1 },
  switch: { label: 'Switch', icon: ArrowLeftRight, tone: 'bg-violet-500/10 text-violet-600', sign: 0 },
  withdrawal: { label: 'Withdrawal', icon: Wallet, tone: 'bg-loss/10 text-loss', sign: -1 },
  charge: { label: 'Charge', icon: Receipt, tone: 'bg-amber-500/10 text-amber-600', sign: -1 },
  reward: { label: 'Reward', icon: Gift, tone: 'bg-gold-400/15 text-gold-600', sign: 1 },
}

export function TxnRow({ t, onClick }: { t: Txn; onClick?: () => void }) {
  const m = META[t.type]
  const hide = useApp((s) => s.hideBalances)
  return (
    <button onClick={onClick} className={cx('flex w-full items-center gap-3.5 py-3 text-left', onClick && 'rounded-xl px-2 transition hover:bg-surface-2')}>
      <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', m.tone)}>
        <m.icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{t.description}</p>
        <p className="text-xs text-muted">
          {date(t.date, 'datetime')} · <span className="num">{t.reference}</span>
        </p>
      </div>
      <div className="text-right">
        <p className={cx('num text-sm font-semibold', m.sign === 1 ? 'text-gain' : m.sign === -1 ? 'text-ink' : 'text-ink')}>
          {hide ? '••••' : `${m.sign === 1 ? '+' : m.sign === -1 ? '−' : ''}${money(t.amount, t.currency)}`}
        </p>
        {t.status !== 'completed' ? <StatusBadge status={t.status} /> : <p className="text-[11px] text-faint">{m.label}</p>}
      </div>
    </button>
  )
}

export default function Transactions() {
  const acc = useAccount()
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all' | TxnType>('all')
  const [ccy, setCcy] = useState<'all' | 'NGN' | 'USD'>('all')
  const [period, setPeriod] = useState<'30' | '90' | '365' | 'all'>('all')
  const [sel, setSel] = useState<Txn | null>(null)

  const list = useMemo(
    () =>
      acc.txns.filter(
        (t) =>
          (type === 'all' || t.type === type) &&
          (ccy === 'all' || t.currency === ccy) &&
          (period === 'all' || Date.now() - +new Date(t.date) < Number(period) * 86_400_000) &&
          (!q || `${t.description} ${t.reference} ${t.method ?? ''}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [acc.txns, q, type, ccy, period],
  )

  const inflow = list.filter((t) => META[t.type].sign === 1 && t.currency === 'NGN').reduce((a, t) => a + t.amount, 0)
  const outflow = list.filter((t) => META[t.type].sign === -1 && t.currency === 'NGN').reduce((a, t) => a + t.amount, 0)

  const exportCsv = () => {
    const rows = [['Date', 'Reference', 'Type', 'Description', 'Currency', 'Amount', 'Status'], ...list.map((t) => [t.date, t.reference, t.type, t.description, t.currency, t.amount.toFixed(2), t.status])]
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `alpha10-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Every deposit, investment, redemption and income payment." action={<Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>Export CSV</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-[13px] text-muted">Transactions shown</p>
          <p className="num mt-1 text-2xl font-semibold">{list.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] text-muted">Money in (NGN)</p>
          <p className="num mt-1 text-2xl font-semibold text-gain">{money(inflow, 'NGN', { compact: true })}</p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] text-muted">Money out (NGN)</p>
          <p className="num mt-1 text-2xl font-semibold">{money(outflow, 'NGN', { compact: true })}</p>
        </Card>
      </div>
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input prefix={<Search className="size-4" />} placeholder="Search description or reference" value={q} onChange={(e) => setQ(e.target.value)} className="lg:max-w-xs" />
          <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="lg:w-44">
            <option value="all">All types</option>
            {(Object.keys(META) as TxnType[]).map((k) => (
              <option key={k} value={k}>{META[k].label}</option>
            ))}
          </Select>
          <Segmented value={ccy} onChange={setCcy} options={[{ value: 'all', label: 'All' }, { value: 'NGN', label: 'NGN' }, { value: 'USD', label: 'USD' }]} />
          <Segmented value={period} onChange={setPeriod} options={[{ value: '30', label: '30D' }, { value: '90', label: '90D' }, { value: '365', label: '1Y' }, { value: 'all', label: 'All' }]} />
        </div>
        <div className="mt-4 divide-y divide-line">
          {list.map((t) => (
            <TxnRow key={t.id} t={t} onClick={() => setSel(t)} />
          ))}
          {list.length === 0 && <Empty icon={<Receipt className="size-6" />} title="No transactions match" body="Try a different filter or search term." />}
        </div>
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Transaction receipt" size="sm">
        {sel && (
          <div>
            <div className="rounded-2xl bg-surface-2 p-5 text-center">
              <p className="text-xs text-muted">{META[sel.type].label}</p>
              <p className="num mt-1 font-display text-3xl font-semibold">{money(sel.amount, sel.currency)}</p>
              <div className="mt-2"><StatusBadge status={sel.status} /></div>
            </div>
            <div className="mt-4 divide-y divide-line">
              <Row label="Reference" value={sel.reference} />
              <Row label="Date" value={date(sel.date, 'datetime')} />
              <Row label="Description" value={sel.description} />
              {sel.productId && <Row label="Product" value={productMap[sel.productId].name} />}
              {sel.method && <Row label="Channel" value={sel.method} />}
              <Row label="Currency" value={<Badge>{sel.currency}</Badge>} />
            </div>
            <Button className="mt-5 w-full" variant="outline" icon={<Download className="size-4" />} onClick={() => window.print()}>
              Print receipt
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

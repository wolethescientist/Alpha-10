import { Download, FileText, Mail } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Card, CardHeader, Field, Input, PageHeader } from '../../components/ui'
import { date, money } from '../../lib/format'
import { statementPdf } from '../../lib/pdf'
import { useAccount } from '../../store/app'
import { useFx } from '../../store/market'
import { useUI } from '../../store/ui'
import { TxnRow } from './Transactions'

export default function Statements() {
  const acc = useAccount()
  const fx = useFx()
  const toast = useUI((s) => s.toast)
  const today = new Date()
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().slice(0, 10))
  const [to, setTo] = useState(today.toISOString().slice(0, 10))
  const [busy, setBusy] = useState<string | null>(null)
  const txns = useMemo(() => acc.txns.filter((t) => t.date.slice(0, 10) >= from && t.date.slice(0, 10) <= to), [acc.txns, from, to])

  const months = Array.from({ length: 6 }, (_, i) => new Date(today.getFullYear(), today.getMonth() - 1 - i, 1))

  const download = async (f: Date, t: Date, key: string) => {
    setBusy(key)
    await statementPdf(acc, acc.txns.filter((x) => new Date(x.date) >= f && new Date(x.date) <= t), f, t, fx)
    setBusy(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Statements & reports" subtitle="Generate a statement for any period, instantly." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <CardHeader title="Custom statement" subtitle={`${txns.length} transactions in range`} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="From"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="To"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button icon={<Download className="size-4" />} loading={busy === 'custom'} onClick={() => download(new Date(from), new Date(to + 'T23:59:59'), 'custom')}>
              Download PDF
            </Button>
            <Button variant="outline" icon={<Mail className="size-4" />} onClick={() => toast({ kind: 'success', title: 'Statement emailed', body: `Sent to ${acc.profile.email}` })}>
              Email to me
            </Button>
          </div>
          <div className="mt-6 rounded-2xl border border-line">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="text-sm font-semibold">Preview</p>
              <p className="text-xs text-muted">{date(from)} – {date(to)}</p>
            </div>
            <div className="max-h-[420px] divide-y divide-line overflow-y-auto px-3 scrollbar-thin">
              {txns.map((t) => (
                <TxnRow key={t.id} t={t} />
              ))}
              {txns.length === 0 && <p className="py-10 text-center text-sm text-muted">No transactions in this period.</p>}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Monthly statements" subtitle="Issued on the 1st of every month" />
          <div className="mt-4 space-y-2">
            {months.map((m) => {
              const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59)
              const key = m.toISOString()
              return (
                <div key={key} className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-700/8 text-brand-700 dark:text-brand-300">
                    <FileText className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{m.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-muted">PDF · {acc.txns.filter((t) => new Date(t.date) >= m && new Date(t.date) <= end).length} transactions</p>
                  </div>
                  <Button size="sm" variant="ghost" loading={busy === key} onClick={() => download(m, end, key)} aria-label="Download">
                    <Download className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="mt-6 rounded-2xl bg-surface-2 p-4 text-xs text-muted">
            Need an audit confirmation or tax certificate? Request one from Support — WHT certificates are generated automatically each January. Wallet balance: <span className="num font-semibold text-ink">{money(acc.wallet.NGN)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

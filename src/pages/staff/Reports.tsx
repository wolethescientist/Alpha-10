import { Download, FileSpreadsheet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, CardHeader, PageHeader } from '../../components/ui'
import { money, seeded } from '../../lib/format'
import { PRODUCTS } from '../../lib/products'
import { aumByProduct, useStaffClients } from '../../lib/staff'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'

export default function Reports() {
  const rows = useStaffClients()
  const rates = useApp((s) => s.rates)
  const toast = useUI((s) => s.toast)
  const byProduct = aumByProduct(rows)
  const rnd = seeded(5)
  const sla = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => ({ d, hours: 2 + rnd() * 6 }))
  const channels = [
    { c: 'Web portal', v: 58 },
    { c: 'Mobile', v: 27 },
    { c: 'Relationship manager', v: 11 },
    { c: 'Branch / email', v: 4 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Regulatory, operational and product performance reporting." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['SEC quarterly return', 'Fund valuation report', 'AML/CFT transaction report', 'WHT schedule'].map((r) => (
          <Card key={r} className="flex items-center gap-3 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-700/8 text-brand-700 dark:text-brand-300"><FileSpreadsheet className="size-5" /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{r}</p>
              <p className="text-xs text-muted">Auto-generated · Q3 2026</p>
            </div>
            <button onClick={() => toast({ kind: 'success', title: `${r} exported` })} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label={`Download ${r}`}><Download className="size-4" /></button>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <CardHeader title="Redemption turnaround" subtitle="Average hours from request to payout · this week" />
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={sla} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v}h`} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={({ active, payload, label }) => (active && payload?.length ? <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-xl">{label}: <b className="num">{(payload[0]!.value as number).toFixed(1)} hours</b></div> : null)} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="hours" fill="#961a1c" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">Down from 5 business days with email-based redemptions.</p>
        </Card>
        <Card className="p-6">
          <CardHeader title="Transactions by channel" subtitle="Share of client-initiated transactions" />
          <div className="mt-6 space-y-4">
            {channels.map((c) => (
              <div key={c.c}>
                <div className="flex justify-between text-sm">
                  <span>{c.c}</span>
                  <span className="num font-semibold">{c.v}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <CardHeader title="Product performance" action={<Button size="sm" variant="outline" icon={<Download className="size-4" />} onClick={() => toast({ kind: 'success', title: 'Report exported' })}>Export</Button>} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Currency</th>
                <th className="pb-2 text-right font-medium">Current rate</th>
                <th className="pb-2 text-right font-medium">Clients</th>
                <th className="pb-2 text-right font-medium">AUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PRODUCTS.filter((p) => !p.proposed).map((p) => (
                <tr key={p.id}>
                  <td className="py-3"><span className="mr-2 inline-block size-2.5 rounded-full" style={{ background: p.color }} />{p.name}</td>
                  <td className="py-3">{p.currency}</td>
                  <td className="num py-3 text-right">{(rates[p.id] ?? p.rate).toFixed(2)}%</td>
                  <td className="num py-3 text-right">{rows.filter((r) => r.products.includes(p.id)).length}</td>
                  <td className="num py-3 text-right font-semibold">{money(byProduct.find((b) => b.id === p.id)?.value ?? 0, 'NGN', { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

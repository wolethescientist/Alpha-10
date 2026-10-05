import { ArrowLeft, Check, MessageCircle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Donut } from '../../components/charts'
import { Avatar, Badge, Button, Card, CardHeader, Input, PageHeader, StatusBadge } from '../../components/ui'
import { date, money, relative } from '../../lib/format'
import { portfolioTotals, rmMap } from '../../lib/mock'
import { accrued, holdingValue, productMap } from '../../lib/products'
import { useStaffClients } from '../../lib/staff'
import { uid } from '../../lib/format'
import { useApp } from '../../store/app'
import { useFx } from '../../store/market'
import { useUI } from '../../store/ui'
import { TxnRow } from '../client/Transactions'

export default function ClientDetail() {
  const { id } = useParams()
  const rows = useStaffClients()
  const accounts = useApp((s) => s.accounts)
  const verifyKyc = useApp((s) => s.verifyKyc)
  const toast = useUI((s) => s.toast)
  const fx = useFx()
  const [msg, setMsg] = useState('')
  const row = rows.find((r) => r.id === id)
  if (!row) return <Navigate to="/staff/clients" replace />
  const acc = row.accountId ? accounts[row.accountId] : undefined
  const rm = rmMap[row.rmId]!
  const totals = acc ? portfolioTotals(acc, fx) : null

  const sendMessage = () => {
    if (!acc || !msg.trim()) return
    useApp.setState((s) => ({
      accounts: { ...s.accounts, [acc.profile.id]: { ...acc, chat: [...acc.chat, { id: uid('c_'), from: 'rm', text: msg.trim(), date: new Date().toISOString() }], notifications: [{ id: uid('n_'), title: `New message from ${rm.name}`, body: msg.trim(), date: new Date().toISOString(), read: false, kind: 'info' }, ...acc.notifications] } },
    }))
    setMsg('')
    toast({ kind: 'success', title: 'Message sent to client', body: 'It appears instantly in their portal chat.' })
  }

  return (
    <div className="space-y-6">
      <Link to="/staff/clients" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Clients
      </Link>
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <Avatar name={row.name} hue={(row.name.charCodeAt(0) * 37) % 360} size={52} />
            {row.name}
          </span>
        }
        subtitle={<span className="capitalize">{row.type} · {row.tier} · {row.region} · client since {date(row.joined)}</span>}
        action={
          row.kyc !== 'verified' ? (
            <Button icon={<ShieldCheck className="size-4" />} onClick={() => { verifyKyc(row.id); toast({ kind: 'success', title: 'KYC verified', body: `${row.name} has been notified.` }) }}>
              Approve KYC
            </Button>
          ) : (
            <Badge tone="gain"><Check className="size-3" /> KYC verified</Badge>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5"><p className="text-[13px] text-muted">AUM</p><p className="num mt-1 text-2xl font-semibold">{money(row.aum, 'NGN', { compact: true })}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-muted">Interest earned</p><p className="num mt-1 text-2xl font-semibold text-gain">{money(totals?.interestTotalNGN ?? row.aum * 0.084, 'NGN', { compact: true })}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-muted">Relationship manager</p><p className="mt-1 font-semibold">{rm.name}</p><p className="text-xs text-muted">{rm.region}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-muted">KYC</p><div className="mt-2"><StatusBadge status={row.kyc} /></div><p className="mt-1 text-xs text-muted">Last active {relative(row.lastActive)}</p></Card>
      </div>

      {acc ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <CardHeader title="Holdings" />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Rate</th>
                      <th className="pb-2 font-medium">Start</th>
                      <th className="pb-2 text-right font-medium">Principal</th>
                      <th className="pb-2 text-right font-medium">Accrued</th>
                      <th className="pb-2 text-right font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {acc.holdings.map((h) => {
                      const p = productMap[h.productId]
                      return (
                        <tr key={h.id}>
                          <td className="py-2.5"><span className="mr-2 inline-block size-2 rounded-full" style={{ background: p.color }} />{p.short} {h.status === 'redeeming' && <Badge tone="info">Redeeming</Badge>}</td>
                          <td className="num py-2.5">{h.rate.toFixed(2)}%</td>
                          <td className="py-2.5 text-muted">{date(h.startDate)}</td>
                          <td className="num py-2.5 text-right">{money(h.principal, p.currency)}</td>
                          <td className="num py-2.5 text-right text-gain">{money(accrued(h), p.currency)}</td>
                          <td className="num py-2.5 text-right font-semibold">{money(holdingValue(h), p.currency)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {acc.holdings.length === 0 && <p className="py-6 text-center text-sm text-muted">No investments yet.</p>}
              </div>
            </Card>
            <Card className="p-6">
              <CardHeader title="Recent transactions" />
              <div className="mt-2 divide-y divide-line">
                {acc.txns.slice(0, 8).map((t) => <TxnRow key={t.id} t={t} />)}
                {acc.txns.length === 0 && <p className="py-6 text-center text-sm text-muted">No transactions yet.</p>}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <CardHeader title="Allocation" />
              <div className="mt-4">
                <Donut
                  data={acc.holdings.map((h) => ({ name: productMap[h.productId].short, value: holdingValue(h) * (productMap[h.productId].currency === 'USD' ? fx : 1), color: productMap[h.productId].color }))}
                  centerLabel="Total"
                  centerValue={money(totals!.totalNGN, 'NGN', { compact: true })}
                  size={150}
                />
              </div>
            </Card>
            <Card className="p-6">
              <CardHeader title="KYC documents" />
              <div className="mt-3 space-y-2">
                {acc.kycDocs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 text-sm">
                    <span>{d.label}</span>
                    <StatusBadge status={d.status === 'pending' ? 'in review' : d.status} />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <CardHeader title="Contact" subtitle={`${acc.profile.email} · ${acc.profile.phone}`} />
              <div className="mt-4 flex gap-2">
                <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message client in-portal…" />
                <Button onClick={sendMessage} disabled={!msg.trim()} className="shrink-0" icon={<MessageCircle className="size-4" />}>Send</Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <CardHeader title="Product mix" />
          <div className="mt-4 flex flex-wrap gap-2">
            {row.products.map((p) => <Badge key={p}>{productMap[p].name}</Badge>)}
          </div>
          <p className="mt-4 text-sm text-muted">Full holdings, documents and communications are available for every client. Open a live demo account to see the complete client file.</p>
        </Card>
      )}
    </div>
  )
}

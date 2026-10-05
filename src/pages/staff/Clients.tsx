import { Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, Input, PageHeader, Select, StatusBadge } from '../../components/ui'
import { money, relative } from '../../lib/format'
import { rmMap } from '../../lib/mock'
import { productMap } from '../../lib/products'
import { useStaffClients } from '../../lib/staff'

export default function Clients() {
  const rows = useStaffClients()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')
  const [region, setRegion] = useState('all')
  const [kyc, setKyc] = useState('all')
  const list = useMemo(
    () => rows.filter((r) => (!q || r.name.toLowerCase().includes(q.toLowerCase())) && (tier === 'all' || r.tier === tier) && (region === 'all' || r.region === region) && (kyc === 'all' || r.kyc === kyc)),
    [rows, q, tier, region, kyc],
  )
  const total = list.reduce((a, r) => a + r.aum, 0)

  const exportCsv = () => {
    const csv = [['Client', 'Type', 'Tier', 'Region', 'RM', 'AUM (NGN)', 'KYC'], ...list.map((r) => [r.name, r.type, r.tier, r.region, rmMap[r.rmId]?.name ?? '', r.aum.toFixed(2), r.kyc])].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'alpha10-clients.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" subtitle={`${list.length} clients · ${money(total, 'NGN', { compact: true })} AUM`} action={<Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>Export</Button>} />
      <Card className="p-4 sm:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_repeat(3,180px)]">
          <Input prefix={<Search className="size-4" />} placeholder="Search clients" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="all">All tiers</option>
            {['Classic', 'Premier', 'Private', 'Institutional'].map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">All regions</option>
            {['North', 'Southwest', 'South-South', 'South-East'].map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Select value={kyc} onChange={(e) => setKyc(e.target.value)}>
            <option value="all">Any KYC status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="incomplete">Incomplete</option>
          </Select>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium">Products</th>
                <th className="pb-3 font-medium">RM</th>
                <th className="pb-3 font-medium">KYC</th>
                <th className="pb-3 font-medium">Last active</th>
                <th className="pb-3 text-right font-medium">AUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((r) => (
                <tr key={r.id} onClick={() => nav(`/staff/clients/${r.id}`)} className="cursor-pointer transition hover:bg-surface-2">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} hue={(r.name.charCodeAt(0) * 37) % 360} size={34} />
                      <div>
                        <p className="font-semibold">{r.name} {r.isDemo && <Badge tone="gold">Live demo</Badge>}</p>
                        <p className="text-xs text-muted capitalize">{r.type} · {r.region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3"><Badge>{r.tier}</Badge></td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {r.products.map((p) => (
                        <span key={p} title={productMap[p].name} className="size-2.5 rounded-full" style={{ background: productMap[p].color }} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-[13px]">{rmMap[r.rmId]?.name}</td>
                  <td className="py-3"><StatusBadge status={r.kyc} /></td>
                  <td className="py-3 text-[13px] text-muted">{relative(r.lastActive)}</td>
                  <td className="num py-3 text-right font-semibold">{money(r.aum, 'NGN', { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

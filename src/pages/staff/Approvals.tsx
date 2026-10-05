import { AnimatePresence, motion } from 'framer-motion'
import { Check, ClipboardCheck, FileText, X } from 'lucide-react'
import { useState } from 'react'
import { Avatar, Badge, Button, Card, Empty, Input, Modal, PageHeader, StatusBadge, Tabs } from '../../components/ui'
import { money, relative } from '../../lib/format'
import { productMap } from '../../lib/products'
import { useStaffClients } from '../../lib/staff'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'

export default function Approvals() {
  const redemptions = useApp((s) => s.redemptions)
  const accounts = useApp((s) => s.accounts)
  const { approveRedemption, rejectRedemption, verifyKyc } = useApp()
  const rows = useStaffClients()
  const toast = useUI((s) => s.toast)
  const [tab, setTab] = useState<'redemptions' | 'kyc' | 'history'>('redemptions')
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [docView, setDocView] = useState<{ client: string; label: string } | null>(null)

  const pending = redemptions.filter((r) => r.status === 'pending' || r.status === 'approved')
  const history = redemptions.filter((r) => r.status === 'paid' || r.status === 'rejected')
  const kycQueue = rows.filter((r) => r.kyc !== 'verified')

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" subtitle="Maker-checker queue for redemptions and client onboarding." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'redemptions', label: 'Redemptions', count: redemptions.filter((r) => r.status === 'pending').length },
          { value: 'kyc', label: 'KYC reviews', count: kycQueue.length },
          { value: 'history', label: 'History' },
        ]}
      />

      {tab === 'redemptions' && (
        <div className="space-y-3">
          {pending.length === 0 && (
            <Card>
              <Empty icon={<ClipboardCheck className="size-6" />} title="Queue is clear" body="New redemption requests from clients appear here instantly." />
            </Card>
          )}
          <AnimatePresence initial={false}>
            {pending.map((r) => {
              const p = productMap[r.productId]
              const live = !!accounts[r.clientId]
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }}>
                  <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                    <div className="flex flex-1 items-center gap-4">
                      <Avatar name={r.clientName} hue={(r.clientName.charCodeAt(0) * 37) % 360} size={44} />
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {r.clientName} {live && <Badge tone="gold">Live demo</Badge>}
                        </p>
                        <p className="text-xs text-muted">{r.id} · {p.name} · requested {relative(r.createdAt)}</p>
                        <p className="mt-0.5 text-xs text-muted">Pay to {r.destination}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm lg:w-[360px]">
                      <div>
                        <p className="text-[11px] text-muted">Gross</p>
                        <p className="num font-semibold">{money(r.amount, r.currency, { compact: true })}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Charge</p>
                        <p className="num font-semibold">{r.charge > 0 ? money(r.charge, r.currency, { compact: true }) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted">Net payout</p>
                        <p className="num font-semibold text-gain">{money(r.net, r.currency, { compact: true })}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {r.status === 'approved' ? (
                        <Badge tone="info">Approved · paying out…</Badge>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" icon={<X className="size-4" />} onClick={() => setRejecting(r.id)}>Reject</Button>
                          <Button size="sm" icon={<Check className="size-4" />} onClick={() => { approveRedemption(r.id); toast({ kind: 'success', title: `${r.id} approved`, body: live ? 'The client sees the update live.' : 'Payout queued.' }) }}>Approve</Button>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {tab === 'kyc' && (
        <div className="space-y-3">
          {kycQueue.length === 0 && <Card><Empty icon={<Check className="size-6" />} title="All clients verified" /></Card>}
          {kycQueue.map((r) => {
            const acc = r.accountId ? accounts[r.accountId] : undefined
            const docs = acc?.kycDocs ?? [{ id: 'id', label: 'Government-issued ID', status: 'pending' as const }, { id: 'poa', label: 'Proof of address', status: 'missing' as const }]
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <Avatar name={r.name} hue={(r.name.charCodeAt(0) * 37) % 360} size={44} />
                    <div>
                      <p className="font-semibold">{r.name} {r.isDemo && <Badge tone="gold">Live demo</Badge>}</p>
                      <p className="text-xs text-muted capitalize">{r.type} · joined {relative(r.joined)} · BVN matched ✓ · AML screening clear ✓</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docs.map((d) => (
                      <button key={d.id} onClick={() => setDocView({ client: r.name, label: d.label })} className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs hover:bg-surface-2">
                        <FileText className="size-3.5" /> {d.label.split(' (')[0]} <StatusBadge status={d.status === 'pending' ? 'in review' : d.status} />
                      </button>
                    ))}
                  </div>
                  <Button size="sm" icon={<Check className="size-4" />} onClick={() => { verifyKyc(r.id); toast({ kind: 'success', title: 'KYC approved', body: `${r.name} is now fully verified.` }) }}>
                    Approve
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'history' && (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-2 font-medium">Reference</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {history.map((r) => (
                  <tr key={r.id}>
                    <td className="num py-2.5">{r.id}</td>
                    <td className="py-2.5">{r.clientName}</td>
                    <td className="py-2.5">{productMap[r.productId].short}</td>
                    <td className="py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="num py-2.5 text-right font-semibold">{money(r.net, r.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && <p className="py-8 text-center text-sm text-muted">No processed requests yet.</p>}
          </div>
        </Card>
      )}

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject redemption" size="sm">
        <div className="space-y-4">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason shared with the client" />
          <Button variant="danger" className="w-full" onClick={() => { rejectRedemption(rejecting!, note); setRejecting(null); setNote(''); toast({ kind: 'info', title: 'Redemption rejected' }) }}>Reject request</Button>
        </div>
      </Modal>

      <Modal open={!!docView} onClose={() => setDocView(null)} title={docView?.label} size="md">
        <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-gradient-to-br from-stone-200 to-stone-300 text-center dark:from-stone-800 dark:to-stone-900">
          <div>
            <FileText className="mx-auto size-10 text-stone-500" />
            <p className="mt-3 font-semibold text-stone-700 dark:text-stone-300">{docView?.client}</p>
            <p className="text-xs text-stone-500">Document preview · quality score 96%</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

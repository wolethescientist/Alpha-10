import { Check, Copy, Gift, Mail, MessageCircle, Users } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, CardHeader, PageHeader, StatusBadge } from '../../components/ui'
import { money, relative } from '../../lib/format'
import { useAccount } from '../../store/app'
import { useUI } from '../../store/ui'

export default function Referrals() {
  const acc = useAccount()
  const toast = useUI((s) => s.toast)
  const [copied, setCopied] = useState(false)
  const code = acc.profile.referralCode
  const link = `https://alpha10group.com/join/${code}`
  const earned = acc.referrals.reduce((a, r) => a + r.reward, 0)
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Grow together" title="Refer & earn" subtitle="Invite friends and family to invest with Alpha10. You both earn ₦5,000 when they make their first investment." />
      <div className="crimson-gradient relative overflow-hidden rounded-[1.75rem] p-8 text-white sm:p-10">
        <Gift className="absolute -right-6 -bottom-6 size-48 text-white/10" />
        <p className="text-sm text-white/70">Your referral code</p>
        <p className="mt-2 font-display text-5xl font-semibold tracking-wider">{code}</p>
        <div className="mt-6 flex max-w-xl flex-wrap gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-full bg-white/10 px-4 py-2.5 text-sm">
            <span className="truncate">{link}</span>
          </div>
          <Button
            variant="white"
            icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            onClick={() => {
              navigator.clipboard?.writeText(link).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" icon={<MessageCircle className="size-4" />} onClick={() => toast({ kind: 'success', title: 'Opening WhatsApp…' })}>WhatsApp</Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" icon={<Mail className="size-4" />} onClick={() => toast({ kind: 'success', title: 'Invite email drafted' })}>Email</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-[13px] text-muted">Friends invited</p><p className="num mt-1 text-2xl font-semibold">{acc.referrals.length}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-muted">Started investing</p><p className="num mt-1 text-2xl font-semibold">{acc.referrals.filter((r) => r.status === 'invested').length}</p></Card>
        <Card className="p-5"><p className="text-[13px] text-muted">Rewards earned</p><p className="num mt-1 text-2xl font-semibold text-gain">{money(earned, 'NGN', { decimals: 0 })}</p></Card>
      </div>
      <Card className="p-6">
        <CardHeader title="Your referrals" />
        <div className="mt-4 divide-y divide-line">
          {acc.referrals.length === 0 && <p className="py-8 text-center text-sm text-muted">Share your code to start earning.</p>}
          {acc.referrals.map((r) => (
            <div key={r.name} className="flex items-center gap-4 py-3.5">
              <span className="grid size-10 place-items-center rounded-full bg-surface-2"><Users className="size-4 text-muted" /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted">Joined {relative(r.date)}</p>
              </div>
              <StatusBadge status={r.status} />
              <span className="num w-24 text-right text-sm font-semibold">{r.reward ? money(r.reward, 'NGN', { decimals: 0 }) : <Badge>Pending</Badge>}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

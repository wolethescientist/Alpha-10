import { motion } from 'framer-motion'
import { Building2, Check, FileUp, Laptop, Moon, Plus, ShieldCheck, Smartphone, Sun } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { OtpStep } from '../public/Login'
import { Avatar, Badge, Button, Card, CardHeader, cx, Field, Input, Modal, PageHeader, ProgressRing, Segmented, Select, StatusBadge, Tabs, Toggle } from '../../components/ui'
import { date, relative } from '../../lib/format'
import { displayName } from '../../lib/hooks'
import { rmMap } from '../../lib/mock'
import { useAccount, useApp } from '../../store/app'
import { useUI } from '../../store/ui'

type Tab = 'profile' | 'kyc' | 'security' | 'banks' | 'preferences'

function Profile() {
  const acc = useAccount()
  const update = useApp((s) => s.updateProfile)
  const toast = useUI((s) => s.toast)
  const p = acc.profile
  const [form, setForm] = useState({ email: p.email, phone: p.phone, address: p.address, city: p.city })
  const fields = [p.email, p.phone, p.address, p.dob, p.nextOfKin?.name, acc.banks.length > 0, p.kycStatus === 'verified', acc.twoFactor]
  const completion = fields.filter(Boolean).length / fields.length
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={displayName(p)} hue={p.avatarHue} size={64} />
          <div>
            <p className="font-display text-2xl font-semibold">{displayName(p)}</p>
            <p className="text-sm text-muted">{p.type === 'corporate' ? 'Corporate account' : p.type === 'joint' ? 'Joint account' : 'Individual account'} · Joined {date(p.joined)}</p>
            <div className="mt-1.5 flex gap-1.5">
              <Badge tone="gold">{p.tier}</Badge>
              <Badge>{p.riskProfile}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Account number"><Input value={p.accountNo} disabled /></Field>
          <Field label="BVN"><Input value={p.bvnMasked} disabled /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="State"><Input value={p.state} disabled /></Field>
        </div>
        {p.nextOfKin && (
          <div className="mt-6 rounded-2xl bg-surface-2 p-4 text-sm">
            <p className="text-xs text-muted">Next of kin</p>
            <p className="font-semibold">{p.nextOfKin.name} <span className="font-normal text-muted">· {p.nextOfKin.relationship} · {p.nextOfKin.phone}</span></p>
          </div>
        )}
        <Button className="mt-6" onClick={() => { update(form); toast({ kind: 'success', title: 'Profile updated' }) }}>Save changes</Button>
      </Card>
      <div className="space-y-6">
        <Card className="flex flex-col items-center p-6 text-center">
          <ProgressRing value={completion} size={110} stroke={9}>
            <span className="num text-2xl font-semibold">{Math.round(completion * 100)}%</span>
          </ProgressRing>
          <p className="mt-4 font-semibold">Profile strength</p>
          <p className="mt-1 text-xs text-muted">{completion < 1 ? 'Complete your KYC and enable 2FA to unlock higher limits.' : 'Your profile is complete. 🎉'}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-muted">Relationship manager</p>
          <p className="mt-1 font-semibold">{rmMap[p.rmId]!.name}</p>
          <p className="text-xs text-muted">{rmMap[p.rmId]!.email}</p>
        </Card>
      </div>
    </div>
  )
}

function Kyc() {
  const acc = useAccount()
  const upload = useApp((s) => s.uploadDoc)
  const [scanning, setScanning] = useState<string | null>(null)
  return (
    <Card className="p-6">
      <CardHeader title="KYC & documents" subtitle="Your identity documents and their verification status" action={<StatusBadge status={acc.profile.kycStatus} />} />
      <div className="mt-6 space-y-3">
        {acc.kycDocs.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4">
            <span className={cx('grid size-11 place-items-center rounded-xl', d.status === 'verified' ? 'bg-gain/10 text-gain' : d.status === 'missing' ? 'bg-loss/10 text-loss' : 'bg-amber-500/10 text-amber-600')}>
              {d.status === 'verified' ? <Check className="size-5" /> : <FileUp className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{d.label}</p>
              <p className="text-xs text-muted">{d.uploadedAt ? `Uploaded ${relative(d.uploadedAt)}` : 'Not uploaded yet'}</p>
            </div>
            <StatusBadge status={d.status === 'pending' ? 'in review' : d.status} />
            {d.status !== 'verified' && (
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={() => { setScanning(d.id); setTimeout(() => { upload(d.id); setScanning(null) }, 1400) }} />
                <span className="inline-flex h-9 items-center rounded-full bg-surface-2 px-4 text-[13px] font-semibold hover:bg-line">{scanning === d.id ? 'Uploading…' : d.status === 'missing' ? 'Upload' : 'Replace'}</span>
              </label>
            )}
          </div>
        ))}
      </div>
      {acc.profile.kycStatus !== 'verified' && <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Compliance reviews documents within a few hours. You’ll be notified once verified.</p>}
    </Card>
  )
}

function Security() {
  const acc = useAccount()
  const { setTwoFactor, revokeDevice, updateProfile } = useApp()
  const toast = useUI((s) => s.toast)
  const [otp, setOtp] = useState(false)
  const [username, setUsername] = useState(acc.profile.username)
  const [pw, setPw] = useState({ cur: '', next: '' })
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardHeader title="Two-factor authentication" subtitle="A one-time code is required at every sign-in" />
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface-2 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className={cx('size-6', acc.twoFactor ? 'text-gain' : 'text-faint')} />
            <div>
              <p className="text-sm font-semibold">{acc.twoFactor ? 'Enabled' : 'Disabled'}</p>
              <p className="text-xs text-muted">SMS & authenticator app</p>
            </div>
          </div>
          <Toggle checked={acc.twoFactor} onChange={(v) => (v ? setOtp(true) : setTwoFactor(false))} label="Two-factor authentication" />
        </div>
        <div className="mt-6 space-y-4">
          <Field label="Username" hint="Change your username any time.">
            <div className="flex gap-2">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              <Button variant="secondary" onClick={() => { updateProfile({ username }); toast({ kind: 'success', title: 'Username updated' }) }}>Save</Button>
            </div>
          </Field>
          <Field label="Current password"><Input type="password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} /></Field>
          <Field label="New password"><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <Button disabled={!pw.cur || pw.next.length < 8} onClick={() => { setPw({ cur: '', next: '' }); toast({ kind: 'success', title: 'Password changed' }) }}>Update password</Button>
          <Button variant="outline" className="ml-2" onClick={() => toast({ kind: 'success', title: 'Transaction PIN reset', body: 'Check your SMS for a temporary PIN.' })}>Reset transaction PIN</Button>
        </div>
      </Card>
      <Card className="p-6">
        <CardHeader title="Signed-in devices" subtitle="Sign out of devices you don’t recognise" />
        <div className="mt-5 space-y-3">
          {acc.devices.map((d) => (
            <motion.div layout key={d.id} className="flex items-center gap-4 rounded-2xl border border-line p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-muted">{/iphone|ios|android/i.test(d.name) ? <Smartphone className="size-5" /> : <Laptop className="size-5" />}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{d.name} {d.current && <Badge tone="gain">This device</Badge>}</p>
                <p className="text-xs text-muted">{d.location} · {relative(d.lastActive)}</p>
              </div>
              {!d.current && (
                <Button size="sm" variant="ghost" onClick={() => { revokeDevice(d.id); toast({ kind: 'success', title: 'Device signed out' }) }}>Sign out</Button>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-surface-2 p-4 text-xs text-muted">
          Last sign-in: today from Lagos, NG. We’ll alert you by email and SMS of any new device sign-in.
        </div>
      </Card>
      <Modal open={otp} onClose={() => setOtp(false)} size="sm">
        <OtpStep destination={acc.profile.phone} onDone={() => { setTwoFactor(true); setOtp(false); toast({ kind: 'success', title: 'Two-factor authentication enabled' }) }} />
      </Modal>
    </div>
  )
}

function Banks() {
  const acc = useAccount()
  const addBank = useApp((s) => s.addBank)
  const toast = useUI((s) => s.toast)
  const [open, setOpen] = useState(false)
  const [bank, setBank] = useState('Access Bank')
  const [number, setNumber] = useState('')
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  return (
    <Card className="p-6">
      <CardHeader title="Bank accounts" subtitle="Where we pay your redemptions and income" action={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>Add account</Button>} />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {acc.banks.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cx('relative overflow-hidden rounded-2xl p-5 text-white', i % 2 === 0 ? 'crimson-gradient' : 'bg-[#1c1c1f]')}>
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <Building2 className="size-6 text-white/80" />
              <div className="flex gap-1.5">
                <Badge className="bg-white/15 text-white">{b.currency}</Badge>
                {b.primary && <Badge className="bg-white text-brand-800">Primary</Badge>}
              </div>
            </div>
            <p className="num relative mt-6 text-xl tracking-[0.15em]">{b.number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</p>
            <p className="relative mt-2 text-sm font-semibold">{b.bank}</p>
            <p className="relative text-xs text-white/65">{b.name}</p>
          </motion.div>
        ))}
        {acc.banks.length === 0 && <p className="text-sm text-muted">No bank accounts yet.</p>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add bank account" size="sm">
        <div className="space-y-4">
          <Segmented value={currency} onChange={setCurrency} options={[{ value: 'NGN', label: 'Naira' }, { value: 'USD', label: 'Domiciliary (USD)' }]} />
          <Field label="Bank">
            <Select value={bank} onChange={(e) => setBank(e.target.value)}>
              {['Access Bank', 'First Bank', 'Guaranty Trust Bank', 'Stanbic IBTC', 'UBA', 'Zenith Bank'].map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Account number"><Input value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" /></Field>
          {number.length === 10 && <p className="flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-3 text-sm"><Check className="size-4 text-gain" /> <b>{displayName(acc.profile).toUpperCase()}</b></p>}
          <Button className="w-full" disabled={number.length !== 10} onClick={() => { addBank({ bank, number, currency }); setOpen(false); setNumber(''); toast({ kind: 'success', title: 'Bank account added' }) }}>Add account</Button>
        </div>
      </Modal>
    </Card>
  )
}

function Preferences() {
  const { theme, setTheme, hideBalances, toggleHideBalances, restartTour } = useApp()
  const toast = useUI((s) => s.toast)
  const [prefs, setPrefs] = useState({ email: true, sms: true, push: true, market: true, marketing: false })
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardHeader title="Appearance" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={cx('rounded-2xl border p-4 text-left transition', theme === t ? 'border-brand-700 ring-1 ring-brand-700' : 'border-line')}>
              <div className={cx('mb-3 h-16 rounded-xl', t === 'light' ? 'bg-[#f7f5f2] ring-1 ring-black/5' : 'bg-[#0b0b0c]')}>
                <div className="m-2 h-3 w-12 rounded bg-brand-700" />
              </div>
              <span className="flex items-center gap-2 text-sm font-semibold">{t === 'light' ? <Sun className="size-4" /> : <Moon className="size-4" />} {t === 'light' ? 'Light' : 'Dark'}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface-2 p-4">
          <div>
            <p className="text-sm font-semibold">Hide balances</p>
            <p className="text-xs text-muted">Mask amounts when using the app in public</p>
          </div>
          <Toggle checked={hideBalances} onChange={toggleHideBalances} label="Hide balances" />
        </div>
        <Button variant="outline" className="mt-5" onClick={() => { restartTour(); toast({ kind: 'info', title: 'Tour restarted', body: 'Head to the dashboard to see it.' }) }}>Replay product tour</Button>
      </Card>
      <Card className="p-6">
        <CardHeader title="Notifications" />
        <div className="mt-4 divide-y divide-line">
          {[
            { k: 'email', l: 'Email', d: 'Statements, confirmations and receipts' },
            { k: 'sms', l: 'SMS', d: 'Security codes and transaction alerts' },
            { k: 'push', l: 'Push notifications', d: 'Real-time updates on your devices' },
            { k: 'market', l: 'Market insights', d: 'Weekly Global Market Update' },
            { k: 'marketing', l: 'Offers & events', d: 'New products and financial literacy seminars' },
          ].map((n) => (
            <div key={n.k} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-semibold">{n.l}</p>
                <p className="text-xs text-muted">{n.d}</p>
              </div>
              <Toggle checked={prefs[n.k as keyof typeof prefs]} onChange={(v) => setPrefs({ ...prefs, [n.k]: v })} label={n.l} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'profile'
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your profile, security and preferences." />
      <Tabs
        value={tab}
        onChange={(t) => setParams({ tab: t })}
        tabs={[
          { value: 'profile', label: 'Profile' },
          { value: 'kyc', label: 'KYC & documents' },
          { value: 'security', label: 'Security' },
          { value: 'banks', label: 'Bank accounts' },
          { value: 'preferences', label: 'Preferences' },
        ]}
      />
      {tab === 'profile' && <Profile />}
      {tab === 'kyc' && <Kyc />}
      {tab === 'security' && <Security />}
      {tab === 'banks' && <Banks />}
      {tab === 'preferences' && <Preferences />}
    </div>
  )
}

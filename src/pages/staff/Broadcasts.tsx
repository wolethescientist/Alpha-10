import { Bell, Megaphone, Send } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardHeader, Field, Input, Logo, PageHeader, Select } from '../../components/ui'
import { relative } from '../../lib/format'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'

const TEMPLATES = [
  { t: 'New T-bill rates this week', b: 'Our 364-day Treasury Backed Investment now pays 19.75% p.a. Lock in today from the Invest tab.' },
  { t: 'Financial literacy seminar', b: 'Join our free “Planning for your children’s education” webinar this Saturday at 11am.' },
  { t: 'Scheduled maintenance', b: 'The portal will be briefly unavailable on Sunday from 1am to 3am for upgrades.' },
]

export default function Broadcasts() {
  const { broadcast, broadcasts } = useApp()
  const toast = useUI((s) => s.toast)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('All clients')
  return (
    <div className="space-y-6">
      <PageHeader title="Broadcasts" subtitle="Send announcements to clients’ portal and phone in one step." />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <CardHeader title="Compose" />
          <div className="mt-4 flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button key={t.t} onClick={() => { setTitle(t.t); setBody(t.b) }} className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-ink">
                {t.t}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Audience">
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                {['All clients', 'Private & Institutional', 'Retail (Classic & Premier)', 'Dollar product holders', 'North region'].map((a) => <option key={a}>{a}</option>)}
              </Select>
            </Field>
            <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
            <Field label="Message">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full rounded-xl border border-line bg-surface p-4 text-[15px] outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10" />
            </Field>
            <Button icon={<Send className="size-4" />} disabled={!title || !body} onClick={() => { broadcast(title, body, audience); toast({ kind: 'success', title: 'Broadcast sent', body: `Delivered to ${audience.toLowerCase()}` }); setTitle(''); setBody('') }}>
              Send broadcast
            </Button>
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="Client preview" subtitle="How it appears on a phone" />
            <div className="mx-auto mt-5 max-w-xs rounded-[2rem] bg-[#141414] p-3">
              <div className="rounded-[1.5rem] bg-gradient-to-b from-[#2a0b0c] to-[#0e0e0e] p-4 pt-8">
                <p className="text-center text-4xl font-light text-white/90">09:41</p>
                <div className="mt-6 rounded-2xl bg-white/12 p-3 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-md bg-white p-0.5"><Logo variant="dark" mark className="h-4" /></span>
                    <p className="text-[11px] font-semibold text-white/80">ALPHA10</p>
                    <p className="ml-auto text-[10px] text-white/50">now</p>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold text-white">{title || 'Your headline here'}</p>
                  <p className="mt-0.5 line-clamp-3 text-xs text-white/70">{body || 'Your message preview will show here.'}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Sent" />
            <div className="mt-3 space-y-3">
              {broadcasts.length === 0 && <p className="flex items-center gap-2 text-sm text-muted"><Megaphone className="size-4" /> Nothing sent yet.</p>}
              {broadcasts.map((b) => (
                <div key={b.id} className="rounded-xl bg-surface-2 p-3.5">
                  <p className="flex items-center gap-2 text-sm font-semibold"><Bell className="size-3.5 text-brand-700" /> {b.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{b.audience} · {relative(b.date)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

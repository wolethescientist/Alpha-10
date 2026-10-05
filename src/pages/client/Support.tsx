import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LifeBuoy, Mail, MapPin, MessageCircle, Phone, Plus, Search, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Card, CardHeader, cx, Field, Input, Modal, PageHeader, Select, StatusBadge, Tabs } from '../../components/ui'
import { FAQS } from '../../lib/content'
import { date, relative } from '../../lib/format'
import { rmMap } from '../../lib/mock'
import { useAccount, useApp } from '../../store/app'
import { useUI } from '../../store/ui'

function Chat() {
  const acc = useAccount()
  const send = useApp((s) => s.sendChat)
  const typing = useUI((s) => s.rmTyping)
  const rm = rmMap[acc.profile.rmId]!
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), [acc.chat.length, typing])
  const submit = (t = text) => {
    if (!t.trim()) return
    send(t.trim())
    setText('')
  }
  return (
    <Card className="flex h-[600px] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="relative">
          <Avatar name={rm.name} hue={rm.hue} size={42} />
          <span className="absolute right-0 bottom-0 size-3 rounded-full bg-gain ring-2 ring-surface" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{rm.name}</p>
          <p className="text-xs text-muted">{rm.title} · {rm.region}</p>
        </div>
        <a href={`tel:${rm.phone.replace(/\s/g, '')}`} className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink" aria-label="Call">
          <Phone className="size-4" />
        </a>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-surface-2/40 p-5 scrollbar-thin">
        {acc.chat.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cx('flex', m.from === 'client' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', m.from === 'client' ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-surface shadow-sm ring-1 ring-line')}>
              <p>{m.text}</p>
              <p className={cx('mt-1 text-[10px]', m.from === 'client' ? 'text-white/60' : 'text-faint')}>{date(m.date, 'time')}</p>
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex">
              <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 ring-1 ring-line">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="size-2 rounded-full bg-faint" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={end} />
      </div>
      <div className="border-t border-line p-3">
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {['What rates are you offering?', 'I need an investment certificate', 'How do I redeem?', 'Dollar investment options'].map((s) => (
            <button key={s} onClick={() => submit(s)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-ink">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${rm.name.split(' ')[0]}…`} />
          <Button type="submit" className="size-12 shrink-0 px-0" aria-label="Send">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}

function Faq() {
  const [q, setQ] = useState('')
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const list = FAQS.filter((f) => !q || (f.q + f.a).toLowerCase().includes(q.toLowerCase()))
  return (
    <Card className="p-6">
      <Input prefix={<Search className="size-4" />} placeholder="Search help articles" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 divide-y divide-line">
        {list.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
              <span className="text-sm font-semibold">{f.q}</span>
              <ChevronDown className={cx('size-4 shrink-0 text-muted transition', openIdx === i && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-4 text-sm text-muted">
                  {f.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted">No results. Try “redeem”, “certificate” or “password”.</p>}
      </div>
    </Card>
  )
}

function Tickets() {
  const acc = useAccount()
  const create = useApp((s) => s.createTicket)
  const toast = useUI((s) => s.toast)
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Account')
  const [message, setMessage] = useState('')
  return (
    <Card className="p-6">
      <CardHeader title="Support tickets" action={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>New ticket</Button>} />
      <div className="mt-4 space-y-3">
        {acc.tickets.length === 0 && <p className="rounded-2xl bg-surface-2 p-5 text-sm text-muted">No tickets yet.</p>}
        {acc.tickets.map((t) => (
          <div key={t.id} className="rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{t.subject}</p>
                <p className="text-xs text-muted">{t.id} · {t.category} · {relative(t.createdAt)}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="mt-3 space-y-2">
              {t.messages.map((m, i) => (
                <p key={i} className={cx('rounded-xl px-3 py-2 text-[13px]', m.from === 'client' ? 'bg-surface-2' : 'bg-brand-700/[0.06]')}>
                  <b className="mr-1">{m.from === 'client' ? 'You' : 'Alpha10 Support'}:</b>
                  {m.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="New support ticket">
        <div className="space-y-4">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Account', 'Deposits', 'Redemptions', 'Documents', 'Technical', 'Complaint'].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Message">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full rounded-xl border border-line bg-surface p-4 text-[15px] outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10" />
          </Field>
          <Button className="w-full" disabled={!subject || !message} onClick={() => { create({ subject, category, message }); setOpen(false); setSubject(''); setMessage(''); toast({ kind: 'success', title: 'Ticket created', body: 'We’ll respond within 2 business hours.' }) }}>
            Submit ticket
          </Button>
        </div>
      </Modal>
    </Card>
  )
}

export default function Support() {
  const [tab, setTab] = useState<'chat' | 'tickets' | 'faq'>('chat')
  return (
    <div className="space-y-6">
      <PageHeader title="Help & support" subtitle="Talk to your relationship manager, raise a ticket or find answers instantly." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Tabs value={tab} onChange={setTab} tabs={[{ value: 'chat', label: 'Chat with RM' }, { value: 'tickets', label: 'Tickets' }, { value: 'faq', label: 'FAQs' }]} />
          {tab === 'chat' && <Chat />}
          {tab === 'tickets' && <Tickets />}
          {tab === 'faq' && <Faq />}
        </div>
        <div className="space-y-4">
          {[
            { icon: Phone, t: 'Call us', d: '+234 913 444 4497', s: 'Mon–Fri, 8am–6pm' },
            { icon: Mail, t: 'Email', d: 'customerservice@alpha10group.com', s: 'Replies within 4 hours' },
            { icon: MapPin, t: 'Abuja', d: '13 Mambolo Street, Wuse Zone 2', s: 'Head office' },
            { icon: MapPin, t: 'Lagos', d: 'Eleganza Biro House, Victoria Island', s: '5th Floor, Plot 634 Adeyemo Alakija St' },
          ].map((c) => (
            <Card key={c.t + c.d} className="flex gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-700/8 text-brand-700 dark:text-brand-300"><c.icon className="size-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{c.t}</p>
                <p className="truncate text-sm">{c.d}</p>
                <p className="text-xs text-muted">{c.s}</p>
              </div>
            </Card>
          ))}
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-semibold"><LifeBuoy className="size-4 text-brand-700" /> Whistleblowing</p>
            <p className="mt-1 text-xs text-muted">Report misconduct confidentially. Good-faith reporters are protected from retaliation.</p>
            <a href="https://alpha10group.com/whistleblowing/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <MessageCircle className="size-3.5" /> Read the policy
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}

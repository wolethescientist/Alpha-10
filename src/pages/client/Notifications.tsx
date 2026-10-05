import { motion } from 'framer-motion'
import { Bell, CheckCircle2, Info, LineChart, Megaphone, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, cx, Empty, PageHeader, Segmented } from '../../components/ui'
import { date, relative } from '../../lib/format'
import type { Notification } from '../../lib/types'
import { useAccount, useApp } from '../../store/app'

const ICON: Record<Notification['kind'], typeof Info> = { success: CheckCircle2, info: Info, warning: TriangleAlert, market: LineChart, broadcast: Megaphone }
const TONE: Record<Notification['kind'], string> = {
  success: 'bg-gain/10 text-gain',
  info: 'bg-sky-500/10 text-sky-600',
  warning: 'bg-amber-500/10 text-amber-600',
  market: 'bg-brand-700/10 text-brand-700 dark:text-brand-300',
  broadcast: 'bg-gold-400/15 text-gold-600',
}

export default function Notifications() {
  const acc = useAccount()
  const markAllRead = useApp((s) => s.markAllRead)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const list = acc.notifications.filter((n) => filter === 'all' || !n.read)
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Notifications" action={<Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>} />
      <Segmented value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'unread', label: `Unread (${acc.notifications.filter((n) => !n.read).length})` }]} />
      <Card className="divide-y divide-line">
        {list.length === 0 && <Empty icon={<Bell className="size-6" />} title="You’re all caught up" />}
        {list.map((n, i) => {
          const I = ICON[n.kind]
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }} className={cx('flex gap-4 p-5', !n.read && 'bg-brand-700/[0.025]')}>
              <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', TONE[n.kind])}>
                <I className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{n.title}</p>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-700" />}
                </div>
                <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                <p className="mt-1.5 text-xs text-faint" title={date(n.date, 'datetime')}>{relative(n.date)}</p>
              </div>
            </motion.div>
          )
        })}
      </Card>
    </div>
  )
}

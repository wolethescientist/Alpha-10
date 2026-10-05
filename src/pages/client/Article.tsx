import { motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Clock, Share2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Button, Card } from '../../components/ui'
import { ARTICLES } from '../../lib/content'
import { date } from '../../lib/format'
import { useUI } from '../../store/ui'

export default function Article() {
  const { slug } = useParams()
  const a = ARTICLES.find((x) => x.slug === slug)
  const toast = useUI((s) => s.toast)
  if (!a) return <Navigate to="/app/insights" replace />
  const more = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/insights" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All insights
      </Link>
      <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <Badge tone="brand">{a.category}</Badge>
          <span>{date(a.date, 'long')}</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" /> {a.readMins} min read</span>
        </div>
        <h1 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{a.title}</h1>
        <p className="mt-4 text-lg text-muted">{a.summary}</p>
        <div className="mt-6 flex gap-2">
          <Button size="sm" variant="outline" icon={<Share2 className="size-4" />} onClick={() => { navigator.clipboard?.writeText(location.href).catch(() => {}); toast({ kind: 'success', title: 'Link copied' }) }}>Share</Button>
          <Button size="sm" variant="outline" icon={<Bookmark className="size-4" />} onClick={() => toast({ kind: 'success', title: 'Saved to reading list' })}>Save</Button>
        </div>

        <Card className="mt-8 border-l-4 border-l-brand-700 p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase dark:text-brand-300">Key takeaways</p>
          <ul className="mt-3 space-y-2">
            {a.takeaways.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15px]">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-700" /> {t}
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-8 space-y-6 text-[17px] leading-relaxed">
          {a.body.map((b, i) => (
            <div key={i}>
              {b.h && <h2 className="mb-2 font-display text-2xl font-semibold">{b.h}</h2>}
              <p className="text-ink/85">{b.p}</p>
            </div>
          ))}
        </div>

        {a.chart && (
          <Card className="mt-10 p-6">
            <p className="text-sm font-semibold">{a.chart.label}</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <AreaChart data={a.chart.values.map((v, i) => ({ w: `W${i + 1}`, v }))} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="art" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#961a1c" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#961a1c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="w" tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={({ active, payload, label }) => (active && payload?.length ? <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-xl"><span className="text-muted">{label}</span> <b className="num">{payload[0]!.value as number}</b></div> : null)} />
                  <Area type="monotone" dataKey="v" stroke="#961a1c" strokeWidth={2} fill="url(#art)" dot={{ r: 3, fill: '#961a1c' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <p className="mt-10 border-t border-line pt-6 text-xs text-faint">This publication is for information only and does not constitute investment advice. Sample content for the prototype.</p>
      </motion.article>

      <div className="mt-12">
        <p className="mb-4 font-semibold">More insights</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {more.map((m) => (
            <Link key={m.slug} to={`/app/insights/${m.slug}`}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5">
                <p className="text-xs text-muted">{m.category}</p>
                <p className="mt-2 text-sm leading-snug font-semibold">{m.title}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

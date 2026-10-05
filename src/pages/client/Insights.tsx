import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, PageHeader, Segmented, Sparkline } from '../../components/ui'
import { ARTICLES } from '../../lib/content'
import { date } from '../../lib/format'

export default function Insights() {
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(ARTICLES.map((a) => a.category))]
  const list = ARTICLES.filter((a) => cat === 'All' || a.category === cat)
  const [hero, ...rest] = list

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Research desk" title="Market insights" subtitle="Weekly analysis from the Alpha10 investment team, written for decisions — not jargon." />
      <div className="no-scrollbar overflow-x-auto">
        <Segmented value={cat} onChange={setCat} options={cats.map((c) => ({ value: c, label: c }))} />
      </div>
      {hero && (
        <Link to={`/app/insights/${hero.slug}`} className="group relative block overflow-hidden rounded-[1.75rem] bg-[#141414] p-8 text-white sm:p-12">
          <img src="/mark-light.png" alt="" aria-hidden className="absolute -right-20 -bottom-24 w-[420px] opacity-[0.08] transition duration-700 group-hover:scale-110" />
          <div className="relative max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
              <Badge tone="gold">{hero.category}</Badge>
              <span>{date(hero.date, 'long')}</span>
              <span className="flex items-center gap-1"><Clock className="size-3.5" /> {hero.readMins} min read</span>
            </div>
            <h2 className="mt-5 font-display text-3xl leading-tight font-semibold sm:text-5xl">{hero.title}</h2>
            <p className="mt-4 text-white/65">{hero.summary}</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {hero.takeaways.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-400" /> {t}
                </li>
              ))}
            </ul>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-gold-300">
              Read full update <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rest.map((a, i) => (
          <motion.div key={a.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/app/insights/${a.slug}`} className="group block h-full">
              <Card className="flex h-full flex-col p-6 transition group-hover:-translate-y-0.5 group-hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{a.category}</Badge>
                  <span className="text-xs text-muted">{date(a.date)}</span>
                </div>
                <h3 className="mt-4 font-display text-xl leading-snug font-semibold">{a.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{a.summary}</p>
                {a.chart && (
                  <div className="mt-4">
                    <Sparkline data={a.chart.values} width={220} height={36} color="#961a1c" />
                  </div>
                )}
                <p className="mt-4 flex items-center gap-1 text-xs text-muted">
                  <Clock className="size-3.5" /> {a.readMins} min read
                </p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-xs text-faint">Sample research content for the prototype.</p>
    </div>
  )
}

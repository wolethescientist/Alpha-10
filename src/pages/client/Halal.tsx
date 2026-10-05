import { motion } from 'framer-motion'
import { BadgeCheck, Handshake, Leaf, Scale } from 'lucide-react'
import { useState } from 'react'
import { Donut } from '../../components/charts'
import { celebrate } from '../../components/flows/shared'
import { Badge, Button, Card, CardHeader } from '../../components/ui'
import { productMap } from '../../lib/products'
import { useApp } from '../../store/app'
import { useUI } from '../../store/ui'

export default function Halal() {
  const p = productMap.halal
  const enabled = useApp((s) => s.enabled.halal)
  const rate = useApp((s) => s.rates.halal ?? p.rate)
  const open = useUI((s) => s.open)
  const toast = useUI((s) => s.toast)
  const [joined, setJoined] = useState(false)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0d3b2e] via-[#0b2a22] to-[#141414] p-8 text-white sm:p-12">
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
          <defs>
            <pattern id="geo" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M24 0 L48 24 L24 48 L0 24 Z M24 10 L38 24 L24 38 L10 24 Z" fill="none" stroke="#d9b96a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo)" />
        </svg>
        <div className="relative max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Badge tone="gold">Non-interest finance</Badge>
            <Badge className={enabled ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/80'}>{enabled ? 'Now live' : 'Launching soon'}</Badge>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-4 text-lg text-white/70">{p.description}</p>
          <div className="mt-8 flex flex-wrap gap-8">
            <div>
              <p className="text-xs text-white/50">Expected profit rate</p>
              <p className="num text-3xl font-semibold text-gold-300">{rate.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Minimum</p>
              <p className="num text-3xl font-semibold">₦5,000</p>
            </div>
          </div>
          {enabled ? (
            <Button size="lg" variant="gold" className="mt-8" onClick={() => open({ kind: 'invest', productId: 'halal' })}>
              Invest now
            </Button>
          ) : (
            <Button
              size="lg"
              variant="gold"
              className="mt-8"
              disabled={joined}
              onClick={() => {
                setJoined(true)
                celebrate()
                toast({ kind: 'success', title: 'You’re on the waitlist', body: 'We’ll notify you the moment the Halal Fund launches.' })
              }}
            >
              {joined ? 'You’re on the waitlist ✓' : 'Join the waitlist'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Scale, t: 'No riba', d: 'Returns come from profit-sharing in real economic activity — never interest.' },
          { icon: BadgeCheck, t: 'Shariah board', d: 'An independent Shariah advisory board screens every investment.' },
          { icon: Leaf, t: 'Ethical screening', d: 'Excludes alcohol, gambling, conventional finance and other non-permissible sectors.' },
          { icon: Handshake, t: 'Purification', d: 'Any incidental non-permissible income is purified to charity.' },
        ].map((f, i) => (
          <motion.div key={f.t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="h-full p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"><f.icon className="size-5" /></span>
              <p className="mt-4 font-semibold">{f.t}</p>
              <p className="mt-1 text-sm text-muted">{f.d}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6">
        <CardHeader title="Proposed asset allocation" subtitle="Indicative — subject to Shariah board approval" />
        <div className="mt-6 max-w-2xl">
          <Donut hideValues data={p.allocation.map((a, i) => ({ ...a, color: ['var(--p-fxflex)', 'var(--p-lmi)', 'var(--p-dollar)'][i]! }))} centerLabel="Allocation" centerValue="3 assets" size={170} />
        </div>
      </Card>
    </div>
  )
}

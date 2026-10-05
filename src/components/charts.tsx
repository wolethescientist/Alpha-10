import { motion } from 'framer-motion'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money } from '../lib/format'
import type { Currency } from '../lib/types'
import { cx } from './ui'

export function ChartTooltip({ active, payload, currency = 'NGN', label, labelFormat }: { active?: boolean; payload?: { value: number | number[]; name?: string; color?: string; dataKey?: string }[]; currency?: Currency; label?: string | number; labelFormat?: (l: string | number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs shadow-xl">
      {label !== undefined && <p className="mb-1 text-muted">{labelFormat ? labelFormat(label) : label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="num flex items-center gap-2 font-semibold text-ink">
          {payload.length > 1 && <span className="size-2 rounded-full" style={{ background: p.color }} />}
          {payload.length > 1 && <span className="font-normal text-muted">{p.name}</span>}
          {Array.isArray(p.value) ? `${money(p.value[0]!, currency, { compact: true })} – ${money(p.value[1]!, currency, { compact: true })}` : money(p.value, currency)}
        </p>
      ))}
    </div>
  )
}

/** Brand area chart for a single value-over-time series. */
export function ValueArea({
  data,
  currency = 'NGN',
  height = 260,
  color = '#961a1c',
  id = 'va',
  xFormat,
  showAxis = true,
}: {
  data: { date: string; value: number }[]
  currency?: Currency
  height?: number
  color?: string
  id?: string
  xFormat?: (d: string) => string
  showAxis?: boolean
}) {
  const min = Math.min(...data.map((d) => d.value))
  const max = Math.max(...data.map((d) => d.value))
  const pad = (max - min) * 0.15 || max * 0.02
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxis && <CartesianGrid vertical={false} stroke="var(--chart-grid)" />}
          <XAxis dataKey="date" hide={!showAxis} tickFormatter={xFormat} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} minTickGap={40} />
          <YAxis domain={[min - pad, max + pad]} hide={!showAxis} tickFormatter={(v) => money(v, currency, { compact: true })} tick={{ fontSize: 11, fill: 'var(--faint)' }} axisLine={false} tickLine={false} width={64} orientation="right" />
          <Tooltip content={<ChartTooltip currency={currency} labelFormat={(l) => new Date(l).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />} cursor={{ stroke: 'var(--faint)', strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} animationDuration={900} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--surface)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Donut with a legend that always carries name + share (identity never by colour alone). */
export function Donut({ data, currency = 'NGN', centerLabel, centerValue, size = 200, hideValues }: { data: { name: string; value: number; color: string }[]; currency?: Currency; centerLabel?: string; centerValue?: React.ReactNode; size?: number; hideValues?: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const total = data.reduce((a, b) => a + b.value, 0)
  const active = hover !== null ? data[hover] : null
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 1.5 : 0}
              stroke="var(--surface)"
              strokeWidth={2}
              cornerRadius={4}
              animationDuration={900}
              onMouseEnter={(_, i) => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {data.map((d, i) => (
                <Cell key={d.name} fill={d.color} opacity={hover === null || hover === i ? 1 : 0.35} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[11px] text-muted">{active ? active.name : centerLabel}</p>
            <div className="mt-0.5 text-lg font-semibold">{active ? <span className="num">{((active.value / total) * 100).toFixed(1)}%</span> : centerValue}</div>
          </div>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-2">
        {data.map((d, i) => (
          <li key={d.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={cx('flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition', hover === i && 'bg-surface-2')}>
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-ink">{d.name}</span>
            <span className="num text-muted">{((d.value / total) * 100).toFixed(1)}%</span>
            {!hideValues && <span className="num hidden w-28 text-right font-medium sm:block">{money(d.value, currency, { compact: true })}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MiniBars({ values, max }: { values: number[]; max?: number }) {
  const m = max ?? Math.max(...values)
  return (
    <div className="flex h-10 items-end gap-0.5">
      {values.map((v, i) => (
        <motion.span key={i} initial={{ height: 0 }} animate={{ height: `${(v / m) * 100}%` }} transition={{ delay: i * 0.02 }} className="w-1.5 rounded-t-sm bg-brand-700/70" />
      ))}
    </div>
  )
}

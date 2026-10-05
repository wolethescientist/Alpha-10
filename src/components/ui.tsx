import { animate, AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { AlertTriangle, Check, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { money } from '../lib/format'
import type { Currency } from '../lib/types'
import { useApp } from '../store/app'
import { useUI } from '../store/ui'

export const cx = clsx

/* --------------------------------- Logo --------------------------------- */

export function Logo({ variant = 'auto', className = 'h-9', mark = false }: { variant?: 'auto' | 'light' | 'dark'; className?: string; mark?: boolean }) {
  const base = mark ? 'mark' : 'logo'
  if (variant === 'auto')
    return (
      <>
        <img src={`/${base}-dark.png`} alt="Alpha10" className={cx(className, 'w-auto dark:hidden')} />
        <img src={`/${base}-light.png`} alt="Alpha10" className={cx(className, 'hidden w-auto dark:block')} />
      </>
    )
  return <img src={`/${base}-${variant === 'light' ? 'light' : 'dark'}.png`} alt="Alpha10" className={cx(className, 'w-auto')} />
}

/* -------------------------------- Button -------------------------------- */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'danger' | 'white'

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; loading?: boolean; icon?: ReactNode; iconRight?: ReactNode }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cx(
        'inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'h-9 px-4 text-[13px]',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-13 px-7 text-[15px]',
        variant === 'primary' && 'bg-brand-700 text-white shadow-[0_8px_20px_-8px_rgb(150_26_28/0.7)] hover:bg-brand-800',
        variant === 'secondary' && 'bg-surface-2 text-ink hover:bg-line',
        variant === 'ghost' && 'text-muted hover:bg-surface-2 hover:text-ink',
        variant === 'outline' && 'border border-line bg-surface text-ink hover:border-brand-700/40 hover:bg-surface-2',
        variant === 'gold' && 'bg-gradient-to-r from-gold-400 to-gold-500 text-[#2a1a05] shadow-[0_8px_20px_-8px_rgb(196_154_69/0.7)] hover:brightness-105',
        variant === 'danger' && 'bg-loss text-white hover:brightness-95',
        variant === 'white' && 'bg-white text-[#141414] hover:bg-white/90',
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  )
}

/* --------------------------------- Card --------------------------------- */

export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cx('card', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-wrap items-start justify-between gap-x-4 gap-y-3', className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* --------------------------------- Badge -------------------------------- */

export function Badge({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'brand' | 'gain' | 'loss' | 'gold' | 'info' | 'warning'; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        tone === 'neutral' && 'bg-surface-2 text-muted',
        tone === 'brand' && 'bg-brand-700/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
        tone === 'gain' && 'bg-gain/10 text-gain',
        tone === 'loss' && 'bg-loss/10 text-loss',
        tone === 'gold' && 'bg-gold-400/15 text-gold-600 dark:text-gold-300',
        tone === 'info' && 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
        tone === 'warning' && 'bg-amber-500/12 text-amber-600 dark:text-amber-300',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'completed' || status === 'paid' || status === 'verified' || status === 'resolved' || status === 'active' || status === 'invested'
      ? 'gain'
      : status === 'failed' || status === 'rejected' || status === 'missing'
        ? 'loss'
        : status === 'approved' || status === 'in-progress' || status === 'processing'
          ? 'info'
          : 'warning'
  return <Badge tone={tone}>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</Badge>
}

/* --------------------------------- Inputs ------------------------------- */

export function Field({ label, hint, error, children, className }: { label?: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>}
      {children}
      {error ? <span className="mt-1 block text-xs text-loss">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  )
}

export const inputCls =
  'h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-faint outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10'

export function Input({ className, prefix, suffix, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & { prefix?: ReactNode; suffix?: ReactNode }) {
  if (prefix || suffix)
    return (
      <div className={cx('flex items-center rounded-xl border border-line bg-surface transition focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-600/10', className)}>
        {prefix && <span className="pl-4 text-muted">{prefix}</span>}
        <input {...rest} className="h-12 w-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-faint" />
        {suffix && <span className="pr-4 text-muted">{suffix}</span>}
      </div>
    )
  return <input {...rest} className={cx(inputCls, className)} />
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cx(inputCls, 'appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27><path d=%27M1 1l5 5 5-5%27 stroke=%27%23999%27 stroke-width=%271.6%27 fill=%27none%27/></svg>")] bg-[right_1rem_center] bg-no-repeat pr-10', className)}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-700' : 'bg-line')}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={cx('absolute top-0.5 size-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} />
    </button>
  )
}

export function Segmented<T extends string>({ options, value, onChange, className, size = 'md' }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md' }) {
  const id = useRef(Math.random().toString(36).slice(2)).current
  return (
    <div className={cx('inline-flex rounded-full bg-surface-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx('relative rounded-full font-semibold transition-colors', size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-[13px]', value === o.value ? 'text-ink' : 'text-muted hover:text-ink')}
        >
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-surface shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)} className={cx('relative whitespace-nowrap pb-3 text-sm font-semibold transition-colors', value === t.value ? 'text-ink' : 'text-muted hover:text-ink')}>
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 rounded-full bg-brand-700/10 px-1.5 text-[11px] text-brand-700 dark:text-brand-300">{t.count}</span>}
          {value === t.value && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-700" />}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------ Animated number ------------------------------ */

export function AnimatedNumber({ value, format, duration = 1.1, className }: { value: number; format: (n: number) => string; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  const first = useRef(true)
  useEffect(() => {
    const from = first.current ? value * 0.82 : prev.current
    first.current = false
    const controls = animate(from, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay })
    prev.current = value
    return () => controls.stop()
  }, [value, duration])
  return <span className={cx('num', className)}>{format(display)}</span>
}

/** Money that respects the global "hide balances" switch. */
export function Money({ value, currency = 'NGN', animated, className, compact, decimals }: { value: number; currency?: Currency; animated?: boolean; className?: string; compact?: boolean; decimals?: number }) {
  const hidden = useApp((s) => s.hideBalances)
  if (hidden) return <span className={cx('num tracking-widest', className)}>{currency === 'NGN' ? '₦' : '$'}••••••</span>
  if (animated) return <AnimatedNumber value={value} format={(n) => money(n, currency, { compact, decimals })} className={className} />
  return <span className={cx('num', className)}>{money(value, currency, { compact, decimals })}</span>
}

/* --------------------------------- Modal -------------------------------- */

export function Modal({ open, onClose, children, size = 'md', title, hideClose }: { open: boolean; onClose: () => void; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; title?: ReactNode; hideClose?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cx(
              'relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-2xl scrollbar-thin sm:rounded-3xl',
              size === 'sm' && 'sm:max-w-md',
              size === 'md' && 'sm:max-w-lg',
              size === 'lg' && 'sm:max-w-2xl',
              size === 'xl' && 'sm:max-w-4xl',
            )}
          >
            {(title || !hideClose) && (
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-surface/90 px-6 pt-5 pb-3 backdrop-blur">
                <div className="font-display text-xl font-semibold">{title}</div>
                {!hideClose && (
                  <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label="Close">
                    <X className="size-5" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------- Stepper ------------------------------- */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-2">
          <div className={cx('grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors', i < current ? 'bg-brand-700 text-white' : i === current ? 'bg-brand-700/10 text-brand-700 ring-2 ring-brand-700 dark:text-brand-300' : 'bg-surface-2 text-faint')}>
            {i < current ? <Check className="size-3.5" /> : i + 1}
          </div>
          {(steps.length <= 4 || i === current) && <span className={cx('hidden text-xs font-semibold whitespace-nowrap lg:block', i <= current ? 'text-ink' : 'text-faint')}>{s}</span>}
          {i < steps.length - 1 && <div className={cx('h-0.5 flex-1 rounded-full', i < current ? 'bg-brand-700' : 'bg-line')} />}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- Avatar -------------------------------- */

export function Avatar({ name, hue = 350, size = 40, className }: { name: string; hue?: number; size?: number; className?: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
  return (
    <div
      className={cx('grid shrink-0 place-items-center rounded-full font-semibold text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 30) % 360} 60% 28%))` }}
    >
      {initials}
    </div>
  )
}

/* ------------------------------ Progress ring ----------------------------- */

export function ProgressRing({ value, size = 88, stroke = 8, color = '#961a1c', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - v) }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

/* ------------------------------- Sparkline ------------------------------- */

export function Sparkline({ data, width = 96, height = 32, color }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / span) * (height - 4) - 2}`).join(' ')
  const up = data[data.length - 1]! >= data[0]!
  const stroke = color ?? (up ? 'var(--color-gain)' : 'var(--color-loss)')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* -------------------------------- Empty --------------------------------- */

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-700/8 text-brand-700 dark:text-brand-300">{icon}</div>
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* -------------------------------- Toaster ------------------------------- */

export function Toaster() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed top-4 right-4 left-4 z-[70] flex flex-col items-end gap-2 sm:left-auto sm:w-96">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            className="card pointer-events-auto flex w-full items-start gap-3 p-4"
          >
            <span className={cx('mt-0.5', t.kind === 'success' ? 'text-gain' : t.kind === 'error' ? 'text-loss' : t.kind === 'warning' ? 'text-amber-500' : 'text-sky-500')}>
              {t.kind === 'success' ? <CheckCircle2 className="size-5" /> : t.kind === 'error' ? <XCircle className="size-5" /> : t.kind === 'warning' ? <AlertTriangle className="size-5" /> : <Info className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[13px] text-muted">{t.body}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-faint hover:text-ink" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* --------------------------- Success checkmark --------------------------- */

export function SuccessMark({ size = 96 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <motion.span className="absolute inset-0 rounded-full bg-gain/15" initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ duration: 0.6 }} />
      <motion.span className="absolute inset-3 rounded-full bg-gain" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }} />
      <svg viewBox="0 0 52 52" className="relative" style={{ width: size * 0.45, height: size * 0.45 }}>
        <motion.path d="M14 27 l8 8 l16 -18" fill="none" stroke="white" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.45, ease: 'easeOut' }} />
      </svg>
    </div>
  )
}

/** The Alpha10 wave mark rendered as a slow-spinning loader. */
export function BrandLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative grid size-24 place-items-center">
        <motion.span className="absolute inset-0 rounded-full border-2 border-brand-700/15 border-t-brand-700" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} />
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <Logo mark className="h-12" />
        </motion.div>
      </div>
      {label && (
        <motion.p key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-muted">
          {label}
        </motion.p>
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, action, eyebrow }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase dark:text-brand-300">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

export function Stat({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {icon && <span className="text-faint">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </Card>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton rounded-xl', className)} />
}

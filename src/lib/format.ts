import type { Currency } from './types'

export const SYMBOL: Record<Currency, string> = { NGN: '₦', USD: '$' }

export function money(value: number, currency: Currency = 'NGN', opts: { decimals?: number; compact?: boolean; sign?: boolean } = {}) {
  const { decimals = 2, compact = false, sign = false } = opts
  const abs = Math.abs(value)
  let body: string
  if (compact && abs >= 1_000) {
    const units: [number, string][] = [[1e12, 'T'], [1e9, 'bn'], [1e6, 'm'], [1e3, 'k']]
    const [div, suffix] = units.find(([d]) => abs >= d)!
    body = (abs / div).toLocaleString('en-NG', { maximumFractionDigits: abs / div >= 100 ? 0 : 1 }) + suffix
  } else {
    body = abs.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }
  const s = value < 0 ? '−' : sign && value > 0 ? '+' : ''
  return `${s}${SYMBOL[currency]}${body}`
}

export function num(value: number, decimals = 2) {
  return value.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function pct(value: number, decimals = 2, sign = true) {
  const s = sign && value > 0 ? '+' : value < 0 ? '−' : ''
  return `${s}${Math.abs(value).toFixed(decimals)}%`
}

export function date(iso: string, style: 'short' | 'long' | 'time' | 'datetime' = 'short') {
  const d = new Date(iso)
  if (style === 'time') return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (style === 'datetime')
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (style === 'long') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function relative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 45) return 'just now'
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)}d ago`
  return date(iso)
}

export function daysBetween(a: string | Date, b: string | Date) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

export function addDays(iso: string | Date, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10)
}

export function ref(prefix = 'A10') {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).toUpperCase().slice(2, 6)}`
}

export function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

/** Deterministic PRNG so seeded charts look the same on every load. */
export function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function parseAmount(input: string) {
  const n = Number(input.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function formatInput(input: string) {
  const clean = input.replace(/[^0-9.]/g, '')
  const [int, dec] = clean.split('.')
  const withCommas = (int || '').replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec !== undefined ? `${withCommas}.${dec.slice(0, 2)}` : withCommas
}

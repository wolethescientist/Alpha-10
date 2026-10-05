import type { Currency, Holding, PayoutOption, ProductId } from './types'
import { daysBetween } from './format'

export interface Product {
  id: ProductId
  name: string
  short: string
  category: 'Discretionary' | 'Mutual Fund' | 'Non-Interest'
  currency: Currency
  tagline: string
  description: string
  idealFor: string
  risk: 1 | 2 | 3 | 4 | 5
  minimum: number
  rate: number // default indicative % p.a.
  rateLabel: string
  tenorLabel: string
  tenors?: { days: number; label: string; rate: number }[]
  lockInDays: number
  earlyCharge: number // fraction of accrued income forfeited before lock-in
  liquidity: string
  payouts?: PayoutOption[]
  compounding?: string
  unitPrice?: number
  allocation: { name: string; value: number }[]
  features: string[]
  trustee?: string
  color: string
  proposed?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'tbi',
    name: 'Treasury Backed Investment',
    short: 'Treasury Backed',
    category: 'Discretionary',
    currency: 'NGN',
    tagline: 'Sovereign-backed returns, 100bps above the instrument rate.',
    description:
      'Invests in Federal Government of Nigeria treasury bills and bonds — default-risk-free sovereign instruments — and pays you 100 basis points above the prevailing instrument rate.',
    idealFor: 'Low-risk investors with a short-to-medium term horizon',
    risk: 1,
    minimum: 1_000_000,
    rate: 19.75,
    rateLabel: 'Instrument rate + 1.00%',
    tenorLabel: '91 days – 5 years',
    tenors: [
      { days: 91, label: '91 days', rate: 18.6 },
      { days: 182, label: '182 days', rate: 19.25 },
      { days: 364, label: '364 days', rate: 19.75 },
      { days: 730, label: '2 years', rate: 19.4 },
      { days: 1825, label: '5 years', rate: 18.9 },
    ],
    lockInDays: 91,
    earlyCharge: 0.25,
    liquidity: 'At maturity · early exit forfeits 25% of accrued interest',
    payouts: ['maturity', 'quarterly', 'semi-annual'],
    allocation: [
      { name: 'FGN Treasury Bills', value: 60 },
      { name: 'FGN Bonds', value: 40 },
    ],
    features: ['Default-risk-free (sovereign)', '100bps above instrument rate', 'Investment certificate issued', 'Monthly statements'],
    color: 'var(--p-tbi)',
  },
  {
    id: 'lmi',
    name: 'Liquidity Management Investment',
    short: 'Liquidity Mgmt',
    category: 'Discretionary',
    currency: 'NGN',
    tagline: 'Capital preservation with the payout schedule you choose.',
    description:
      'A diversified portfolio of money market, fixed income, equities and alternative instruments built for investors who prioritise liquidity and capital preservation.',
    idealFor: 'Investors who want predictable income and flexible payouts',
    risk: 2,
    minimum: 1_000_000,
    rate: 21.0,
    rateLabel: 'Up to 21.00% p.a.',
    tenorLabel: '30 days – 1 year',
    tenors: [
      { days: 30, label: '30 days', rate: 17.5 },
      { days: 90, label: '90 days', rate: 18.75 },
      { days: 180, label: '180 days', rate: 19.75 },
      { days: 365, label: '1 year', rate: 21.0 },
    ],
    lockInDays: 30,
    earlyCharge: 0.25,
    liquidity: 'At maturity',
    payouts: ['upfront', 'quarterly', 'semi-annual', 'maturity'],
    allocation: [
      { name: 'Money Market', value: 45 },
      { name: 'Fixed Income', value: 35 },
      { name: 'Equities', value: 10 },
      { name: 'Alternatives', value: 10 },
    ],
    features: ['Interest upfront, quarterly, semi-annually or at maturity', 'Diversified across asset classes', 'Rollover on maturity'],
    color: 'var(--p-lmi)',
  },
  {
    id: 'lmf',
    name: 'Liquidity Management Flex',
    short: 'Flex',
    category: 'Discretionary',
    currency: 'NGN',
    tagline: 'Start with ₦10,000. Withdraw in 48 hours.',
    description:
      'A flexible, short-term portfolio of money market and fixed income instruments with quarterly compounding and penalty-free withdrawals after 30 days.',
    idealFor: 'Everyday savers who need access to their money',
    risk: 1,
    minimum: 10_000,
    rate: 16.5,
    rateLabel: '16.50% p.a. · compounding quarterly',
    tenorLabel: 'Open-ended · 30-day lock-in',
    lockInDays: 30,
    earlyCharge: 0.25,
    liquidity: '48-hour withdrawals after 30 days',
    compounding: 'Quarterly',
    allocation: [
      { name: 'Money Market', value: 70 },
      { name: 'Fixed Income', value: 30 },
    ],
    features: ['₦10,000 minimum', '48-hour withdrawal processing', 'Quarterly compounding', 'Penalty-free after 30 days'],
    color: 'var(--p-lmf)',
  },
  {
    id: 'fxflex',
    name: 'FX Liquidity Management Flex',
    short: 'FX Flex',
    category: 'Discretionary',
    currency: 'USD',
    tagline: 'Dollar returns with flexibility.',
    description:
      'Invests in SEC-approved USD money market and fixed income instruments, with quarterly compounding. Protect your wealth against naira depreciation.',
    idealFor: 'Investors hedging currency risk',
    risk: 2,
    minimum: 500,
    rate: 6.5,
    rateLabel: '6.50% p.a. · compounding quarterly',
    tenorLabel: 'Open-ended · 90-day lock-in',
    lockInDays: 90,
    earlyCharge: 0.2,
    liquidity: 'After 90 days · 20% charge on early redemption',
    compounding: 'Quarterly',
    allocation: [
      { name: 'USD Money Market', value: 55 },
      { name: 'USD Fixed Income', value: 45 },
    ],
    features: ['$500 minimum', 'SEC-approved USD instruments', 'Quarterly compounding'],
    color: 'var(--p-fxflex)',
  },
  {
    id: 'mmf',
    name: 'Alpha10 Money Market Fund',
    short: 'Money Market Fund',
    category: 'Mutual Fund',
    currency: 'NGN',
    tagline: 'Steady income from ₦1,000.',
    description:
      'An open-ended mutual fund that seeks capital preservation and steady income by investing in short-term government securities and other high-quality money market instruments.',
    idealFor: 'First-time investors and emergency funds',
    risk: 1,
    minimum: 1_000,
    rate: 18.42,
    rateLabel: '18.42% yield (7-day annualised)',
    tenorLabel: 'Open-ended · 30-day minimum holding',
    lockInDays: 30,
    earlyCharge: 0.25,
    liquidity: 'Redeem anytime after 30 days · paid in 5 business days',
    unitPrice: 1,
    allocation: [
      { name: 'Short-term Govt Securities', value: 70 },
      { name: 'Other Money Market', value: 27 },
      { name: 'Cash', value: 3 },
    ],
    features: ['₦1 per unit', '₦1,000 minimum subscription', 'SEC-regulated mutual fund', 'Daily pricing'],
    trustee: 'STL Trustees Limited',
    color: 'var(--p-mmf)',
  },
  {
    id: 'dollar',
    name: 'Alpha10 Dollar Fund',
    short: 'Dollar Fund',
    category: 'Mutual Fund',
    currency: 'USD',
    tagline: 'Eurobond returns, from $100.',
    description:
      'A mutual fund that invests in Nigerian sovereign Eurobonds, corporate Eurobonds and other dollar-denominated money market instruments.',
    idealFor: 'Long-term dollar savers',
    risk: 3,
    minimum: 100,
    rate: 7.38,
    rateLabel: '7.38% yield (annualised)',
    tenorLabel: 'Open-ended · 90-day minimum holding',
    lockInDays: 90,
    earlyCharge: 0.2,
    liquidity: 'Redeem anytime after 90 days · paid in 5 business days',
    unitPrice: 1,
    allocation: [
      { name: 'Sovereign Eurobonds', value: 60 },
      { name: 'Corporate Eurobonds', value: 30 },
      { name: 'USD Money Market', value: 10 },
    ],
    features: ['$1 per unit', '$100 minimum subscription', 'Sovereign & corporate Eurobonds'],
    trustee: 'STL Trustees Limited',
    color: 'var(--p-dollar)',
  },
  {
    id: 'halal',
    name: 'Alpha10 Halal Fund',
    short: 'Halal Fund',
    category: 'Non-Interest',
    currency: 'NGN',
    tagline: 'Shariah-compliant, profit-sharing returns.',
    description:
      'A non-interest fund investing in Sukuk, Shariah-compliant equities and Murabaha placements, screened by an independent Shariah advisory board. Returns are profit-shared, never interest-based.',
    idealFor: 'Ethical and faith-conscious investors',
    risk: 2,
    minimum: 5_000,
    rate: 15.8,
    rateLabel: '15.80% expected profit rate',
    tenorLabel: 'Open-ended · 30-day minimum holding',
    lockInDays: 30,
    earlyCharge: 0,
    liquidity: 'Redeem anytime after 30 days',
    unitPrice: 1,
    allocation: [
      { name: 'FGN Sukuk', value: 50 },
      { name: 'Shariah Equities', value: 25 },
      { name: 'Murabaha Placements', value: 25 },
    ],
    features: ['Shariah Advisory Board oversight', 'Profit-sharing (no interest)', 'Purification of non-permissible income'],
    color: 'var(--p-halal)',
    proposed: true,
  },
]

export const productMap = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<ProductId, Product>

export const PAYOUT_LABEL: Record<PayoutOption, string> = {
  upfront: 'Upfront',
  quarterly: 'Quarterly',
  'semi-annual': 'Semi-annually',
  maturity: 'At maturity',
}

export const RISK_LABEL = ['', 'Very low', 'Low', 'Moderate', 'Medium-high', 'High']

/** Interest accrued on a holding up to `at` (simple for fixed products, compounding quarterly for flex/funds). */
export function accrued(h: Holding, at: Date = new Date()) {
  const days = Math.max(0, (at.getTime() - new Date(h.startDate).getTime()) / 86_400_000)
  const effDays = h.tenorDays ? Math.min(days, h.tenorDays) : days
  const p = productMap[h.productId]
  if (p.compounding || p.unitPrice) {
    return h.principal * (Math.pow(1 + h.rate / 100 / 365, effDays) - 1)
  }
  return (h.principal * h.rate * effDays) / 36500
}

export function holdingValue(h: Holding, at?: Date) {
  return h.principal + accrued(h, at)
}

export function maturityDate(h: Holding) {
  if (!h.tenorDays) return undefined
  const d = new Date(h.startDate)
  d.setDate(d.getDate() + h.tenorDays)
  return d.toISOString()
}

export function daysHeld(h: Holding) {
  return daysBetween(h.startDate, new Date())
}

export function earlyExitCharge(h: Holding, amount: number) {
  const p = productMap[h.productId]
  if (daysHeld(h) >= p.lockInDays && !h.tenorDays) return 0
  const mat = maturityDate(h)
  if (mat && new Date(mat) <= new Date()) return 0
  if (h.tenorDays && daysHeld(h) >= h.tenorDays) return 0
  const interest = accrued(h)
  const total = holdingValue(h)
  const share = total > 0 ? Math.min(1, amount / total) : 0
  return interest * share * p.earlyCharge
}

/** Projected value with a simple compounding model used by the calculator. */
export function project(amount: number, rate: number, days: number, monthly = 0) {
  const points: { day: number; value: number; contributed: number }[] = []
  const steps = Math.min(60, Math.max(6, Math.round(days / 30)))
  for (let i = 0; i <= steps; i++) {
    const d = (days * i) / steps
    const months = d / 30.4
    const growth = Math.pow(1 + rate / 100 / 365, d)
    let contrib = 0
    let fv = amount * growth
    if (monthly > 0) {
      const r = Math.pow(1 + rate / 100 / 365, 30.4) - 1
      const m = Math.floor(months)
      fv += r > 0 ? monthly * ((Math.pow(1 + r, m) - 1) / r) : monthly * m
      contrib = monthly * m
    }
    points.push({ day: Math.round(d), value: fv, contributed: amount + contrib })
  }
  return points
}

export const WHT_RATE = 0.1

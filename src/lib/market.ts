import { seeded } from './format'

export interface Instrument {
  symbol: string
  name: string
  kind: 'index' | 'fx' | 'rate' | 'commodity' | 'equity' | 'global'
  price: number
  prevClose: number
  decimals: number
  vol: number // per-tick volatility as fraction
  unit?: string
  sector?: string
  history: number[]
}

const BASE: Omit<Instrument, 'history' | 'prevClose'>[] = [
  { symbol: 'NGXASI', name: 'NGX All-Share Index', kind: 'index', price: 142_386.52, decimals: 2, vol: 0.0006 },
  { symbol: 'NGX30', name: 'NGX 30 Index', kind: 'index', price: 5_214.87, decimals: 2, vol: 0.0007 },
  { symbol: 'USDNGN', name: 'USD / NGN (NFEM)', kind: 'fx', price: 1_468.35, decimals: 2, vol: 0.0003, unit: '₦' },
  { symbol: 'GBPNGN', name: 'GBP / NGN', kind: 'fx', price: 1_972.1, decimals: 2, vol: 0.0004, unit: '₦' },
  { symbol: 'EURNGN', name: 'EUR / NGN', kind: 'fx', price: 1_715.6, decimals: 2, vol: 0.0004, unit: '₦' },
  { symbol: 'TB91', name: '91-day T-bill', kind: 'rate', price: 17.85, decimals: 2, vol: 0.0012, unit: '%' },
  { symbol: 'TB364', name: '364-day T-bill', kind: 'rate', price: 18.75, decimals: 2, vol: 0.001, unit: '%' },
  { symbol: 'FGN10Y', name: 'FGN 10-year bond', kind: 'rate', price: 17.42, decimals: 2, vol: 0.0009, unit: '%' },
  { symbol: 'BRENT', name: 'Brent crude', kind: 'commodity', price: 71.84, decimals: 2, vol: 0.0012, unit: '$' },
  { symbol: 'GOLD', name: 'Gold', kind: 'commodity', price: 2_734.2, decimals: 1, vol: 0.0006, unit: '$' },
  { symbol: 'SPX', name: 'S&P 500', kind: 'global', price: 6_412.55, decimals: 2, vol: 0.0006 },
  { symbol: 'UST10Y', name: 'US 10-year Treasury', kind: 'global', price: 4.12, decimals: 3, vol: 0.0012, unit: '%' },
  { symbol: 'DANGCEM', name: 'Dangote Cement', kind: 'equity', price: 612.4, decimals: 2, vol: 0.0016, unit: '₦', sector: 'Industrial' },
  { symbol: 'MTNN', name: 'MTN Nigeria', kind: 'equity', price: 318.9, decimals: 2, vol: 0.0018, unit: '₦', sector: 'Telecoms' },
  { symbol: 'AIRTELAFRI', name: 'Airtel Africa', kind: 'equity', price: 2_265.0, decimals: 2, vol: 0.0014, unit: '₦', sector: 'Telecoms' },
  { symbol: 'GTCO', name: 'Guaranty Trust Holding', kind: 'equity', price: 78.45, decimals: 2, vol: 0.0024, unit: '₦', sector: 'Banking' },
  { symbol: 'ZENITHBANK', name: 'Zenith Bank', kind: 'equity', price: 64.1, decimals: 2, vol: 0.0024, unit: '₦', sector: 'Banking' },
  { symbol: 'ACCESSCORP', name: 'Access Holdings', kind: 'equity', price: 27.35, decimals: 2, vol: 0.0028, unit: '₦', sector: 'Banking' },
  { symbol: 'UBA', name: 'United Bank for Africa', kind: 'equity', price: 41.2, decimals: 2, vol: 0.0026, unit: '₦', sector: 'Banking' },
  { symbol: 'FIRSTHOLDCO', name: 'First HoldCo', kind: 'equity', price: 33.85, decimals: 2, vol: 0.0028, unit: '₦', sector: 'Banking' },
  { symbol: 'SEPLAT', name: 'Seplat Energy', kind: 'equity', price: 5_640.0, decimals: 2, vol: 0.0015, unit: '₦', sector: 'Oil & Gas' },
  { symbol: 'BUAFOODS', name: 'BUA Foods', kind: 'equity', price: 448.0, decimals: 2, vol: 0.0016, unit: '₦', sector: 'Consumer' },
  { symbol: 'NESTLE', name: 'Nestlé Nigeria', kind: 'equity', price: 1_285.0, decimals: 2, vol: 0.0016, unit: '₦', sector: 'Consumer' },
  { symbol: 'TRANSCORP', name: 'Transnational Corp', kind: 'equity', price: 52.6, decimals: 2, vol: 0.003, unit: '₦', sector: 'Conglomerate' },
]

export function createInstruments(): Instrument[] {
  return BASE.map((b, i) => {
    const rnd = seeded(1000 + i * 17)
    const history: number[] = []
    let p = b.price * (1 - (rnd() - 0.45) * 0.08)
    for (let k = 0; k < 120; k++) {
      p = p * (1 + (rnd() - 0.49) * b.vol * 6)
      history.push(p)
    }
    // bridge the series to the base price
    const scale = b.price / history[history.length - 1]!
    const hist = history.map((v) => v * scale)
    return { ...b, history: hist, prevClose: hist[hist.length - 25]! }
  })
}

export type MarketMood = 'calm' | 'rally' | 'selloff'

export function tick(list: Instrument[], mood: MarketMood): Instrument[] {
  const bias = mood === 'rally' ? 0.0009 : mood === 'selloff' ? -0.0011 : 0.00004
  return list.map((ins) => {
    // rates and FX move opposite to risk sentiment
    const dir = ins.kind === 'rate' || ins.kind === 'fx' ? -0.35 : ins.kind === 'commodity' ? 0.2 : 1
    const shock = (Math.random() - 0.5) * 2 * ins.vol + bias * dir * (mood === 'calm' ? 1 : 1.8)
    const price = Math.max(0.0001, ins.price * (1 + shock))
    const history = [...ins.history.slice(-179), price]
    return { ...ins, price, history }
  })
}

export function change(ins: Instrument) {
  const abs = ins.price - ins.prevClose
  return { abs, pct: (abs / ins.prevClose) * 100 }
}

export function formatPrice(ins: Instrument, value = ins.price) {
  const n = value.toLocaleString('en-NG', { minimumFractionDigits: ins.decimals, maximumFractionDigits: ins.decimals })
  if (ins.unit === '%') return `${n}%`
  if (ins.unit) return `${ins.unit}${n}`
  return n
}

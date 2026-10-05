import { useMemo } from 'react'
import { useApp } from '../store/app'
import { useFx } from '../store/market'
import { addDays, seeded } from './format'
import { portfolioTotals } from './mock'
import { productMap } from './products'
import type { AdminClientRow, ProductId } from './types'

export interface StaffRow extends AdminClientRow {
  accountId?: string
}

/** Seeded book of clients plus the live demo accounts, with live AUM for the latter. */
export function useStaffClients(): StaffRow[] {
  const adminClients = useApp((s) => s.adminClients)
  const accounts = useApp((s) => s.accounts)
  const fx = useFx()
  return useMemo(() => {
    const live: StaffRow[] = Object.values(accounts).map((a) => {
      const p = a.profile
      return {
        id: p.id,
        accountId: p.id,
        name: p.companyName ?? `${p.firstName} ${p.lastName}`,
        type: p.type,
        tier: p.tier,
        aum: portfolioTotals(a, fx).totalNGN,
        region: p.state === 'FCT' || p.state.startsWith('Abuja') || p.state === 'Kano' || p.state === 'Kaduna' ? 'North' : p.state === 'Rivers' || p.state === 'Delta' ? 'South-South' : 'Southwest',
        rmId: p.rmId,
        kyc: p.kycStatus,
        joined: p.joined,
        lastActive: new Date().toISOString(),
        products: [...new Set(a.holdings.map((h) => h.productId))] as ProductId[],
        isDemo: true,
      }
    })
    return [...live, ...adminClients].sort((a, b) => b.aum - a.aum)
  }, [adminClients, accounts, fx])
}

export function aumByProduct(rows: StaffRow[]) {
  const accounts = useApp.getState().accounts
  const totals = new Map<ProductId, number>()
  for (const r of rows) {
    if (r.accountId) {
      for (const h of accounts[r.accountId]?.holdings ?? []) totals.set(h.productId, (totals.get(h.productId) ?? 0) + h.principal * (productMap[h.productId].currency === 'USD' ? 1468 : 1))
    } else {
      const share = r.aum / r.products.length
      for (const p of r.products) totals.set(p, (totals.get(p) ?? 0) + share)
    }
  }
  return [...totals.entries()].map(([id, value]) => ({ id, name: productMap[id].short, value, color: productMap[id].color })).sort((a, b) => b.value - a.value)
}

export function aumTrend(total: number) {
  const rnd = seeded(77)
  const months = 12
  const out: { date: string; value: number }[] = []
  for (let i = months; i >= 0; i--) {
    const growth = Math.pow(1.028, months - i)
    out.push({ date: addDays(new Date(), -i * 30.4), value: (total / Math.pow(1.028, months)) * growth * (1 + (rnd() - 0.5) * 0.03) })
  }
  out[out.length - 1]!.value = total
  return out
}

export function netFlows() {
  const rnd = seeded(13)
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - 11 + i)
    const inflow = 900e6 + rnd() * 1.6e9
    const outflow = 500e6 + rnd() * 1.1e9
    return { month: d.toLocaleDateString('en-GB', { month: 'short' }), inflow, outflow: -outflow, net: inflow - outflow }
  })
}

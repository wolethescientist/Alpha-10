import { useEffect, useMemo, useState } from 'react'
import { useAccount } from '../store/app'
import { useFx } from '../store/market'
import { portfolioTotals } from './mock'

/** Re-renders every `ms` so live-accruing values tick in place. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export function useTotals(live = true) {
  const acc = useAccount()
  const fx = useFx()
  const now = useNow(live ? 1000 : 60_000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => portfolioTotals(acc, fx), [acc, fx, now])
}

export function displayName(p: { companyName?: string; firstName: string; lastName: string }) {
  return p.companyName ?? `${p.firstName} ${p.lastName}`
}

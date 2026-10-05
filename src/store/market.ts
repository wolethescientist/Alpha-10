import { create } from 'zustand'
import { createInstruments, tick, type Instrument, type MarketMood } from '../lib/market'

interface MarketState {
  instruments: Instrument[]
  mood: MarketMood
  speed: number // ms per tick
  lastTick: number
  step: () => void
  setMood: (m: MarketMood) => void
  setSpeed: (ms: number) => void
}

export const useMarket = create<MarketState>()((set, get) => ({
  instruments: createInstruments(),
  mood: 'calm',
  speed: 2500,
  lastTick: Date.now(),
  step: () => set({ instruments: tick(get().instruments, get().mood), lastTick: Date.now() }),
  setMood: (mood) => {
    set({ mood })
    if (mood !== 'calm') setTimeout(() => get().mood === mood && set({ mood: 'calm' }), 20_000)
  },
  setSpeed: (speed) => set({ speed }),
}))

export function useInstrument(symbol: string) {
  return useMarket((s) => s.instruments.find((i) => i.symbol === symbol)!)
}

export function useFx() {
  return useMarket((s) => s.instruments.find((i) => i.symbol === 'USDNGN')!.price)
}

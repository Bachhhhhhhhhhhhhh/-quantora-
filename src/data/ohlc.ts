/**
 * Preloaded realistic daily OHLC data (~500 bars) generated via seeded GBM.
 */

import type { OHLCBar } from '../types'
import { createRng } from '../lib/utils'

interface AssetSeed {
  symbol: string
  seed: number
  startPrice: number
  annualDrift: number
  annualVol: number
  bars: number
}

const ASSET_CONFIGS: AssetSeed[] = [
  { symbol: 'AAPL', seed: 1001, startPrice: 175, annualDrift: 0.12, annualVol: 0.28, bars: 504 },
  { symbol: 'TSLA', seed: 2002, startPrice: 245, annualDrift: 0.08, annualVol: 0.55, bars: 504 },
  { symbol: 'NVDA', seed: 3003, startPrice: 128, annualDrift: 0.35, annualVol: 0.45, bars: 504 },
  { symbol: 'BTC-USD', seed: 4004, startPrice: 62000, annualDrift: 0.25, annualVol: 0.65, bars: 504 },
]

function generateOHLC(config: AssetSeed): OHLCBar[] {
  const rng = createRng(config.seed)
  const bars: OHLCBar[] = []
  const dt = 1 / 252
  const drift = (config.annualDrift - 0.5 * config.annualVol ** 2) * dt
  const vol = config.annualVol * Math.sqrt(dt)

  let close = config.startPrice
  const startDate = new Date('2023-01-03')

  for (let i = 0; i < config.bars; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    if (date.getDay() === 0) date.setDate(date.getDate() + 1)
    if (date.getDay() === 6) date.setDate(date.getDate() + 2)

    const z = boxMuller(rng)
    const open = close
    close = close * Math.exp(drift + vol * z)

    const intradayVol = vol * 0.6
    const high = Math.max(open, close) * (1 + rng() * intradayVol)
    const low = Math.min(open, close) * (1 - rng() * intradayVol)
    const volume = Math.round(5_000_000 + rng() * 45_000_000)

    bars.push({
      date: date.toISOString().split('T')[0],
      open: round(open, config.startPrice > 1000 ? 2 : 2),
      high: round(high, config.startPrice > 1000 ? 2 : 2),
      low: round(low, config.startPrice > 1000 ? 2 : 2),
      close: round(close, config.startPrice > 1000 ? 2 : 2),
      volume,
    })
  }

  return bars
}

function boxMuller(rng: () => number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

const cache = new Map<string, OHLCBar[]>()

export function getOHLCData(symbol: string): OHLCBar[] {
  if (cache.has(symbol)) return cache.get(symbol)!

  const config = ASSET_CONFIGS.find((c) => c.symbol === symbol)
  if (!config) return []

  const data = generateOHLC(config)
  cache.set(symbol, data)
  return data
}

export function getAllOHLCData(): Record<string, OHLCBar[]> {
  const result: Record<string, OHLCBar[]> = {}
  for (const config of ASSET_CONFIGS) {
    result[config.symbol] = getOHLCData(config.symbol)
  }
  return result
}

export function getDateRange(symbol: string): { start: string; end: string } {
  const data = getOHLCData(symbol)
  if (data.length === 0) return { start: '', end: '' }
  return { start: data[0].date, end: data[data.length - 1].date }
}
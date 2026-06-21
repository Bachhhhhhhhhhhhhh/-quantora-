/**
 * Multi-factor stock screener — quant score, momentum, fundamentals.
 */

import type { OHLCBar, TickerQuote, CompanyFundamentals, PerformanceMetrics } from '../../types'
import type { FeaturedTicker } from '../../data/market-featured'
import { computeQuantSignals } from './signals'
import { computeQuantScore } from './quant-score'

export interface ScreenerFilter {
  minQuantScore?: number
  minMomentum?: number
  maxPE?: number
  minROE?: number
  category?: 'all' | 'us' | 'vn' | 'crypto' | 'etf'
  sector?: string
}

export interface ScreenerResult {
  symbol: string
  name: string
  category: string
  quantScore: number
  grade: string
  changePct: number
  pe?: number
  roe?: number
  momentum: number
  sector?: string
  flag?: string
}

export function screenStocks(
  tickers: FeaturedTicker[],
  quotes: Record<string, TickerQuote>,
  fundamentals: Record<string, CompanyFundamentals>,
  performances: Record<string, PerformanceMetrics | null>,
  getOHLC: (s: string) => OHLCBar[] | null,
  filters: ScreenerFilter,
): ScreenerResult[] {
  const results: ScreenerResult[] = []

  for (const t of tickers) {
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) continue

    const fund = fundamentals[t.symbol]
    const perf = performances[t.symbol]
    const bars = getOHLC(t.symbol)
    const q = quotes[t.symbol]

    const sector = fund?.sector ?? ''
    if (filters.sector && sector && !sector.toLowerCase().includes(filters.sector.toLowerCase())) continue

    const signals = bars?.length ? computeQuantSignals(bars, fund ?? null) : null
    const score = computeQuantScore(bars ?? [], fund ?? null, perf ?? null, signals)

    const momentum = perf?.m1 ?? (bars && bars.length > 30
      ? ((bars[bars.length - 1].close - bars[bars.length - 30].close) / bars[bars.length - 30].close) * 100
      : 0)

    if (filters.minQuantScore != null && score.total < filters.minQuantScore) continue
    if (filters.minMomentum != null && momentum < filters.minMomentum) continue
    if (filters.maxPE != null && fund?.pe != null && fund.pe > filters.maxPE) continue
    if (filters.minROE != null && (fund?.roe ?? 0) < filters.minROE) continue

    results.push({
      symbol: t.symbol,
      name: t.name,
      category: t.category,
      quantScore: score.total,
      grade: score.grade,
      changePct: q?.changePct ?? 0,
      pe: fund?.pe,
      roe: fund?.roe,
      momentum,
      sector: fund?.sector,
      flag: t.flag,
    })
  }

  return results.sort((a, b) => b.quantScore - a.quantScore)
}

export const SCREENER_PRESETS: { id: string; labelKey: string; filters: ScreenerFilter }[] = [
  { id: 'quality', labelKey: 'screen_quality', filters: { minQuantScore: 70, minROE: 12, maxPE: 30 } },
  { id: 'momentum', labelKey: 'screen_momentum', filters: { minMomentum: 5, minQuantScore: 55 } },
  { id: 'value', labelKey: 'screen_value', filters: { maxPE: 15, minQuantScore: 50 } },
  { id: 'vn_banks', labelKey: 'screen_vn_banks', filters: { category: 'vn', sector: 'Financial', minQuantScore: 50 } },
]
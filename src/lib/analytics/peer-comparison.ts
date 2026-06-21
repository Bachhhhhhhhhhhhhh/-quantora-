/**
 * Sector peer comparison — rank quant score vs same-sector stocks.
 */

import type { OHLCBar, CompanyFundamentals, PerformanceMetrics } from '../../types'
import { VN_STOCKS } from '../../data/vn-stocks'
import { FEATURED_TICKERS } from '../../data/market-featured'
import { computeQuantSignals } from './signals'
import { computeQuantScore } from './quant-score'

export interface PeerEntry {
  symbol: string
  name: string
  quantScore: number
  grade: string
  rank: number
}

export interface PeerComparison {
  symbol: string
  sector: string
  peers: PeerEntry[]
  percentile: number
  rank: number
  totalPeers: number
}

export function computePeerComparison(
  symbol: string,
  fundamentals: Record<string, CompanyFundamentals>,
  performances: Record<string, PerformanceMetrics | null>,
  getOHLC: (s: string) => OHLCBar[] | null,
): PeerComparison | null {
  const fund = fundamentals[symbol]
  const vn = VN_STOCKS.find((s) => s.symbol === symbol)
  const sector = fund?.sector ?? vn?.sector
  if (!sector) return null

  const peerSymbols = new Set<string>()

  for (const s of VN_STOCKS) {
    if (s.sector === sector || s.sectorVi === sector) peerSymbols.add(s.symbol)
  }
  for (const t of FEATURED_TICKERS) {
    const f = fundamentals[t.symbol]
    if (f?.sector === sector) peerSymbols.add(t.symbol)
  }
  peerSymbols.add(symbol)

  const scored: Array<{ symbol: string; name: string; quantScore: number; grade: string }> = []

  for (const sym of peerSymbols) {
    const bars = getOHLC(sym)
    if (!bars?.length) continue
    const f = fundamentals[sym]
    const perf = performances[sym]
    const signals = computeQuantSignals(bars, f ?? null)
    const score = computeQuantScore(bars, f ?? null, perf ?? null, signals)
    const vnStock = VN_STOCKS.find((s) => s.symbol === sym)
    const featured = FEATURED_TICKERS.find((t) => t.symbol === sym)
    scored.push({
      symbol: sym,
      name: f?.name ?? vnStock?.name ?? featured?.name ?? sym,
      quantScore: score.total,
      grade: score.grade,
    })
  }

  if (scored.length < 2) return null

  scored.sort((a, b) => b.quantScore - a.quantScore)
  const rank = scored.findIndex((s) => s.symbol === symbol) + 1
  const percentile = Math.round(((scored.length - rank) / (scored.length - 1)) * 100)

  return {
    symbol,
    sector,
    peers: scored.slice(0, 8).map((p, i) => ({ ...p, rank: i + 1 })),
    percentile,
    rank,
    totalPeers: scored.length,
  }
}
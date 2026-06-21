/**
 * Portfolio optimization — risk parity, equal weight, max Sharpe lite.
 */

import type { OHLCBar } from '../../types'

export interface PortfolioAllocation {
  symbol: string
  weight: number
  vol: number
  expectedReturn: number
  contribution: number
}

export interface PortfolioSummary {
  allocations: PortfolioAllocation[]
  portfolioReturn: number
  portfolioVol: number
  sharpe: number
  diversification: number
}

function annualizedVol(bars: OHLCBar[]): number {
  if (bars.length < 30) return 0.3
  const closes = bars.map((b) => b.close)
  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) returns.push((closes[i] - closes[i - 1]) / closes[i - 1])
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(returns.length - 1, 1)
  return Math.sqrt(variance) * Math.sqrt(252)
}

function annualizedReturn(bars: OHLCBar[]): number {
  if (bars.length < 30) return 0
  const closes = bars.map((b) => b.close)
  const total = (closes[closes.length - 1] - closes[0]) / closes[0]
  const years = bars.length / 252
  return years > 0 ? Math.pow(1 + total, 1 / years) - 1 : 0
}

export function optimizeRiskParity(data: Record<string, OHLCBar[]>): PortfolioSummary | null {
  const syms = Object.keys(data).filter((s) => data[s]?.length > 30)
  if (syms.length < 2) return null

  const vols = syms.map((s) => ({ s, vol: Math.max(annualizedVol(data[s]), 0.05) }))
  const invVolSum = vols.reduce((a, v) => a + 1 / v.vol, 0)

  const allocations: PortfolioAllocation[] = vols.map(({ s, vol }) => {
    const weight = (1 / vol) / invVolSum
    const ret = annualizedReturn(data[s])
    return { symbol: s, weight, vol, expectedReturn: ret * 100, contribution: weight * ret * 100 }
  })

  const portfolioReturn = allocations.reduce((a, x) => a + x.contribution, 0)
  const portfolioVol = Math.sqrt(allocations.reduce((a, x) => a + (x.weight * x.vol) ** 2, 0)) * 100
  const sharpe = portfolioVol > 0 ? (portfolioReturn / portfolioVol) * Math.sqrt(252) / 10 : 0

  const weights = allocations.map((a) => a.weight)
  const hhi = weights.reduce((a, w) => a + w * w, 0)
  const diversification = (1 - hhi) * 100

  return { allocations, portfolioReturn, portfolioVol, sharpe, diversification }
}
/**
 * Cross-asset correlation matrix & regime detection.
 */

import type { OHLCBar } from '../../types'
import { computeReturns } from './risk'

export interface CorrelationCell {
  symbolA: string
  symbolB: string
  correlation: number
}

export function computeCorrelationMatrix(
  data: Record<string, OHLCBar[]>
): { symbols: string[]; matrix: number[][] } {
  const symbols = Object.keys(data)
  const n = symbols.length
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  const returnSeries: Record<string, number[]> = {}

  for (const sym of symbols) {
    returnSeries[sym] = computeReturns(data[sym].map((b) => b.close))
  }

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      const corr = pearson(returnSeries[symbols[i]], returnSeries[symbols[j]])
      matrix[i][j] = corr
      matrix[j][i] = corr
    }
  }

  return { symbols, matrix }
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 10) return 0
  const xs = a.slice(-n)
  const ys = b.slice(-n)
  const meanX = xs.reduce((s, v) => s + v, 0) / n
  const meanY = ys.reduce((s, v) => s + v, 0) / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const den = Math.sqrt(denX * denY)
  return den > 0 ? num / den : 0
}

export type Regime = 'low_vol' | 'normal' | 'high_vol' | 'crisis'

export interface RegimePoint {
  date: string
  regime: Regime
  volatility: number
}

export function detectVolatilityRegimes(bars: OHLCBar[], window = 20): RegimePoint[] {
  const closes = bars.map((b) => b.close)
  const returns = computeReturns(closes)
  const points: RegimePoint[] = []

  const allVols: number[] = []
  for (let i = window; i < returns.length; i++) {
    const slice = returns.slice(i - window, i)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    const vol = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length) * Math.sqrt(252)
    allVols.push(vol)
  }

  const sorted = [...allVols].sort((a, b) => a - b)
  const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? 0.15
  const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? 0.35
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0.55

  for (let i = window; i < returns.length; i++) {
    const slice = returns.slice(i - window, i)
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length
    const vol = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length) * Math.sqrt(252)

    let regime: Regime = 'normal'
    if (vol < p25) regime = 'low_vol'
    else if (vol > p95) regime = 'crisis'
    else if (vol > p75) regime = 'high_vol'

    points.push({ date: bars[i + 1].date, regime, volatility: vol * 100 })
  }

  return points
}
/**
 * Composite Quant Score — fundamentals + technicals + momentum.
 */

import type { OHLCBar, CompanyFundamentals, PerformanceMetrics } from '../../types'
import type { QuantSignalResult } from './signals'

export interface QuantScoreBreakdown {
  total: number
  fundamental: number
  technical: number
  momentum: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F'
  label: string
}

export function computeQuantScore(
  bars: OHLCBar[],
  fundamentals: CompanyFundamentals | null,
  performance: PerformanceMetrics | null,
  signals: QuantSignalResult | null,
): QuantScoreBreakdown {
  let fundamental = 50
  let technical = 50
  let momentum = 50

  if (fundamentals) {
    let f = 50
    if (fundamentals.roe != null) f += clamp((fundamentals.roe - 10) * 1.5, -15, 15)
    if (fundamentals.revenueGrowth != null) f += clamp(fundamentals.revenueGrowth * 0.8, -12, 12)
    if (fundamentals.profitMargin != null) f += clamp((fundamentals.profitMargin - 10) * 1.2, -10, 10)
    if (fundamentals.pe != null && fundamentals.pe > 0 && fundamentals.pe < 25) f += 8
    else if (fundamentals.pe != null && fundamentals.pe > 50) f -= 10
    if (fundamentals.recommendation?.includes('buy')) f += 10
    if (fundamentals.recommendation === 'sell') f -= 10
    fundamental = clamp(f, 0, 100)
  }

  if (signals) {
    technical = clamp(50 + signals.score * 0.5, 0, 100)
  }

  if (performance) {
    let m = 50
    m += clamp(performance.m1 * 2, -15, 15)
    m += clamp(performance.m6 * 0.5, -10, 10)
    m += clamp(performance.y1 * 0.3, -10, 10)
    if (performance.volatility30d > 60) m -= 8
    momentum = clamp(m, 0, 100)
  } else if (bars.length > 30) {
    const closes = bars.map((b) => b.close)
    const ret = ((closes[closes.length - 1] - closes[closes.length - 30]) / closes[closes.length - 30]) * 100
    momentum = clamp(50 + ret * 2, 0, 100)
  }

  const total = Math.round(fundamental * 0.4 + technical * 0.35 + momentum * 0.25)
  const grade = scoreToGrade(total)

  return {
    total,
    fundamental: Math.round(fundamental),
    technical: Math.round(technical),
    momentum: Math.round(momentum),
    grade,
    label: gradeLabel(grade),
  }
}

function scoreToGrade(s: number): QuantScoreBreakdown['grade'] {
  if (s >= 85) return 'A+'
  if (s >= 75) return 'A'
  if (s >= 65) return 'B+'
  if (s >= 55) return 'B'
  if (s >= 45) return 'C'
  if (s >= 35) return 'D'
  return 'F'
}

function gradeLabel(g: QuantScoreBreakdown['grade']): string {
  const map: Record<QuantScoreBreakdown['grade'], string> = {
    'A+': 'Exceptional',
    A: 'Strong',
    'B+': 'Above Average',
    B: 'Average',
    C: 'Below Average',
    D: 'Weak',
    F: 'Poor',
  }
  return map[g]
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
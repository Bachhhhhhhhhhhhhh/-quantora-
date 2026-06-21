/**
 * Institutional risk analytics — VaR, CVaR, Beta, rolling metrics, Hurst exponent.
 */

import type { OHLCBar } from '../../types'

export interface RiskMetrics {
  dailyVol: number
  annualVol: number
  var95: number
  var99: number
  cvar95: number
  cvar99: number
  beta: number
  sharpe: number
  sortino: number
  calmar: number
  maxDrawdown: number
  skewness: number
  kurtosis: number
  hurst: number
}

export function computeReturns(closes: number[]): number[] {
  const r: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) r.push((closes[i] - closes[i - 1]) / closes[i - 1])
  }
  return r
}

export function computeRiskMetrics(
  bars: OHLCBar[],
  benchmarkBars?: OHLCBar[]
): RiskMetrics {
  const closes = bars.map((b) => b.close)
  const returns = computeReturns(closes)
  if (returns.length < 20) return emptyRisk()

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1)
  const std = Math.sqrt(variance)
  const annualVol = std * Math.sqrt(252)
  const dailyVol = std

  const sorted = [...returns].sort((a, b) => a - b)
  const var95 = percentile(sorted, 0.05)
  const var99 = percentile(sorted, 0.01)
  const cvar95 = sorted.slice(0, Math.ceil(sorted.length * 0.05)).reduce((a, b) => a + b, 0) / Math.ceil(sorted.length * 0.05) || 0
  const cvar99 = sorted.slice(0, Math.ceil(sorted.length * 0.01)).reduce((a, b) => a + b, 0) / Math.ceil(sorted.length * 0.01) || 0

  const downside = returns.filter((r) => r < 0)
  const downStd = downside.length > 1
    ? Math.sqrt(downside.reduce((a, b) => a + b ** 2, 0) / downside.length)
    : std
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0
  const sortino = downStd > 0 ? (mean / downStd) * Math.sqrt(252) : 0

  const maxDd = computeMaxDrawdown(closes)
  const totalReturn = closes.length > 1 ? (closes[closes.length - 1] - closes[0]) / closes[0] : 0
  const years = bars.length / 252
  const cagr = years > 0 ? Math.pow(1 + totalReturn, 1 / years) - 1 : 0
  const calmar = maxDd > 0 ? cagr / maxDd : 0

  const skewness = computeSkewness(returns, mean, std)
  const kurtosis = computeKurtosis(returns, mean, std)
  const hurst = computeHurst(closes)
  const beta = benchmarkBars ? computeBeta(returns, computeReturns(benchmarkBars.map((b) => b.close))) : 1

  return {
    dailyVol,
    annualVol,
    var95: var95 * 100,
    var99: var99 * 100,
    cvar95: cvar95 * 100,
    cvar99: cvar99 * 100,
    beta,
    sharpe,
    sortino,
    calmar,
    maxDrawdown: maxDd * 100,
    skewness,
    kurtosis,
    hurst,
  }
}

export interface RollingPoint {
  date: string
  sharpe: number
  vol: number
  return: number
}

export interface DrawdownPoint {
  date: string
  drawdown: number
  price: number
}

export function computeDrawdownCurve(bars: OHLCBar[]): DrawdownPoint[] {
  const points: DrawdownPoint[] = []
  let peak = bars[0]?.close ?? 0
  for (const b of bars) {
    if (b.close > peak) peak = b.close
    const dd = peak > 0 ? ((peak - b.close) / peak) * 100 : 0
    points.push({ date: b.date, drawdown: -dd, price: b.close })
  }
  return points
}

export function computeRollingMetrics(bars: OHLCBar[], window = 60): RollingPoint[] {
  const closes = bars.map((b) => b.close)
  const points: RollingPoint[] = []

  for (let i = window; i < closes.length; i++) {
    const slice = closes.slice(i - window, i + 1)
    const returns = computeReturns(slice)
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length)
    points.push({
      date: bars[i].date,
      sharpe: std > 0 ? (mean / std) * Math.sqrt(252) : 0,
      vol: std * Math.sqrt(252) * 100,
      return: ((closes[i] - closes[i - window]) / closes[i - window]) * 100,
    })
  }
  return points
}

function computeBeta(assetReturns: number[], benchReturns: number[]): number {
  const n = Math.min(assetReturns.length, benchReturns.length)
  if (n < 10) return 1
  const a = assetReturns.slice(-n)
  const b = benchReturns.slice(-n)
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let cov = 0, varB = 0
  for (let i = 0; i < n; i++) {
    cov += (a[i] - meanA) * (b[i] - meanB)
    varB += (b[i] - meanB) ** 2
  }
  return varB > 0 ? cov / varB : 1
}

function computeMaxDrawdown(closes: number[]): number {
  let peak = closes[0], maxDd = 0
  for (const c of closes) {
    if (c > peak) peak = c
    const dd = (peak - c) / peak
    if (dd > maxDd) maxDd = dd
  }
  return maxDd
}

function computeSkewness(data: number[], mean: number, std: number): number {
  if (std === 0) return 0
  const n = data.length
  return data.reduce((a, b) => a + ((b - mean) / std) ** 3, 0) / n
}

function computeKurtosis(data: number[], mean: number, std: number): number {
  if (std === 0) return 0
  const n = data.length
  return data.reduce((a, b) => a + ((b - mean) / std) ** 4, 0) / n - 3
}

/** Simplified R/S Hurst exponent estimator */
function computeHurst(closes: number[]): number {
  if (closes.length < 40) return 0.5
  const returns = computeReturns(closes)
  const n = returns.length
  const mean = returns.reduce((a, b) => a + b, 0) / n
  const cumDev: number[] = []
  let sum = 0
  for (const r of returns) {
    sum += r - mean
    cumDev.push(sum)
  }
  const range = Math.max(...cumDev) - Math.min(...cumDev)
  const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / n)
  if (std === 0) return 0.5
  const rs = range / std
  return Math.min(0.95, Math.max(0.05, Math.log(rs) / Math.log(n)))
}

function percentile(sorted: number[], p: number): number {
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function emptyRisk(): RiskMetrics {
  return {
    dailyVol: 0, annualVol: 0, var95: 0, var99: 0, cvar95: 0, cvar99: 0,
    beta: 1, sharpe: 0, sortino: 0, calmar: 0, maxDrawdown: 0,
    skewness: 0, kurtosis: 0, hurst: 0.5,
  }
}
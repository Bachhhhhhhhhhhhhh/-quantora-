/**
 * Calendar-accurate multi-period performance returns from OHLC history.
 */

import type { OHLCBar } from '../../types'

export interface PerformanceMetrics {
  d1: number
  w1: number
  m1: number
  m3: number
  m6: number
  ytd: number
  y1: number
  y3: number
  y5: number
  max: number
  avgVolume: number
  volatility30d: number
}

function findPriceOnOrBefore(bars: OHLCBar[], target: Date): number | null {
  const t = target.getTime()
  let best: number | null = null
  for (const b of bars) {
    const d = new Date(b.date).getTime()
    if (d <= t) best = b.close
    else break
  }
  return best
}

function calendarReturn(bars: OHLCBar[], daysAgo: number): number {
  if (bars.length < 2) return 0
  const last = bars[bars.length - 1].close
  const target = new Date(bars[bars.length - 1].date)
  target.setDate(target.getDate() - daysAgo)
  const prev = findPriceOnOrBefore(bars, target)
  return prev && prev > 0 ? ((last - prev) / prev) * 100 : 0
}

function calendarReturnYears(bars: OHLCBar[], years: number): number {
  const target = new Date(bars[bars.length - 1].date)
  target.setFullYear(target.getFullYear() - years)
  const last = bars[bars.length - 1].close
  const prev = findPriceOnOrBefore(bars, target)
  return prev && prev > 0 ? ((last - prev) / prev) * 100 : 0
}

export function computePerformance(bars: OHLCBar[]): PerformanceMetrics | null {
  if (bars.length < 30) return null

  const closes = bars.map((b) => b.close)
  const volumes = bars.map((b) => b.volume)
  const last = closes[closes.length - 1]
  const now = new Date(bars[bars.length - 1].date)

  const ytdTarget = new Date(now.getFullYear(), 0, 1)
  const ytdPrice = findPriceOnOrBefore(bars, ytdTarget)
  const ytd = ytdPrice && ytdPrice > 0 ? ((last - ytdPrice) / ytdPrice) * 100 : calendarReturn(bars, 90)

  const returns30: number[] = []
  for (let i = closes.length - 30; i < closes.length - 1; i++) {
    if (closes[i] > 0) returns30.push((closes[i + 1] - closes[i]) / closes[i])
  }
  const mean = returns30.reduce((a, b) => a + b, 0) / returns30.length
  const variance = returns30.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(returns30.length - 1, 1)
  const vol = Math.sqrt(variance) * Math.sqrt(252) * 100

  const first = closes[0]
  return {
    d1: calendarReturn(bars, 1),
    w1: calendarReturn(bars, 7),
    m1: calendarReturn(bars, 30),
    m3: calendarReturn(bars, 90),
    m6: calendarReturn(bars, 180),
    ytd,
    y1: calendarReturnYears(bars, 1),
    y3: calendarReturnYears(bars, 3),
    y5: calendarReturnYears(bars, 5),
    max: first > 0 ? ((last - first) / first) * 100 : 0,
    avgVolume: volumes.slice(-30).reduce((a, b) => a + b, 0) / 30,
    volatility30d: vol,
  }
}

/** Calibrate Monte Carlo drift/vol from historical OHLC (annualized). */
export function calibrateMonteCarlo(bars: OHLCBar[]): { drift: number; volatility: number } | null {
  if (bars.length < 60) return null
  const closes = bars.map((b) => b.close)
  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) returns.push(Math.log(closes[i] / closes[i - 1]))
  }
  if (returns.length < 30) return null
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1)
  const dailyVol = Math.sqrt(variance)
  return {
    drift: mean * 252,
    volatility: dailyVol * Math.sqrt(252),
  }
}
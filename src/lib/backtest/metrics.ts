import type { Trade, BacktestMetrics, EquityPoint } from '../../types'

/**
 * Performance metrics computed from equity curve and trade log.
 */

export function computeMetrics(
  equityCurve: EquityPoint[],
  trades: Trade[],
  initialCapital: number,
  riskFreeRate = 0.02
): BacktestMetrics {
  if (equityCurve.length === 0) {
    return emptyMetrics(initialCapital)
  }

  const finalEquity = equityCurve[equityCurve.length - 1].equity
  const finalBuyHold = equityCurve[equityCurve.length - 1].buyHold

  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100
  const buyHoldReturn = ((finalBuyHold - initialCapital) / initialCapital) * 100

  const startDate = new Date(equityCurve[0].date)
  const endDate = new Date(equityCurve[equityCurve.length - 1].date)
  const years = Math.max(
    (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    1 / 365
  )

  const cagr =
    (Math.pow(finalEquity / initialCapital, 1 / years) - 1) * 100

  const dailyReturns: number[] = []
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity
    const curr = equityCurve[i].equity
    if (prev > 0) dailyReturns.push((curr - prev) / prev)
  }

  const sharpeRatio = computeSharpe(dailyReturns, riskFreeRate)
  const maxDrawdown = computeMaxDrawdown(equityCurve)

  const winningTrades = trades.filter((t) => t.pnl > 0)
  const losingTrades = trades.filter((t) => t.pnl <= 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

  const grossProfit = winningTrades.reduce((s, t) => s + t.pnl, 0)
  const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0))
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

  return {
    totalReturn,
    cagr,
    sharpeRatio,
    maxDrawdown,
    winRate,
    profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    numTrades: trades.length,
    finalEquity,
    buyHoldReturn,
  }
}

function computeSharpe(dailyReturns: number[], riskFreeRate: number): number {
  if (dailyReturns.length < 2) return 0

  const dailyRf = riskFreeRate / 252
  const excessReturns = dailyReturns.map((r) => r - dailyRf)
  const mean =
    excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length
  const variance =
    excessReturns.reduce((a, b) => a + (b - mean) ** 2, 0) /
    (excessReturns.length - 1)
  const std = Math.sqrt(variance)

  if (std === 0) return 0
  return (mean / std) * Math.sqrt(252)
}

function computeMaxDrawdown(equityCurve: EquityPoint[]): number {
  let peak = equityCurve[0].equity
  let maxDd = 0

  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity
    const dd = ((peak - point.equity) / peak) * 100
    if (dd > maxDd) maxDd = dd
  }

  return maxDd
}

function emptyMetrics(initialCapital: number): BacktestMetrics {
  return {
    totalReturn: 0,
    cagr: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    profitFactor: 0,
    numTrades: 0,
    finalEquity: initialCapital,
    buyHoldReturn: 0,
  }
}
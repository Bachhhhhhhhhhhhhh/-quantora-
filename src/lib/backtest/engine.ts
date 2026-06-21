/**
 * Professional backtest engine — pure client-side JavaScript.
 * Supports SMA Crossover, RSI Mean Reversion, and Bollinger + RSI strategies.
 */

import type {
  OHLCBar,
  Trade,
  BacktestConfig,
  BacktestResult,
  EquityPoint,
  DrawdownPoint,
  StrategyType,
  StrategyParams,
} from '../../types'
import { sma, rsi, bollingerBands, macd, atr, zscore, keltnerChannels, adx } from './indicators'
import { computeMetrics } from './metrics'

type Signal = 1 | -1 | 0 // 1 = buy/long, -1 = sell/exit, 0 = hold

export function runBacktest(
  bars: OHLCBar[],
  config: BacktestConfig
): BacktestResult {
  const filtered = bars.filter(
    (b) => b.date >= config.startDate && b.date <= config.endDate
  )

  if (filtered.length < 30) {
    return emptyResult(config.initialCapital)
  }

  const signals = generateSignals(filtered, config.strategy, config.params)

  const { trades, equityCurve } = simulateTrades(
    filtered,
    signals,
    config.initialCapital,
    config.commission / 100
  )

  const drawdownCurve = computeDrawdownCurve(equityCurve)
  const metrics = computeMetrics(equityCurve, trades, config.initialCapital)

  return { trades, equityCurve, drawdownCurve, metrics }
}

function generateSignals(
  bars: OHLCBar[],
  strategy: StrategyType,
  params: StrategyParams
): Signal[] {
  const closes = bars.map((b) => b.close)
  const n = bars.length
  const signals: Signal[] = new Array(n).fill(0)

  switch (strategy) {
    case 'sma_crossover':
      return smaCrossoverSignals(closes, params.smaFast ?? 10, params.smaSlow ?? 50)

    case 'rsi_mean_reversion':
      return rsiMeanReversionSignals(
        closes,
        params.rsiPeriod ?? 14,
        params.rsiOversold ?? 30,
        params.rsiOverbought ?? 70
      )

    case 'bollinger_rsi':
      return bollingerRsiSignals(closes, params.bbPeriod ?? 20, params.bbStdDev ?? 2, params.rsiPeriod ?? 14, params.bbRsiThreshold ?? 40)

    case 'macd_crossover':
      return macdCrossoverSignals(closes, params.macdFast ?? 12, params.macdSlow ?? 26, params.macdSignal ?? 9)

    case 'atr_breakout': {
      const highs = bars.map((b) => b.high)
      const lows = bars.map((b) => b.low)
      return atrBreakoutSignals(highs, lows, closes, params.atrPeriod ?? 14, params.atrMultiplier ?? 2)
    }

    case 'zscore_mean_reversion':
      return zscoreSignals(closes, params.zscorePeriod ?? 20, params.zscoreEntry ?? 2)

    case 'dual_momentum':
      return dualMomentumSignals(closes, params.momentumPeriod ?? 126)

    case 'keltner_breakout': {
      const highs = bars.map((b) => b.high)
      const lows = bars.map((b) => b.low)
      return keltnerBreakoutSignals(highs, lows, closes, params.keltnerPeriod ?? 20, params.keltnerMult ?? 2)
    }

    case 'adx_trend': {
      const highs = bars.map((b) => b.high)
      const lows = bars.map((b) => b.low)
      return adxTrendSignals(highs, lows, closes, params.adxPeriod ?? 14, params.adxThreshold ?? 25)
    }

    default:
      return signals
  }
}

function macdCrossoverSignals(closes: number[], fast: number, slow: number, signal: number): Signal[] {
  const { macd: m, signal: s } = macd(closes, fast, slow, signal)
  const signals: Signal[] = new Array(closes.length).fill(0)
  for (let i = 1; i < closes.length; i++) {
    if (isNaN(m[i]) || isNaN(s[i])) continue
    if (m[i - 1] <= s[i - 1] && m[i] > s[i]) signals[i] = 1
    else if (m[i - 1] >= s[i - 1] && m[i] < s[i]) signals[i] = -1
  }
  return signals
}

function atrBreakoutSignals(highs: number[], lows: number[], closes: number[], period: number, mult: number): Signal[] {
  const atrVals = atr(highs, lows, closes, period)
  const signals: Signal[] = new Array(closes.length).fill(0)
  for (let i = period; i < closes.length; i++) {
    const upper = closes[i - 1] + mult * atrVals[i - 1]
    const lower = closes[i - 1] - mult * atrVals[i - 1]
    if (closes[i] > upper) signals[i] = 1
    else if (closes[i] < lower) signals[i] = -1
  }
  return signals
}

function zscoreSignals(closes: number[], period: number, entry: number): Signal[] {
  const zs = zscore(closes, period)
  const signals: Signal[] = new Array(closes.length).fill(0)
  for (let i = 1; i < closes.length; i++) {
    if (isNaN(zs[i])) continue
    if (zs[i] < -entry && zs[i - 1] >= -entry) signals[i] = 1
    else if (zs[i] > entry && zs[i - 1] <= entry) signals[i] = -1
  }
  return signals
}

function dualMomentumSignals(closes: number[], period: number): Signal[] {
  const signals: Signal[] = new Array(closes.length).fill(0)
  for (let i = period; i < closes.length; i++) {
    const ret = (closes[i] - closes[i - period]) / closes[i - period]
    if (ret > 0 && closes[i] > closes[i - 1]) signals[i] = 1
    else if (ret < 0) signals[i] = -1
  }
  return signals
}

function keltnerBreakoutSignals(highs: number[], lows: number[], closes: number[], period: number, mult: number): Signal[] {
  const kc = keltnerChannels(highs, lows, closes, period, mult)
  const signals: Signal[] = new Array(closes.length).fill(0)
  for (let i = 1; i < closes.length; i++) {
    if (isNaN(kc.upper[i])) continue
    if (closes[i] > kc.upper[i]) signals[i] = 1
    else if (closes[i] < kc.lower[i]) signals[i] = -1
  }
  return signals
}

function adxTrendSignals(highs: number[], lows: number[], closes: number[], period: number, threshold: number): Signal[] {
  const { adx: adxLine, plusDI, minusDI } = adx(highs, lows, closes, period)
  const signals: Signal[] = new Array(closes.length).fill(0)
  for (let i = 1; i < closes.length; i++) {
    if (isNaN(adxLine[i]) || adxLine[i] < threshold) continue
    if (plusDI[i] > minusDI[i] && plusDI[i - 1] <= minusDI[i - 1]) signals[i] = 1
    else if (minusDI[i] > plusDI[i] && minusDI[i - 1] <= plusDI[i - 1]) signals[i] = -1
  }
  return signals
}

/** Buy when fast SMA crosses above slow SMA; sell on cross below */
function smaCrossoverSignals(
  closes: number[],
  fastPeriod: number,
  slowPeriod: number
): Signal[] {
  const fast = sma(closes, fastPeriod)
  const slow = sma(closes, slowPeriod)
  const signals: Signal[] = new Array(closes.length).fill(0)

  for (let i = 1; i < closes.length; i++) {
    if (isNaN(fast[i]) || isNaN(slow[i]) || isNaN(fast[i - 1]) || isNaN(slow[i - 1]))
      continue

    if (fast[i - 1] <= slow[i - 1] && fast[i] > slow[i]) signals[i] = 1
    else if (fast[i - 1] >= slow[i - 1] && fast[i] < slow[i]) signals[i] = -1
  }

  return signals
}

/** Buy when RSI < oversold; sell when RSI > overbought */
function rsiMeanReversionSignals(
  closes: number[],
  period: number,
  oversold: number,
  overbought: number
): Signal[] {
  const rsiValues = rsi(closes, period)
  const signals: Signal[] = new Array(closes.length).fill(0)

  for (let i = 1; i < closes.length; i++) {
    if (isNaN(rsiValues[i])) continue
    if (rsiValues[i] < oversold && rsiValues[i - 1] >= oversold) signals[i] = 1
    else if (rsiValues[i] > overbought && rsiValues[i - 1] <= overbought) signals[i] = -1
  }

  return signals
}

/** Buy at lower band when RSI below threshold; sell at upper band when RSI above (100 - threshold) */
function bollingerRsiSignals(
  closes: number[],
  bbPeriod: number,
  bbStdDev: number,
  rsiPeriod: number,
  rsiThreshold: number
): Signal[] {
  const bb = bollingerBands(closes, bbPeriod, bbStdDev)
  const rsiValues = rsi(closes, rsiPeriod)
  const signals: Signal[] = new Array(closes.length).fill(0)
  const upperRsi = 100 - rsiThreshold

  for (let i = 1; i < closes.length; i++) {
    if (isNaN(bb.lower[i]) || isNaN(rsiValues[i])) continue

    if (closes[i] <= bb.lower[i] && rsiValues[i] < rsiThreshold) signals[i] = 1
    else if (closes[i] >= bb.upper[i] && rsiValues[i] > upperRsi) signals[i] = -1
  }

  return signals
}

function simulateTrades(
  bars: OHLCBar[],
  signals: Signal[],
  initialCapital: number,
  commissionRate: number
): { trades: Trade[]; equityCurve: EquityPoint[] } {
  const trades: Trade[] = []
  let cash = initialCapital
  let shares = 0
  let entryPrice = 0
  let entryDate = ''
  let tradeId = 0

  const firstClose = bars[0].close
  const buyHoldShares = initialCapital / firstClose

  const equityCurve: EquityPoint[] = bars.map((bar) => ({
    date: bar.date,
    equity: cash + shares * bar.close,
    buyHold: buyHoldShares * bar.close,
  }))

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i]
    const price = bar.close

    if (signals[i] === 1 && shares === 0) {
      const commission = cash * commissionRate
      const investable = cash - commission
      shares = investable / price
      entryPrice = price
      entryDate = bar.date
      cash = 0
    } else if (signals[i] === -1 && shares > 0) {
      const gross = shares * price
      const commission = gross * commissionRate
      const net = gross - commission
      const costBasis = shares * entryPrice
      const pnl = net - costBasis
      const pnlPct = (pnl / costBasis) * 100

      trades.push({
        id: ++tradeId,
        entryDate,
        exitDate: bar.date,
        side: 'long',
        entryPrice,
        exitPrice: price,
        pnl,
        pnlPct,
        returnPct: pnlPct,
      })

      cash = net
      shares = 0
    }

    equityCurve[i] = {
      date: bar.date,
      equity: cash + shares * price,
      buyHold: buyHoldShares * price,
    }
  }

  // Close open position at end
  if (shares > 0) {
    const lastBar = bars[bars.length - 1]
    const gross = shares * lastBar.close
    const commission = gross * commissionRate
    const net = gross - commission
    const costBasis = shares * entryPrice
    const pnl = net - costBasis

    trades.push({
      id: ++tradeId,
      entryDate,
      exitDate: lastBar.date,
      side: 'long',
      entryPrice,
      exitPrice: lastBar.close,
      pnl,
      pnlPct: (pnl / costBasis) * 100,
      returnPct: (pnl / costBasis) * 100,
    })

    equityCurve[equityCurve.length - 1].equity = net
  }

  return { trades, equityCurve }
}

function computeDrawdownCurve(equityCurve: EquityPoint[]): DrawdownPoint[] {
  let peak = equityCurve[0]?.equity ?? 0
  return equityCurve.map((point) => {
    if (point.equity > peak) peak = point.equity
    const dd = peak > 0 ? ((peak - point.equity) / peak) * 100 : 0
    return { date: point.date, drawdown: -dd }
  })
}

function emptyResult(initialCapital: number): BacktestResult {
  return {
    trades: [],
    equityCurve: [],
    drawdownCurve: [],
    metrics: {
      totalReturn: 0,
      cagr: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      numTrades: 0,
      finalEquity: initialCapital,
      buyHoldReturn: 0,
    },
  }
}

export function getPresetParams(
  strategy: StrategyType,
  preset: 'conservative' | 'balanced' | 'aggressive'
): StrategyParams {
  const presets: Record<StrategyType, Record<string, StrategyParams>> = {
    sma_crossover: {
      conservative: { smaFast: 20, smaSlow: 100 },
      balanced: { smaFast: 10, smaSlow: 50 },
      aggressive: { smaFast: 5, smaSlow: 20 },
    },
    rsi_mean_reversion: {
      conservative: { rsiPeriod: 21, rsiOversold: 25, rsiOverbought: 75 },
      balanced: { rsiPeriod: 14, rsiOversold: 30, rsiOverbought: 70 },
      aggressive: { rsiPeriod: 7, rsiOversold: 35, rsiOverbought: 65 },
    },
    bollinger_rsi: {
      conservative: { bbPeriod: 30, bbStdDev: 2.5, rsiPeriod: 21, bbRsiThreshold: 35 },
      balanced: { bbPeriod: 20, bbStdDev: 2, rsiPeriod: 14, bbRsiThreshold: 40 },
      aggressive: { bbPeriod: 14, bbStdDev: 1.5, rsiPeriod: 7, bbRsiThreshold: 45 },
    },
    macd_crossover: {
      conservative: { macdFast: 12, macdSlow: 26, macdSignal: 9 },
      balanced: { macdFast: 8, macdSlow: 21, macdSignal: 5 },
      aggressive: { macdFast: 5, macdSlow: 13, macdSignal: 3 },
    },
    atr_breakout: {
      conservative: { atrPeriod: 20, atrMultiplier: 2.5 },
      balanced: { atrPeriod: 14, atrMultiplier: 2 },
      aggressive: { atrPeriod: 7, atrMultiplier: 1.5 },
    },
    zscore_mean_reversion: {
      conservative: { zscorePeriod: 30, zscoreEntry: 2.5 },
      balanced: { zscorePeriod: 20, zscoreEntry: 2 },
      aggressive: { zscorePeriod: 10, zscoreEntry: 1.5 },
    },
    dual_momentum: {
      conservative: { momentumPeriod: 252 },
      balanced: { momentumPeriod: 126 },
      aggressive: { momentumPeriod: 63 },
    },
    keltner_breakout: {
      conservative: { keltnerPeriod: 30, keltnerMult: 2.5 },
      balanced: { keltnerPeriod: 20, keltnerMult: 2 },
      aggressive: { keltnerPeriod: 14, keltnerMult: 1.5 },
    },
    adx_trend: {
      conservative: { adxPeriod: 20, adxThreshold: 30 },
      balanced: { adxPeriod: 14, adxThreshold: 25 },
      aggressive: { adxPeriod: 10, adxThreshold: 20 },
    },
  }

  return presets[strategy]?.[preset] ?? presets.sma_crossover.balanced
}
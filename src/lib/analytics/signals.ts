/**
 * Institutional signal synthesis — multi-indicator consensus engine.
 */

import type { OHLCBar, CompanyFundamentals } from '../../types'
import { sma, rsi, macd, bollingerBands } from '../backtest/indicators'

export type SignalDirection = 'bullish' | 'bearish' | 'neutral'
export type OverallSignal = 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'

export interface SignalItem {
  name: string
  value: string
  direction: SignalDirection
  weight: number
}

export interface QuantSignalResult {
  overall: OverallSignal
  score: number
  confidence: number
  signals: SignalItem[]
}

export function computeQuantSignals(
  bars: OHLCBar[],
  fundamentals?: CompanyFundamentals | null,
): QuantSignalResult | null {
  if (bars.length < 50) return null

  const closes = bars.map((b) => b.close)
  const last = closes[closes.length - 1]
  const signals: SignalItem[] = []
  let weightedScore = 0
  let totalWeight = 0

  const add = (name: string, value: string, direction: SignalDirection, weight: number) => {
    signals.push({ name, value, direction, weight })
    const pts = direction === 'bullish' ? weight : direction === 'bearish' ? -weight : 0
    weightedScore += pts
    totalWeight += weight
  }

  const rsiVals = rsi(closes, 14)
  const rsiLast = rsiVals[rsiVals.length - 1]
  if (rsiLast != null) {
    if (rsiLast < 30) add('RSI(14)', rsiLast.toFixed(1), 'bullish', 15)
    else if (rsiLast > 70) add('RSI(14)', rsiLast.toFixed(1), 'bearish', 15)
    else add('RSI(14)', rsiLast.toFixed(1), 'neutral', 10)
  }

  const { macd: m, signal: sig, histogram: hist } = macd(closes)
  const mLast = m[m.length - 1]
  const sLast = sig[sig.length - 1]
  const hLast = hist[hist.length - 1]
  if (mLast != null && sLast != null) {
    if (mLast > sLast && (hLast ?? 0) > 0) add('MACD', 'Bullish cross', 'bullish', 18)
    else if (mLast < sLast && (hLast ?? 0) < 0) add('MACD', 'Bearish cross', 'bearish', 18)
    else add('MACD', 'No cross', 'neutral', 12)
  }

  const s20 = sma(closes, 20)
  const s50 = sma(closes, 50)
  const s20Last = s20[s20.length - 1]
  const s50Last = s50[s50.length - 1]
  if (s20Last != null && s50Last != null) {
    if (last > s20Last && s20Last > s50Last) add('SMA Trend', 'Golden alignment', 'bullish', 20)
    else if (last < s20Last && s20Last < s50Last) add('SMA Trend', 'Death alignment', 'bearish', 20)
    else if (last > s50Last) add('SMA Trend', 'Above SMA50', 'bullish', 12)
    else add('SMA Trend', 'Below SMA50', 'bearish', 12)
  }

  const bb = bollingerBands(closes, 20, 2)
  const bbLower = bb.lower[bb.lower.length - 1]
  const bbUpper = bb.upper[bb.upper.length - 1]
  if (bbLower != null && bbUpper != null) {
    if (last <= bbLower * 1.01) add('Bollinger', 'Lower band touch', 'bullish', 12)
    else if (last >= bbUpper * 0.99) add('Bollinger', 'Upper band touch', 'bearish', 12)
    else add('Bollinger', 'Mid-range', 'neutral', 8)
  }

  const ret20 = closes.length > 21
    ? ((last - closes[closes.length - 21]) / closes[closes.length - 21]) * 100
    : 0
  if (ret20 > 5) add('Momentum 20D', `${ret20.toFixed(1)}%`, 'bullish', 10)
  else if (ret20 < -5) add('Momentum 20D', `${ret20.toFixed(1)}%`, 'bearish', 10)
  else add('Momentum 20D', `${ret20.toFixed(1)}%`, 'neutral', 8)

  if (fundamentals?.recommendation) {
    const rec = fundamentals.recommendation
    if (rec === 'strong_buy' || rec === 'buy') add('Analyst', rec.replace('_', ' '), 'bullish', 15)
    else if (rec === 'sell' || rec === 'strong_sell') add('Analyst', rec.replace('_', ' '), 'bearish', 15)
    else add('Analyst', 'Hold', 'neutral', 10)
  }

  if (fundamentals?.targetPrice && last > 0) {
    const upside = ((fundamentals.targetPrice - last) / last) * 100
    if (upside > 15) add('Target Upside', `${upside.toFixed(0)}%`, 'bullish', 12)
    else if (upside < -10) add('Target Upside', `${upside.toFixed(0)}%`, 'bearish', 12)
    else add('Target Upside', `${upside.toFixed(0)}%`, 'neutral', 8)
  }

  if (fundamentals?.roe != null) {
    if (fundamentals.roe > 20) add('ROE', `${fundamentals.roe.toFixed(1)}%`, 'bullish', 8)
    else if (fundamentals.roe < 5) add('ROE', `${fundamentals.roe.toFixed(1)}%`, 'bearish', 8)
    else add('ROE', `${fundamentals.roe.toFixed(1)}%`, 'neutral', 5)
  }

  const normalized = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0
  const score = Math.round(clamp(normalized, -100, 100))
  const confidence = Math.min(100, Math.round((signals.length / 8) * 100))

  let overall: OverallSignal = 'neutral'
  if (score >= 40) overall = 'strong_buy'
  else if (score >= 15) overall = 'buy'
  else if (score <= -40) overall = 'strong_sell'
  else if (score <= -15) overall = 'sell'

  return { overall, score, confidence, signals }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
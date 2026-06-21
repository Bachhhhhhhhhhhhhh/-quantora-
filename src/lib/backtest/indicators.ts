/**
 * Technical indicator calculations — implemented from scratch.
 * All functions return arrays aligned with input length (NaN for insufficient data).
 */

/** Simple Moving Average */
export function sma(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(NaN)
  if (period <= 0 || data.length < period) return result

  let sum = 0
  for (let i = 0; i < data.length; i++) {
    sum += data[i]
    if (i >= period) sum -= data[i - period]
    if (i >= period - 1) result[i] = sum / period
  }
  return result
}

/**
 * Relative Strength Index (Wilder's smoothing method)
 * RSI = 100 - (100 / (1 + RS)), RS = avgGain / avgLoss
 */
export function rsi(closes: number[], period = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  if (closes.length < period + 1) return result

  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    const idx = i + 1
    result[idx] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }

  return result
}

export interface BollingerBands {
  upper: number[]
  middle: number[]
  lower: number[]
}

/** Bollinger Bands: middle = SMA, upper/lower = middle ± stdDev * σ */
export function bollingerBands(
  closes: number[],
  period = 20,
  stdDev = 2
): BollingerBands {
  const middle = sma(closes, period)
  const upper: number[] = new Array(closes.length).fill(NaN)
  const lower: number[] = new Array(closes.length).fill(NaN)

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1)
    const mean = middle[i]
    const variance =
      slice.reduce((acc, v) => acc + (v - mean) ** 2, 0) / period
    const std = Math.sqrt(variance)
    upper[i] = mean + stdDev * std
    lower[i] = mean - stdDev * std
  }

  return { upper, middle, lower }
}

/** Exponential Moving Average */
export function ema(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(NaN)
  if (period <= 0 || data.length < period) return result
  const k = 2 / (period + 1)
  let prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  result[period - 1] = prev
  for (let i = period; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k)
    result[i] = prev
  }
  return result
}

export interface MACDResult {
  macd: number[]
  signal: number[]
  histogram: number[]
}

export function macd(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  const fast = ema(closes, fastPeriod)
  const slow = ema(closes, slowPeriod)
  const macdLine: number[] = closes.map((_, i) =>
    isNaN(fast[i]) || isNaN(slow[i]) ? NaN : fast[i] - slow[i]
  )
  const validMacd = macdLine.map((v) => (isNaN(v) ? 0 : v))
  const signal = ema(validMacd, signalPeriod)
  const histogram = macdLine.map((v, i) =>
    isNaN(v) || isNaN(signal[i]) ? NaN : v - signal[i]
  )
  return { macd: macdLine, signal, histogram }
}

/** Average True Range (Wilder smoothing) */
export function atr(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): number[] {
  const tr: number[] = [highs[0] - lows[0]]
  for (let i = 1; i < closes.length; i++) {
    tr.push(
      Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      )
    )
  }
  const result: number[] = new Array(closes.length).fill(NaN)
  if (tr.length < period) return result
  let prev = tr.slice(0, period).reduce((a, b) => a + b, 0) / period
  result[period - 1] = prev
  for (let i = period; i < tr.length; i++) {
    prev = (prev * (period - 1) + tr[i]) / period
    result[i] = prev
  }
  return result
}

/** Z-Score of price relative to rolling mean/std */
export function zscore(closes: number[], period = 20): number[] {
  const result: number[] = new Array(closes.length).fill(NaN)
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period)
    result[i] = std > 0 ? (closes[i] - mean) / std : 0
  }
  return result
}

export interface KeltnerChannels {
  upper: number[]
  middle: number[]
  lower: number[]
}

export function keltnerChannels(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 20,
  multiplier = 2
): KeltnerChannels {
  const middle = ema(closes, period)
  const atrVals = atr(highs, lows, closes, period)
  const upper: number[] = new Array(closes.length).fill(NaN)
  const lower: number[] = new Array(closes.length).fill(NaN)
  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(middle[i]) && !isNaN(atrVals[i])) {
      upper[i] = middle[i] + multiplier * atrVals[i]
      lower[i] = middle[i] - multiplier * atrVals[i]
    }
  }
  return { upper, middle, lower }
}

/** ADX — Average Directional Index (trend strength) */
export function adx(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): { adx: number[]; plusDI: number[]; minusDI: number[] } {
  const len = closes.length
  const plusDM: number[] = [0]
  const minusDM: number[] = [0]
  const tr: number[] = [highs[0] - lows[0]]

  for (let i = 1; i < len; i++) {
    const upMove = highs[i] - highs[i - 1]
    const downMove = lows[i - 1] - lows[i]
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0)
    tr.push(
      Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]))
    )
  }

  const smooth = (arr: number[]) => {
    const out: number[] = new Array(len).fill(NaN)
    if (arr.length < period) return out
    let prev = arr.slice(0, period).reduce((a, b) => a + b, 0)
    out[period - 1] = prev
    for (let i = period; i < arr.length; i++) {
      prev = prev - prev / period + arr[i]
      out[i] = prev
    }
    return out
  }

  const trSmooth = smooth(tr)
  const plusDMSmooth = smooth(plusDM)
  const minusDMSmooth = smooth(minusDM)
  const plusDI: number[] = new Array(len).fill(NaN)
  const minusDI: number[] = new Array(len).fill(NaN)
  const dx: number[] = new Array(len).fill(NaN)

  for (let i = period - 1; i < len; i++) {
    if (trSmooth[i] > 0) {
      plusDI[i] = (100 * plusDMSmooth[i]) / trSmooth[i]
      minusDI[i] = (100 * minusDMSmooth[i]) / trSmooth[i]
      const sum = plusDI[i] + minusDI[i]
      dx[i] = sum > 0 ? (100 * Math.abs(plusDI[i] - minusDI[i])) / sum : 0
    }
  }

  const adxLine: number[] = new Array(len).fill(NaN)
  const validDx = dx.filter((v) => !isNaN(v))
  if (validDx.length >= period) {
    let prev = validDx.slice(0, period).reduce((a, b) => a + b, 0) / period
    let dxIdx = period - 1
    for (let i = 0; i < len; i++) {
      if (!isNaN(dx[i])) {
        dxIdx++
        if (dxIdx > period) prev = (prev * (period - 1) + dx[i]) / period
        else if (dxIdx === period) prev = validDx.slice(0, period).reduce((a, b) => a + b, 0) / period
        if (dxIdx >= period) adxLine[i] = prev
      }
    }
  }

  return { adx: adxLine, plusDI, minusDI }
}
/**
 * Multi-model fair value estimation — analyst + earnings growth + relative P/E.
 */

import type { CompanyFundamentals, TickerQuote } from '../../types'

export interface ValuationResult {
  fairValue: number
  upside: number
  models: { name: string; value: number; weight: number }[]
  verdict: 'undervalued' | 'fair' | 'overvalued'
  confidence: number
}

export function computeValuation(
  quote: TickerQuote,
  fundamentals: CompanyFundamentals | null,
): ValuationResult | null {
  if (!quote?.price || quote.price <= 0) return null

  const price = quote.price
  const models: { name: string; value: number; weight: number }[] = []

  if (fundamentals?.targetPrice && fundamentals.targetPrice > 0) {
    models.push({ name: 'Analyst Target', value: fundamentals.targetPrice, weight: 0.4 })
  }

  if (fundamentals?.forwardEps && fundamentals.forwardEps > 0 && fundamentals.pe && fundamentals.pe > 0) {
    const sectorPe = fundamentals.pe
    models.push({ name: 'Forward P/E', value: fundamentals.forwardEps * sectorPe, weight: 0.25 })
  }

  if (fundamentals?.eps && fundamentals.eps > 0 && fundamentals.revenueGrowth != null) {
    const growth = Math.min(Math.max(fundamentals.revenueGrowth / 100, 0), 0.3)
    const terminalPe = 15 + growth * 30
    const dcfProxy = fundamentals.eps * (1 + growth) * terminalPe
    models.push({ name: 'Growth DCF', value: dcfProxy, weight: 0.2 })
  }

  if (fundamentals?.pb && fundamentals.pb > 0 && quote.fiftyTwoWeekHigh && quote.fiftyTwoWeekLow) {
    const mid = (quote.fiftyTwoWeekHigh + quote.fiftyTwoWeekLow) / 2
    models.push({ name: '52W Midpoint', value: mid, weight: 0.15 })
  }

  if (models.length === 0) return null

  const totalWeight = models.reduce((s, m) => s + m.weight, 0)
  const fairValue = models.reduce((s, m) => s + m.value * (m.weight / totalWeight), 0)
  const upside = ((fairValue - price) / price) * 100

  let verdict: ValuationResult['verdict'] = 'fair'
  if (upside > 12) verdict = 'undervalued'
  else if (upside < -12) verdict = 'overvalued'

  return {
    fairValue,
    upside,
    models,
    verdict,
    confidence: Math.min(95, models.length * 25 + (fundamentals?.targetPrice ? 20 : 0)),
  }
}
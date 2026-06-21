/**
 * Advanced Monte Carlo — GBM, Jump Diffusion (Merton), Simplified Heston.
 */

import type { MonteCarloParams, MonteCarloResult } from '../types'
import { boxMullerRandom } from './utils'

export function runMonteCarloSimulation(params: MonteCarloParams): MonteCarloResult {
  const model = params.model ?? 'gbm'
  if (model === 'jump_diffusion') return runJumpDiffusion(params)
  if (model === 'heston_simplified') return runHestonSimplified(params)
  return runGBM(params)
}

function runGBM(params: MonteCarloParams): MonteCarloResult {
  const { initialPrice, drift, volatility, timeHorizon, numPaths, stepsPerYear = 252 } = params
  const totalSteps = Math.max(Math.round(timeHorizon * stepsPerYear), 1)
  const dt = timeHorizon / totalSteps
  const driftTerm = (drift - 0.5 * volatility * volatility) * dt
  const volTerm = volatility * Math.sqrt(dt)
  const paths: number[][] = []
  const timeSteps = Array.from({ length: totalSteps + 1 }, (_, i) => i / stepsPerYear)

  for (let p = 0; p < numPaths; p++) {
    const path = [initialPrice]
    let price = initialPrice
    for (let t = 0; t < totalSteps; t++) {
      const z = boxMullerRandom(Math.random)
      price = price * Math.exp(driftTerm + volTerm * z)
      path.push(price)
    }
    paths.push(path)
  }
  return finalize(paths, timeSteps, initialPrice)
}

/** Merton Jump Diffusion: dS/S = (μ - λκ)dt + σdW + (e^J - 1)dN */
function runJumpDiffusion(params: MonteCarloParams): MonteCarloResult {
  const {
    initialPrice, drift, volatility, timeHorizon, numPaths, stepsPerYear = 252,
    jumpIntensity = 0.5, jumpMean = -0.05, jumpVol = 0.1,
  } = params
  const totalSteps = Math.max(Math.round(timeHorizon * stepsPerYear), 1)
  const dt = timeHorizon / totalSteps
  const lambda = jumpIntensity
  const kappa = Math.exp(jumpMean + 0.5 * jumpVol ** 2) - 1
  const driftTerm = (drift - lambda * kappa - 0.5 * volatility ** 2) * dt
  const volTerm = volatility * Math.sqrt(dt)
  const paths: number[][] = []
  const timeSteps = Array.from({ length: totalSteps + 1 }, (_, i) => i / stepsPerYear)

  for (let p = 0; p < numPaths; p++) {
    const path = [initialPrice]
    let price = initialPrice
    for (let t = 0; t < totalSteps; t++) {
      const z = boxMullerRandom(Math.random)
      let jump = 0
      if (Math.random() < lambda * dt) {
        jump = jumpMean + jumpVol * boxMullerRandom(Math.random)
      }
      price = price * Math.exp(driftTerm + volTerm * z + jump)
      path.push(price)
    }
    paths.push(path)
  }
  return finalize(paths, timeSteps, initialPrice)
}

/** Simplified Heston: stochastic volatility CIR-like */
function runHestonSimplified(params: MonteCarloParams): MonteCarloResult {
  const { initialPrice, drift, volatility, timeHorizon, numPaths, stepsPerYear = 252 } = params
  const totalSteps = Math.max(Math.round(timeHorizon * stepsPerYear), 1)
  const dt = timeHorizon / totalSteps
  const kappa = 2, theta = volatility ** 2, xi = 0.5, rho = -0.7
  const paths: number[][] = []
  const timeSteps = Array.from({ length: totalSteps + 1 }, (_, i) => i / stepsPerYear)

  for (let p = 0; p < numPaths; p++) {
    const path = [initialPrice]
    let price = initialPrice
    let var_ = volatility ** 2
    for (let t = 0; t < totalSteps; t++) {
      const z1 = boxMullerRandom(Math.random)
      const z2 = rho * z1 + Math.sqrt(1 - rho ** 2) * boxMullerRandom(Math.random)
      var_ = Math.max(0.0001, var_ + kappa * (theta - var_) * dt + xi * Math.sqrt(var_ * dt) * z2)
      price = price * Math.exp((drift - 0.5 * var_) * dt + Math.sqrt(var_ * dt) * z1)
      path.push(price)
    }
    paths.push(path)
  }
  return finalize(paths, timeSteps, initialPrice)
}

function finalize(paths: number[][], timeSteps: number[], initialPrice: number): MonteCarloResult {
  const percentiles = computePercentiles(paths, timeSteps.length)
  const finalPrices = paths.map((p) => p[p.length - 1])
  const kpis = computeKPIs(finalPrices, initialPrice)
  return { paths, percentiles, timeSteps, kpis }
}

function computePercentiles(paths: number[][], length: number) {
  const p5: number[] = [], p50: number[] = [], p95: number[] = []
  for (let t = 0; t < length; t++) {
    const values = paths.map((p) => p[t]).sort((a, b) => a - b)
    p5.push(percentile(values, 0.05))
    p50.push(percentile(values, 0.5))
    p95.push(percentile(values, 0.95))
  }
  return { p5, p50, p95 }
}

function percentile(sorted: number[], p: number): number {
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function computeKPIs(finalPrices: number[], initialPrice: number) {
  const returns = finalPrices.map((p) => (p - initialPrice) / initialPrice)
  const sorted = [...finalPrices].sort((a, b) => a - b)
  const retSorted = [...returns].sort((a, b) => a - b)
  const tail = retSorted.slice(0, Math.ceil(retSorted.length * 0.05))
  return {
    expectedValue: finalPrices.reduce((a, b) => a + b, 0) / finalPrices.length,
    probProfit: (returns.filter((r) => r > 0).length / returns.length) * 100,
    worstCase: sorted[0],
    bestCase: sorted[sorted.length - 1],
    medianReturn: ((percentile(sorted, 0.5) - initialPrice) / initialPrice) * 100,
    var95: percentile(retSorted, 0.05) * 100,
    cvar95: (tail.reduce((a, b) => a + b, 0) / tail.length) * 100,
  }
}

export function monteCarloToCSV(result: MonteCarloResult, sampleCount = 10): string {
  const headers = ['Time', 'P5', 'P50', 'P95', ...Array.from({ length: Math.min(sampleCount, result.paths.length) }, (_, i) => `Path${i + 1}`)]
  const rows: string[] = [headers.join(',')]
  for (let t = 0; t < result.timeSteps.length; t++) {
    rows.push([
      result.timeSteps[t].toFixed(4),
      result.percentiles.p5[t].toFixed(4),
      result.percentiles.p50[t].toFixed(4),
      result.percentiles.p95[t].toFixed(4),
      ...result.paths.slice(0, sampleCount).map((p) => p[t].toFixed(4)),
    ].join(','))
  }
  return rows.join('\n')
}
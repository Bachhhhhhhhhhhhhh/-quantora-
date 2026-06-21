/** Seeded PRNG (Mulberry32) for reproducible synthetic data */
export function createRng(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function formatCurrency(value: number, decimals = 2, currency = 'USD'): string {
  if (currency === 'VND') {
    return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} ₫`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPrice(symbol: string, price: number): string {
  if (symbol.endsWith('.VN')) return formatCurrency(price, 0, 'VND')
  if (price >= 10000) return formatCurrency(price, 0)
  return formatCurrency(price)
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatMarketCap(value: number, symbol?: string): string {
  const isVND = symbol?.endsWith('.VN')
  const suffix = isVND ? ' ₫' : ''
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T${suffix}`
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B${suffix}`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M${suffix}`
  return formatNumber(value, 0) + suffix
}

export function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return value.toLocaleString()
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (el) {
    const offset = 80
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

export function boxMullerRandom(rng: () => number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}
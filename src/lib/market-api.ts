/**
 * Universal market data engine v3
 * - Instant local search (VN + Global catalogs)
 * - Yahoo Finance live data (any ticker worldwide)
 * - Rich fundamentals via quoteSummary
 * - Vietnamese stocks: SYMBOL.VN format
 */

import type { OHLCBar, SearchResult, TickerQuote, CompanyFundamentals } from '../types'
import { searchVNStocks, resolveVNSymbol, getVNStock } from '../data/vn-stocks'
import { searchGlobalCatalog } from '../data/global-catalog'
import { createRng } from './utils'

const YAHOO = 'https://query1.finance.yahoo.com'
const YAHOO2 = 'https://query2.finance.yahoo.com'

const PROXIES = [
  (url: string) => url,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
]

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }

const ohlcCache = new Map<string, OHLCBar[]>()
const ohlcSource = new Map<string, 'yahoo' | 'synthetic'>()
const quoteCache = new Map<string, TickerQuote>()
const fundamentalsCache = new Map<string, CompanyFundamentals>()

async function fetchJson<T>(url: string): Promise<T | null> {
  const attempts = PROXIES.map(async (proxy) => {
    try {
      const res = await fetch(proxy(url), { headers: HEADERS, signal: AbortSignal.timeout(12_000) })
      if (res.ok) return (await res.json()) as T
    } catch { /* try next */ }
    return null
  })
  const results = await Promise.all(attempts)
  return results.find((r) => r != null) ?? null
}

export function getOHLCDataSource(symbol: string, range = '2y'): 'yahoo' | 'synthetic' | 'unknown' {
  const resolved = resolveVNSymbol(symbol) ?? symbol
  return ohlcSource.get(`${resolved}:${range}`) ?? ohlcSource.get(resolved) ?? 'unknown'
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) return []

  const q = query.trim()
  const seen = new Set<string>()
  const results: SearchResult[] = []

  const add = (r: SearchResult) => {
    if (!seen.has(r.symbol)) {
      seen.add(r.symbol)
      results.push(r)
    }
  }

  // 1. Instant local VN search
  for (const vn of searchVNStocks(q)) {
    add({
      symbol: vn.symbol,
      name: vn.nameVi,
      nameEn: vn.name,
      type: 'equity',
      exchange: vn.exchange,
      country: 'VN',
      sector: vn.sector,
      sectorVi: vn.sectorVi,
      flag: '🇻🇳',
    })
  }

  // 2. Instant global catalog
  for (const g of searchGlobalCatalog(q)) {
    add({
      symbol: g.symbol,
      name: g.name,
      type: g.sector === 'ETF' ? 'etf' : g.sector === 'Crypto' ? 'crypto' : 'equity',
      exchange: g.exchange,
      country: g.country,
      sector: g.sector,
      flag: g.country === 'US' ? '🇺🇸' : g.country === 'CN' ? '🇨🇳' : '🌐',
    })
  }

  // 3. Resolve bare VN code → SYMBOL.VN
  const vnResolved = resolveVNSymbol(q)
  if (vnResolved) {
    const vn = getVNStock(vnResolved)
    if (vn) add({
      symbol: vn.symbol, name: vn.nameVi, nameEn: vn.name,
      type: 'equity', exchange: vn.exchange, country: 'VN',
      sector: vn.sector, sectorVi: vn.sectorVi, flag: '🇻🇳',
    })
  }

  // 4. Yahoo Finance live search (parallel)
  const yahooUrl = `${YAHOO}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=20&newsCount=0&listsCount=0`
  const yahooData = await fetchJson<YahooSearchResponse>(yahooUrl)

  if (yahooData?.quotes) {
    for (const item of yahooData.quotes) {
      if (!item.symbol || item.quoteType === 'OPTION') continue
      const isVN = item.symbol.endsWith('.VN') || item.exchange === 'VSE'
      add({
        symbol: item.symbol,
        name: item.longname || item.shortname || item.symbol,
        type: mapQuoteType(item.quoteType),
        exchange: item.exchange || '—',
        country: isVN ? 'VN' : item.exchDisp?.includes('NASDAQ') || item.exchDisp?.includes('NYSE') ? 'US' : '🌐',
        sector: item.sector,
        price: item.regularMarketPrice,
        changePct: item.regularMarketChangePercent,
        flag: isVN ? '🇻🇳' : item.exchange === 'NMS' || item.exchange === 'NYQ' ? '🇺🇸' : '🌐',
      })
    }
  }

  return results.slice(0, 25)
}

function mapQuoteType(qt?: string): SearchResult['type'] {
  if (!qt) return 'equity'
  const t = qt.toUpperCase()
  if (t === 'CRYPTOCURRENCY') return 'crypto'
  if (t === 'ETF') return 'etf'
  if (t === 'INDEX') return 'index'
  if (t === 'CURRENCY' || t === 'FUTURE') return 'forex'
  return 'equity'
}

// ─── OHLC ─────────────────────────────────────────────────────────────────────

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: ChartMeta
      timestamp?: number[]
      indicators?: {
        quote?: Array<{
          open?: (number | null)[]
          high?: (number | null)[]
          low?: (number | null)[]
          close?: (number | null)[]
          volume?: (number | null)[]
        }>
        adjclose?: Array<{ adjclose?: (number | null)[] }>
      }
    }>
  }
}

interface ChartMeta {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  previousClose?: number
  currency?: string
  exchangeName?: string
  fullExchangeName?: string
  instrumentType?: string
  regularMarketVolume?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  marketCap?: number
  trailingPE?: number
  bookValue?: number
}

interface YahooSearchResponse {
  quotes?: Array<{
    symbol: string
    shortname?: string
    longname?: string
    quoteType?: string
    exchange?: string
    exchDisp?: string
    sector?: string
    industry?: string
    regularMarketPrice?: number
    regularMarketChangePercent?: number
  }>
}

export async function fetchOHLC(symbol: string, range = '2y'): Promise<OHLCBar[]> {
  const resolved = resolveVNSymbol(symbol) ?? symbol
  const key = `${resolved}:${range}`
  if (ohlcCache.has(key)) return ohlcCache.get(key)!

  const url = `${YAHOO}/v8/finance/chart/${encodeURIComponent(resolved)}?interval=1d&range=${range}&includeAdjustedClose=true`
  const data = await fetchJson<YahooChartResponse>(url)
  const result = data?.chart?.result?.[0]

  if (result?.timestamp && result.indicators?.quote?.[0]) {
    const q = result.indicators.quote[0]
    const adj = result.indicators.adjclose?.[0]?.adjclose
    const bars: OHLCBar[] = []
    for (let i = 0; i < result.timestamp.length; i++) {
      const close = adj?.[i] ?? q.close?.[i]
      if (close == null || isNaN(close)) continue
      bars.push({
        date: new Date(result.timestamp[i] * 1000).toISOString().split('T')[0],
        open: q.open?.[i] ?? close,
        high: q.high?.[i] ?? close,
        low: q.low?.[i] ?? close,
        close,
        volume: q.volume?.[i] ?? 0,
      })
    }
    if (bars.length > 20) {
      ohlcCache.set(key, bars)
      ohlcSource.set(key, 'yahoo')
      return bars
    }
  }

  const synthetic = generateSyntheticOHLC(resolved, 504)
  ohlcCache.set(key, synthetic)
  ohlcSource.set(key, 'synthetic')
  return synthetic
}

// ─── QUOTE ────────────────────────────────────────────────────────────────────

export async function fetchQuote(symbol: string): Promise<TickerQuote> {
  const resolved = resolveVNSymbol(symbol) ?? symbol

  if (quoteCache.has(resolved)) {
    const cached = quoteCache.get(resolved)!
    if (Date.now() - cached.fetchedAt < 20_000) return cached
  }

  const url = `${YAHOO}/v8/finance/chart/${encodeURIComponent(resolved)}?interval=1d&range=5d`
  const data = await fetchJson<YahooChartResponse>(url)
  const result = data?.chart?.result?.[0]
  const meta = result?.meta

  if (meta?.regularMarketPrice) {
    const prev = meta.previousClose ?? meta.regularMarketPrice
    const vn = getVNStock(resolved)
    const quote: TickerQuote = {
      symbol: meta.symbol || resolved,
      name: meta.longName || meta.shortName || vn?.nameVi || resolved,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - prev,
      changePct: ((meta.regularMarketPrice - prev) / prev) * 100,
      currency: meta.currency || (resolved.endsWith('.VN') ? 'VND' : 'USD'),
      exchange: meta.fullExchangeName || meta.exchangeName || '—',
      fetchedAt: Date.now(),
      volume: meta.regularMarketVolume,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      marketCap: meta.marketCap,
      pe: meta.trailingPE,
      country: resolved.endsWith('.VN') ? 'VN' : undefined,
      sector: vn?.sector,
      dataSource: 'yahoo',
    }
    quoteCache.set(resolved, quote)
    return quote
  }

  const bars = await fetchOHLC(resolved, '1mo')
  const last = bars[bars.length - 1]
  const prev = bars[bars.length - 2]
  const quote: TickerQuote = {
    symbol: resolved,
    name: getVNStock(resolved)?.nameVi ?? resolved,
    price: last?.close ?? 100,
    change: (last?.close ?? 100) - (prev?.close ?? 100),
    changePct: prev ? ((last.close - prev.close) / prev.close) * 100 : 0,
    currency: resolved.endsWith('.VN') ? 'VND' : 'USD',
    exchange: '—',
    fetchedAt: Date.now(),
    dataSource: ohlcSource.get(`${resolved}:1mo`) === 'yahoo' ? 'yahoo' : 'synthetic',
  }
  quoteCache.set(resolved, quote)
  return quote
}

// ─── FUNDAMENTALS ─────────────────────────────────────────────────────────────

interface QuoteSummaryResponse {
  quoteSummary?: {
    result?: Array<{
      price?: {
        regularMarketPrice?: { raw: number }
        regularMarketChangePercent?: { raw: number }
        marketCap?: { raw: number; fmt: string }
        regularMarketVolume?: { raw: number; fmt: string }
        regularMarketDayHigh?: { raw: number }
        regularMarketDayLow?: { raw: number }
        fiftyTwoWeekHigh?: { raw: number }
        fiftyTwoWeekLow?: { raw: number }
      }
      summaryProfile?: {
        longName?: string
        sector?: string
        industry?: string
        country?: string
        website?: string
        longBusinessSummary?: string
        fullTimeEmployees?: number
      }
      financialData?: {
        currentPrice?: { raw: number }
        targetMeanPrice?: { raw: number }
        recommendationKey?: string
        totalRevenue?: { raw: number; fmt: string }
        revenueGrowth?: { raw: number }
        grossMargins?: { raw: number }
        operatingMargins?: { raw: number }
        profitMargins?: { raw: number }
        ebitda?: { raw: number; fmt: string }
        totalCash?: { raw: number; fmt: string }
        totalDebt?: { raw: number; fmt: string }
        returnOnEquity?: { raw: number }
        returnOnAssets?: { raw: number }
        freeCashflow?: { raw: number; fmt: string }
      }
      defaultKeyStatistics?: {
        trailingPE?: { raw: number }
        forwardPE?: { raw: number }
        pegRatio?: { raw: number }
        priceToBook?: { raw: number }
        enterpriseValue?: { raw: number; fmt: string }
        beta?: { raw: number }
        trailingEps?: { raw: number }
        forwardEps?: { raw: number }
        dividendYield?: { raw: number }
        payoutRatio?: { raw: number }
        fiftyTwoWeekChange?: { raw: number }
        sharesOutstanding?: { raw: number; fmt: string }
      }
    }>
  }
}

export async function fetchFundamentals(symbol: string): Promise<CompanyFundamentals | null> {
  const resolved = resolveVNSymbol(symbol) ?? symbol
  if (fundamentalsCache.has(resolved)) return fundamentalsCache.get(resolved)!

  const modules = 'price,summaryProfile,financialData,defaultKeyStatistics'
  const url = `${YAHOO2}/v10/finance/quoteSummary/${encodeURIComponent(resolved)}?modules=${modules}`
  const data = await fetchJson<QuoteSummaryResponse>(url)
  const r = data?.quoteSummary?.result?.[0]
  if (!r) return null

  const vn = getVNStock(resolved)
  const profile = r.summaryProfile
  const fin = r.financialData
  const stats = r.defaultKeyStatistics
  const price = r.price

  const fundamentals: CompanyFundamentals = {
    symbol: resolved,
    name: profile?.longName || vn?.nameVi || resolved,
    sector: profile?.sector || vn?.sector,
    industry: profile?.industry,
    country: profile?.country || (resolved.endsWith('.VN') ? 'Vietnam' : undefined),
    website: profile?.website,
    description: profile?.longBusinessSummary?.slice(0, 500),
    employees: profile?.fullTimeEmployees,
    marketCap: price?.marketCap?.raw,
    marketCapFmt: price?.marketCap?.fmt,
    pe: stats?.trailingPE?.raw,
    forwardPe: stats?.forwardPE?.raw,
    peg: stats?.pegRatio?.raw,
    pb: stats?.priceToBook?.raw,
    eps: stats?.trailingEps?.raw,
    forwardEps: stats?.forwardEps?.raw,
    dividendYield: stats?.dividendYield?.raw ? stats.dividendYield.raw * 100 : undefined,
    beta: stats?.beta?.raw,
    fiftyTwoWeekHigh: price?.fiftyTwoWeekHigh?.raw,
    fiftyTwoWeekLow: price?.fiftyTwoWeekLow?.raw,
    fiftyTwoWeekChange: stats?.fiftyTwoWeekChange?.raw ? stats.fiftyTwoWeekChange.raw * 100 : undefined,
    volume: price?.regularMarketVolume?.raw,
    revenue: fin?.totalRevenue?.raw,
    revenueFmt: fin?.totalRevenue?.fmt,
    revenueGrowth: fin?.revenueGrowth?.raw ? fin.revenueGrowth.raw * 100 : undefined,
    grossMargin: fin?.grossMargins?.raw ? fin.grossMargins.raw * 100 : undefined,
    operatingMargin: fin?.operatingMargins?.raw ? fin.operatingMargins.raw * 100 : undefined,
    profitMargin: fin?.profitMargins?.raw ? fin.profitMargins.raw * 100 : undefined,
    roe: fin?.returnOnEquity?.raw ? fin.returnOnEquity.raw * 100 : undefined,
    roa: fin?.returnOnAssets?.raw ? fin.returnOnAssets.raw * 100 : undefined,
    totalCash: fin?.totalCash?.fmt,
    totalDebt: fin?.totalDebt?.fmt,
    freeCashflow: fin?.freeCashflow?.fmt,
    targetPrice: fin?.targetMeanPrice?.raw,
    recommendation: fin?.recommendationKey,
    sharesOutstanding: stats?.sharesOutstanding?.fmt,
    enterpriseValue: stats?.enterpriseValue?.fmt,
    fetchedAt: Date.now(),
  }

  fundamentalsCache.set(resolved, fundamentals)
  return fundamentals
}

// ─── SYNTHETIC FALLBACK ───────────────────────────────────────────────────────

function generateSyntheticOHLC(symbol: string, bars: number): OHLCBar[] {
  let seed = 0
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i) * (i + 1)
  const rng = createRng(seed)
  const isVN = symbol.endsWith('.VN')
  const startPrice = isVN ? 10000 + (seed % 200000) : 20 + (seed % 500)
  const annualDrift = 0.05 + rng() * 0.2
  const annualVol = 0.15 + rng() * 0.35
  const dt = 1 / 252
  const drift = (annualDrift - 0.5 * annualVol ** 2) * dt
  const vol = annualVol * Math.sqrt(dt)
  const result: OHLCBar[] = []
  let close = startPrice
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 2)
  for (let i = 0; i < bars; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const open = close
    close = close * Math.exp(drift + vol * boxMuller(rng))
    result.push({
      date: date.toISOString().split('T')[0],
      open: round(open, isVN),
      high: round(Math.max(open, close) * (1 + rng() * vol * 0.5), isVN),
      low: round(Math.min(open, close) * (1 - rng() * vol * 0.5), isVN),
      close: round(close, isVN),
      volume: Math.round(1e6 + rng() * 50e6),
    })
  }
  return result
}

function boxMuller(rng: () => number): number {
  let u = 0, v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function round(n: number, isVN: boolean): number {
  return isVN ? Math.round(n) : Math.round(n * 100) / 100
}

export function clearMarketCache(): void {
  ohlcCache.clear()
  ohlcSource.clear()
  quoteCache.clear()
  fundamentalsCache.clear()
}

export function getCachedOHLC(symbol: string): OHLCBar[] | null {
  const resolved = resolveVNSymbol(symbol) ?? symbol
  for (const [key, data] of ohlcCache) {
    if (key.startsWith(resolved + ':')) return data
  }
  return null
}

export function resolveSymbol(input: string | null | undefined): string {
  if (input == null || typeof input !== 'string') return 'NVDA'
  const trimmed = input.trim()
  if (!trimmed) return 'NVDA'
  return resolveVNSymbol(trimmed) ?? trimmed.toUpperCase()
}
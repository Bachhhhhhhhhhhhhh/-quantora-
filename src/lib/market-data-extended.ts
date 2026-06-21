/**
 * Extended market data — earnings, analysts, financials, holders, news, macro.
 */

import type {
  TickerDeepData, EarningsRecord, AnalystRating, FinancialRow,
  NewsItem, HolderBreakdown, InsiderTrade,
} from '../types'
import { resolveVNSymbol } from '../data/vn-stocks'

const YAHOO = 'https://query1.finance.yahoo.com'
const YAHOO2 = 'https://query2.finance.yahoo.com'
const PROXIES = [
  (url: string) => url,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
]
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }

const deepCache = new Map<string, TickerDeepData>()

async function fetchJson<T>(url: string): Promise<T | null> {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url), { headers: HEADERS })
      if (res.ok) return (await res.json()) as T
    } catch { /* next */ }
  }
  return null
}

type RawVal = { raw?: number; fmt?: string }

interface DeepResponse {
  quoteSummary?: {
    result?: Array<{
      earningsHistory?: { history?: Array<{ epsActual?: RawVal; epsEstimate?: RawVal; quarter?: RawVal; period?: string }> }
      earningsTrend?: { trend?: Array<{ earningsEstimate?: { avg?: RawVal }; revenueEstimate?: { avg?: RawVal }; period?: string }> }
      recommendationTrend?: { trend?: Array<{ strongBuy?: number; buy?: number; hold?: number; sell?: number; strongSell?: number; period?: string }> }
      majorHoldersBreakdown?: { holders?: Array<{ name?: string; reportDate?: RawVal; percentHeld?: RawVal }> }
      insiderTransactions?: { transactions?: Array<{ filerName?: string; transactionText?: string; startDate?: RawVal; value?: RawVal; shares?: RawVal }> }
      calendarEvents?: { earnings?: { earningsDate?: Array<RawVal>; earningsAverage?: RawVal; revenueAverage?: RawVal } }
      incomeStatementHistory?: { incomeStatementHistory?: Array<Record<string, RawVal>> }
      balanceSheetHistory?: { balanceSheetStatements?: Array<Record<string, RawVal>> }
      cashflowStatementHistory?: { cashflowStatements?: Array<Record<string, RawVal>> }
      defaultKeyStatistics?: Record<string, RawVal>
      financialData?: Record<string, RawVal>
      summaryDetail?: Record<string, RawVal>
    }>
  }
}

export async function fetchDeepData(symbol: string): Promise<TickerDeepData | null> {
  const resolved = resolveVNSymbol(symbol) ?? symbol
  if (deepCache.has(resolved)) {
    const c = deepCache.get(resolved)!
    if (Date.now() - c.fetchedAt < 300_000) return c
  }

  const modules = [
    'earningsHistory', 'earningsTrend', 'recommendationTrend',
    'majorHoldersBreakdown', 'insiderTransactions', 'calendarEvents',
    'incomeStatementHistory', 'balanceSheetHistory', 'cashflowStatementHistory',
    'defaultKeyStatistics', 'financialData', 'summaryDetail',
  ].join(',')

  const url = `${YAHOO2}/v10/finance/quoteSummary/${encodeURIComponent(resolved)}?modules=${modules}`
  const data = await fetchJson<DeepResponse>(url)
  const r = data?.quoteSummary?.result?.[0]
  if (!r) return null

  const earnings: EarningsRecord[] = (r.earningsHistory?.history ?? []).slice(0, 8).map((e) => ({
    period: e.period ?? '',
    actual: e.epsActual?.raw,
    estimate: e.epsEstimate?.raw,
    surprise: e.epsActual?.raw != null && e.epsEstimate?.raw
      ? ((e.epsActual.raw - e.epsEstimate.raw) / Math.abs(e.epsEstimate.raw)) * 100 : undefined,
  }))

  const analystTrend = r.recommendationTrend?.trend?.[0]
  const analyst: AnalystRating = {
    strongBuy: analystTrend?.strongBuy ?? 0,
    buy: analystTrend?.buy ?? 0,
    hold: analystTrend?.hold ?? 0,
    sell: analystTrend?.sell ?? 0,
    strongSell: analystTrend?.strongSell ?? 0,
    total: (analystTrend?.strongBuy ?? 0) + (analystTrend?.buy ?? 0) + (analystTrend?.hold ?? 0) +
      (analystTrend?.sell ?? 0) + (analystTrend?.strongSell ?? 0),
  }

  const holders: HolderBreakdown[] = (r.majorHoldersBreakdown?.holders ?? []).slice(0, 10).map((h) => ({
    name: h.name ?? '—',
    percent: h.percentHeld?.raw ? h.percentHeld.raw * 100 : 0,
    date: h.reportDate?.fmt,
  }))

  const insiders: InsiderTrade[] = (r.insiderTransactions?.transactions ?? []).slice(0, 8).map((t) => ({
    name: t.filerName ?? '—',
    action: t.transactionText ?? '—',
    date: t.startDate?.fmt,
    value: t.value?.fmt,
    shares: t.shares?.fmt,
  }))

  const incomeRows = parseFinancialRows(r.incomeStatementHistory?.incomeStatementHistory ?? [], [
    'totalRevenue', 'grossProfit', 'operatingIncome', 'netIncome', 'ebitda',
  ])
  const balanceRows = parseFinancialRows(r.balanceSheetHistory?.balanceSheetStatements ?? [], [
    'totalAssets', 'totalLiab', 'totalStockholderEquity', 'cash', 'longTermDebt',
  ])
  const cashflowRows = parseFinancialRows(r.cashflowStatementHistory?.cashflowStatements ?? [], [
    'totalCashFromOperatingActivities', 'capitalExpenditures', 'dividendsPaid', 'freeCashFlow',
  ])

  const stats = r.defaultKeyStatistics ?? {}
  const fin = r.financialData ?? {}
  const detail = r.summaryDetail ?? {}

  const news = await fetchNews(resolved)

  const deep: TickerDeepData = {
    symbol: resolved,
    earnings,
    analyst,
    holders,
    insiders,
    incomeStatement: incomeRows,
    balanceSheet: balanceRows,
    cashflow: cashflowRows,
    nextEarningsDate: r.calendarEvents?.earnings?.earningsDate?.[0]?.fmt,
    epsEstimate: r.calendarEvents?.earnings?.earningsAverage?.raw,
    revenueEstimate: r.calendarEvents?.earnings?.revenueAverage?.fmt,
    evToEbitda: stats.enterpriseToEbitda?.raw,
    evToRevenue: stats.enterpriseToRevenue?.raw,
    priceToSales: stats.priceToSalesTrailing12Months?.raw,
    currentRatio: fin.currentRatio?.raw,
    quickRatio: fin.quickRatio?.raw,
    debtToEquity: fin.debtToEquity?.raw,
    ebitda: fin.ebitda?.fmt,
    operatingCashflow: fin.operatingCashflow?.fmt,
    payoutRatio: stats.payoutRatio?.raw ? stats.payoutRatio.raw * 100 : undefined,
    bookValue: stats.bookValue?.raw,
    floatShares: stats.floatShares?.fmt,
    shortRatio: stats.shortRatio?.raw,
    shortPercent: stats.shortPercentOfFloat?.raw ? stats.shortPercentOfFloat.raw * 100 : undefined,
    avgVolume10d: detail.averageVolume10days?.fmt,
    avgVolume3m: detail.averageVolume?.fmt,
    dividendRate: detail.dividendRate?.raw,
    exDividendDate: detail.exDividendDate?.fmt,
    news,
    fetchedAt: Date.now(),
  }

  deepCache.set(resolved, deep)
  return deep
}

function parseFinancialRows(rows: Array<Record<string, RawVal>>, fields: string[]): FinancialRow[] {
  return rows.slice(0, 4).map((row) => {
    const date = row.endDate?.fmt ?? ''
    const values: Record<string, string> = {}
    for (const f of fields) {
      values[f] = row[f]?.fmt ?? (row[f]?.raw != null ? String(row[f].raw) : '—')
    }
    return { date, values }
  })
}

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  const resolved = resolveVNSymbol(symbol) ?? symbol
  const url = `${YAHOO}/v1/finance/search?q=${encodeURIComponent(resolved)}&quotesCount=1&newsCount=12`
  const data = await fetchJson<{
    news?: Array<{ title: string; publisher: string; link: string; providerPublishTime?: number; relatedTickers?: string[] }>
  }>(url)

  return (data?.news ?? []).map((n) => ({
    title: n.title,
    publisher: n.publisher,
    url: n.link,
    time: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : '',
    tickers: n.relatedTickers,
  }))
}

export const MACRO_INDICES = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'NASDAQ' },
  { symbol: '^DJI', label: 'DOW' },
  { symbol: '^RUT', label: 'Russell 2K' },
  { symbol: '^VIX', label: 'VIX' },
  { symbol: '^N225', label: 'Nikkei' },
  { symbol: '^HSI', label: 'Hang Seng' },
  { symbol: '^FTSE', label: 'FTSE 100' },
  { symbol: '^GDAXI', label: 'DAX' },
  { symbol: 'VNINDEX.VN', label: 'VN-Index' },
  { symbol: 'HNXINDEX.VN', label: 'HNX' },
  { symbol: 'BTC-USD', label: 'BTC' },
  { symbol: 'ETH-USD', label: 'ETH' },
  { symbol: 'SOL-USD', label: 'SOL' },
  { symbol: '^TNX', label: 'US 10Y' },
  { symbol: '^FVX', label: 'US 5Y' },
  { symbol: 'GC=F', label: 'Gold' },
  { symbol: 'SI=F', label: 'Silver' },
  { symbol: 'CL=F', label: 'WTI Oil' },
  { symbol: 'BZ=F', label: 'Brent' },
  { symbol: 'DX-Y.NYB', label: 'DXY' },
  { symbol: 'EURUSD=X', label: 'EUR/USD' },
  { symbol: 'USDVND=X', label: 'USD/VND' },
]

export interface MacroQuote {
  symbol: string
  label: string
  price: number
  changePct: number
}

export async function fetchMacroQuotes(): Promise<MacroQuote[]> {
  const results: MacroQuote[] = []
  await Promise.all(MACRO_INDICES.map(async (idx) => {
    const url = `${YAHOO}/v8/finance/chart/${encodeURIComponent(idx.symbol)}?interval=1d&range=2d`
    const data = await fetchJson<{ chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; previousClose?: number } }> } }>(url)
    const meta = data?.chart?.result?.[0]?.meta
    if (meta?.regularMarketPrice) {
      const prev = meta.previousClose ?? meta.regularMarketPrice
      results.push({
        symbol: idx.symbol,
        label: idx.label,
        price: meta.regularMarketPrice,
        changePct: ((meta.regularMarketPrice - prev) / prev) * 100,
      })
    }
  }))
  return results
}
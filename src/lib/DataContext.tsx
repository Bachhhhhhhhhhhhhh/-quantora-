import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { OHLCBar, SearchResult, TickerQuote, CompanyFundamentals, TickerDeepData, PerformanceMetrics } from '../types'
import { searchTickers, fetchOHLC, fetchQuote, fetchFundamentals, resolveSymbol } from './market-api'
import { fetchDeepData } from './market-data-extended'
import { computePerformance } from './analytics/performance'
import { getBenchmarkSymbol } from './analytics/benchmark'
import { checkAlerts } from './alerts'
import { safeStorageGet, safeStorageSet } from './bootstrap'

interface DataContextValue {
  watchlist: string[]
  activeSymbol: string
  setActiveSymbol: (s: string) => void
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  search: (query: string) => Promise<SearchResult[]>
  loadOHLC: (symbol: string, range?: string) => Promise<OHLCBar[]>
  getOHLC: (symbol: string, range?: string) => OHLCBar[] | null
  quotes: Record<string, TickerQuote>
  fundamentals: Record<string, CompanyFundamentals>
  deepData: Record<string, TickerDeepData>
  performances: Record<string, PerformanceMetrics | null>
  loading: Record<string, boolean>
  refreshQuote: (symbol: string) => Promise<void>
  loadFundamentals: (symbol: string) => Promise<CompanyFundamentals | null>
  loadDeepData: (symbol: string) => Promise<TickerDeepData | null>
  loadAllForSymbol: (symbol: string) => Promise<void>
  getBenchmarkOHLC: (symbol: string) => OHLCBar[] | null
}

const DataContext = createContext<DataContextValue | null>(null)

const DEFAULT_WATCHLIST = [
  'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'META', 'AMD', 'JPM',
  'VNM.VN', 'HPG.VN', 'FPT.VN', 'VCB.VN', 'VIC.VN', 'MWG.VN', 'SSI.VN', 'TCB.VN', 'VHM.VN', 'PLX.VN',
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'SPY', 'QQQ', 'VOO', 'VNINDEX.VN', 'BID.VN', 'CTG.VN',
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = safeStorageGet('quantora-watchlist')
      if (!saved) return DEFAULT_WATCHLIST
      const parsed = JSON.parse(saved)
      if (!Array.isArray(parsed)) return DEFAULT_WATCHLIST
      const clean = parsed.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      return clean.length > 0 ? clean : DEFAULT_WATCHLIST
    } catch {
      return DEFAULT_WATCHLIST
    }
  })
  const [activeSymbol, setActiveSymbolState] = useState('NVDA')
  const [ohlcData, setOhlcData] = useState<Record<string, OHLCBar[]>>({})
  const [quotes, setQuotes] = useState<Record<string, TickerQuote>>({})
  const [fundamentals, setFundamentals] = useState<Record<string, CompanyFundamentals>>({})
  const [deepData, setDeepData] = useState<Record<string, TickerDeepData>>({})
  const [performances, setPerformances] = useState<Record<string, PerformanceMetrics | null>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    safeStorageSet('quantora-watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const setActiveSymbol = useCallback((s: string) => {
    setActiveSymbolState(resolveSymbol(s))
  }, [])

  const addToWatchlist = useCallback((symbol: string) => {
    const resolved = resolveSymbol(symbol)
    setWatchlist((prev) => (prev.includes(resolved) ? prev : [...prev, resolved]))
  }, [])

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol))
  }, [])

  const loadOHLC = useCallback(async (symbol: string, range = '2y'): Promise<OHLCBar[]> => {
    const resolved = resolveSymbol(symbol)
    const cacheKey = range === '2y' ? resolved : `${resolved}:${range}`
    if (ohlcData[cacheKey]?.length) {
      if (range === '2y') {
        setPerformances((p) => ({ ...p, [resolved]: computePerformance(ohlcData[cacheKey]) }))
      }
      return ohlcData[cacheKey]
    }
    setLoading((p) => ({ ...p, [resolved]: true }))
    try {
      const data = await fetchOHLC(resolved, range)
      setOhlcData((p) => ({ ...p, [cacheKey]: data }))
      if (range === '2y') {
        setPerformances((p) => ({ ...p, [resolved]: computePerformance(data) }))
      }
      return data
    } finally {
      setLoading((p) => ({ ...p, [resolved]: false }))
    }
  }, [ohlcData])

  const refreshQuote = useCallback(async (symbol: string) => {
    const resolved = resolveSymbol(symbol)
    try {
      const q = await fetchQuote(resolved)
      setQuotes((p) => ({ ...p, [resolved]: q }))
    } catch { /* silent */ }
  }, [])

  const loadFundamentals = useCallback(async (symbol: string): Promise<CompanyFundamentals | null> => {
    const resolved = resolveSymbol(symbol)
    if (fundamentals[resolved] && Date.now() - fundamentals[resolved].fetchedAt < 300_000) {
      return fundamentals[resolved]
    }
    setLoading((p) => ({ ...p, [`fund_${resolved}`]: true }))
    try {
      const f = await fetchFundamentals(resolved)
      if (f) setFundamentals((p) => ({ ...p, [resolved]: f }))
      return f
    } finally {
      setLoading((p) => ({ ...p, [`fund_${resolved}`]: false }))
    }
  }, [fundamentals])

  const loadDeepData = useCallback(async (symbol: string): Promise<TickerDeepData | null> => {
    const resolved = resolveSymbol(symbol)
    if (deepData[resolved] && Date.now() - deepData[resolved].fetchedAt < 300_000) {
      return deepData[resolved]
    }
    setLoading((p) => ({ ...p, [`deep_${resolved}`]: true }))
    try {
      const d = await fetchDeepData(resolved)
      if (d) setDeepData((p) => ({ ...p, [resolved]: d }))
      return d
    } finally {
      setLoading((p) => ({ ...p, [`deep_${resolved}`]: false }))
    }
  }, [deepData])

  const loadAllForSymbol = useCallback(async (symbol: string) => {
    const resolved = resolveSymbol(symbol)
    setLoading((p) => ({ ...p, [resolved]: true }))
    await Promise.all([
      loadOHLC(resolved),
      refreshQuote(resolved),
      loadFundamentals(resolved),
      loadDeepData(resolved),
    ])
    setLoading((p) => ({ ...p, [resolved]: false }))
  }, [loadOHLC, refreshQuote, loadFundamentals, loadDeepData])

  useEffect(() => {
    watchlist.forEach((sym) => {
      loadOHLC(sym)
      refreshQuote(sym)
    })
    const interval = setInterval(() => watchlist.forEach((sym) => refreshQuote(sym)), 15_000)
    return () => clearInterval(interval)
  }, [watchlist, loadOHLC, refreshQuote])

  useEffect(() => {
    loadAllForSymbol(activeSymbol)
    const bench = getBenchmarkSymbol(activeSymbol)
    loadOHLC(bench)
  }, [activeSymbol]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    checkAlerts(quotes, (alert, price) => {
      import('sonner').then(({ toast }) => {
        toast.info(`${alert.symbol} ${alert.condition} ${alert.price} — now ${price.toFixed(2)}`)
      })
    })
  }, [quotes])

  const getBenchmarkOHLC = useCallback((symbol: string) => {
    const bench = getBenchmarkSymbol(symbol)
    const resolved = resolveSymbol(bench)
    return ohlcData[resolved] ?? null
  }, [ohlcData])

  return (
    <DataContext.Provider
      value={{
        watchlist,
        activeSymbol: resolveSymbol(activeSymbol),
        setActiveSymbol,
        addToWatchlist,
        removeFromWatchlist,
        search: searchTickers,
        loadOHLC,
        getOHLC: (s, range = '2y') => {
          const resolved = resolveSymbol(s)
          return ohlcData[range === '2y' ? resolved : `${resolved}:${range}`] ?? ohlcData[resolved] ?? null
        },
        quotes,
        fundamentals,
        deepData,
        performances,
        loading,
        refreshQuote,
        loadFundamentals,
        loadDeepData,
        loadAllForSymbol,
        getBenchmarkOHLC,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
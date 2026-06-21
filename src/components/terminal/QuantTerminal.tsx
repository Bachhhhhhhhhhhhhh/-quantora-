import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw, Terminal, BarChart3, FlaskConical,
  Shield, Grid3X3, Layers, Activity, Info, Database, LayoutGrid, Zap,
} from 'lucide-react'
import {
  ComposedChart, Line, Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, CartesianGrid,
} from 'recharts'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useData } from '../../lib/DataContext'
import { runBacktest, getPresetParams } from '../../lib/backtest/engine'
import { runMonteCarloSimulation } from '../../lib/monte-carlo'
import { computeRiskMetrics, computeRollingMetrics, computeDrawdownCurve } from '../../lib/analytics/risk'
import { analyzeNewsSentiment } from '../../lib/analytics/sentiment'
import { computePeerComparison } from '../../lib/analytics/peer-comparison'
import { computeCorrelationMatrix, detectVolatilityRegimes } from '../../lib/analytics/correlation'
import { computeQuantSignals } from '../../lib/analytics/signals'
import { computeQuantScore } from '../../lib/analytics/quant-score'
import { calibrateMonteCarlo } from '../../lib/analytics/performance'
import { getOHLCDataSource } from '../../lib/market-api'
import { getBenchmarkLabel } from '../../lib/analytics/benchmark'
import { computeValuation } from '../../lib/analytics/valuation'
import { optimizeRiskParity } from '../../lib/analytics/portfolio'
import { QuantScorePanel } from '../market/QuantScorePanel'
import { DataQualityBadge } from '../market/DataQualityBadge'
import { ValuationGauge } from '../market/ValuationGauge'
import { CandlestickChart } from './CandlestickChart'
import { AlertPanel } from './AlertPanel'
import { NewsSentimentPanel } from '../market/NewsSentimentPanel'
import { PeerComparisonPanel } from '../market/PeerComparisonPanel'
import { sma, ema, bollingerBands, rsi, macd } from '../../lib/backtest/indicators'
import type { StrategyType, BacktestResult, MonteCarloParams, IndicatorOverlay } from '../../types'
import { formatPrice, formatPercent } from '../../lib/utils'
import { CountUpDisplay } from '../ui/CountUpDisplay'
import { Button } from '../ui/Button'
import { TickerSearch } from './TickerSearch'
import { CompanyIntelPanel } from './CompanyIntelPanel'
import { PerformanceStrip } from './PerformanceStrip'
import { MacroBar } from './MacroBar'
import { DataHub } from './DataHub'
import { WatchlistHeatmap } from './WatchlistHeatmap'

type WorkspaceTab = 'chart' | 'backtest' | 'monte_carlo' | 'analytics' | 'risk' | 'correlation' | 'portfolio' | 'data' | 'heatmap' | 'signals'
type ChartRange = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'

const CHART_RANGES: { id: ChartRange; label: string; slice: number }[] = [
  { id: '5d', label: '1D', slice: 5 },
  { id: '1mo', label: '1M', slice: 30 },
  { id: '3mo', label: '3M', slice: 90 },
  { id: '6mo', label: '6M', slice: 180 },
  { id: '1y', label: '1Y', slice: 252 },
  { id: '2y', label: '2Y', slice: 504 },
  { id: '5y', label: '5Y', slice: 1260 },
  { id: 'max', label: 'MAX', slice: 9999 },
]

const STRATEGIES: { id: StrategyType; label: string }[] = [
  { id: 'sma_crossover', label: 'SMA Crossover' },
  { id: 'rsi_mean_reversion', label: 'RSI Mean Reversion' },
  { id: 'bollinger_rsi', label: 'Bollinger + RSI' },
  { id: 'macd_crossover', label: 'MACD Crossover' },
  { id: 'atr_breakout', label: 'ATR Breakout' },
  { id: 'zscore_mean_reversion', label: 'Z-Score Reversion' },
  { id: 'dual_momentum', label: 'Dual Momentum' },
  { id: 'keltner_breakout', label: 'Keltner Breakout' },
  { id: 'adx_trend', label: 'ADX Trend' },
]

const REGIME_COLORS: Record<string, string> = {
  low_vol: '#34D399', normal: '#22D3EE', high_vol: '#FBBF24', crisis: '#F87171',
}

export function QuantTerminal() {
  const { t } = useLanguage()
  const {
    watchlist, activeSymbol, setActiveSymbol, addToWatchlist,
    search, loadOHLC, getOHLC, quotes, fundamentals, deepData, performances,
    loading, refreshQuote, loadAllForSymbol, getBenchmarkOHLC,
  } = useData()

  const [tab, setTab] = useState<WorkspaceTab>('chart')
  const [chartRange, setChartRange] = useState<ChartRange>('2y')
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle')
  const [sideTab, setSideTab] = useState<'intel' | 'orderbook' | 'alerts'>('intel')
  const [overlays, setOverlays] = useState<IndicatorOverlay[]>(['sma20', 'bollinger'])
  const [strategy, setStrategy] = useState<StrategyType>('macd_crossover')
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [btLoading, setBtLoading] = useState(false)
  const [mcParams, setMcParams] = useState<MonteCarloParams>({
    initialPrice: 100, drift: 0.1, volatility: 0.3, timeHorizon: 1, numPaths: 300, stepsPerYear: 252, model: 'gbm',
  })
  const [mcResult, setMcResult] = useState<ReturnType<typeof runMonteCarloSimulation> | null>(null)

  const bars = getOHLC(activeSymbol, chartRange) ?? getOHLC(activeSymbol) ?? []
  const quote = quotes[activeSymbol]
  const fund = fundamentals[activeSymbol] ?? null
  const deep = deepData[activeSymbol] ?? null
  const perf = performances[activeSymbol] ?? null

  useEffect(() => {
    if (!quote?.price) return
    const cal = calibrateMonteCarlo(bars)
    setMcParams((p) => ({
      ...p,
      initialPrice: quote.price,
      ...(cal ? { drift: Math.round(cal.drift * 1000) / 1000, volatility: Math.round(cal.volatility * 1000) / 1000 } : {}),
    }))
  }, [quote?.price, bars])

  useEffect(() => {
    loadOHLC(activeSymbol, chartRange)
  }, [activeSymbol, chartRange, loadOHLC])

  const heatmapQuotes = useMemo(() => {
    const map: Record<string, { price: number; changePct: number }> = {}
    for (const sym of watchlist) {
      const q = quotes[sym]
      if (q) map[sym] = { price: q.price, changePct: q.changePct }
    }
    return map
  }, [watchlist, quotes])

  const chartSlice = CHART_RANGES.find((r) => r.id === chartRange)?.slice ?? 180

  const selectTicker = useCallback((sym: string) => {
    setActiveSymbol(sym)
    addToWatchlist(sym)
    loadAllForSymbol(sym)
  }, [setActiveSymbol, addToWatchlist, loadAllForSymbol])

  const chartData = useMemo(() => {
    if (!bars.length) return []
    const closes = bars.map((b) => b.close)
    const s20 = sma(closes, 20)
    const s50 = sma(closes, 50)
    const e12 = ema(closes, 12)
    const bb = bollingerBands(closes, 20, 2)
    const rsiVals = rsi(closes, 14)
    const { macd: m, signal: sig } = macd(closes)

    return bars.slice(-chartSlice).map((b, i) => {
      const idx = bars.length - chartSlice + i
      return {
        date: b.date.slice(5),
        close: b.close,
        volume: b.volume / 1e6,
        sma20: s20[idx],
        sma50: s50[idx],
        ema12: e12[idx],
        bbUpper: bb.upper[idx],
        bbLower: bb.lower[idx],
        rsi: rsiVals[idx],
        macd: m[idx],
        macdSignal: sig[idx],
      }
    })
  }, [bars, chartSlice])

  const quantSignals = useMemo(() => computeQuantSignals(bars, fund), [bars, fund])
  const quantScore = useMemo(
    () => computeQuantScore(bars, fund, perf, quantSignals),
    [bars, fund, perf, quantSignals],
  )
  const dataSource = quote?.dataSource ?? (getOHLCDataSource(activeSymbol) === 'yahoo' ? 'yahoo' : getOHLCDataSource(activeSymbol) === 'synthetic' ? 'synthetic' : 'cached')

  const benchmarkBars = getBenchmarkOHLC(activeSymbol)
  const valuation = useMemo(
    () => quote ? computeValuation(quote, fund) : null,
    [quote, fund],
  )

  const riskMetrics = useMemo(
    () => bars.length > 30 ? computeRiskMetrics(bars, benchmarkBars ?? undefined) : null,
    [bars, benchmarkBars],
  )

  const portfolioOpt = useMemo(() => {
    const data: Record<string, typeof bars> = {}
    for (const s of watchlist.slice(0, 10)) {
      const d = getOHLC(s)
      if (d?.length) data[s] = d
    }
    return optimizeRiskParity(data)
  }, [watchlist, getOHLC])

  const rolling = useMemo(() => bars.length > 60 ? computeRollingMetrics(bars) : [], [bars])
  const drawdownCurve = useMemo(() => bars.length > 20 ? computeDrawdownCurve(bars).slice(-chartSlice) : [], [bars, chartSlice])
  const sentiment = useMemo(() => analyzeNewsSentiment(deep?.news ?? []), [deep?.news])
  const peerComparison = useMemo(
    () => computePeerComparison(activeSymbol, fundamentals, performances, getOHLC),
    [activeSymbol, fundamentals, performances, getOHLC],
  )
  const regimes = useMemo(() => bars.length > 40 ? detectVolatilityRegimes(bars) : [], [bars])

  const correlationData = useMemo(() => {
    const syms = watchlist.slice(0, 8)
    const data: Record<string, typeof bars> = {}
    for (const s of syms) {
      const d = getOHLC(s)
      if (d?.length) data[s] = d
    }
    if (Object.keys(data).length < 2) return null
    return computeCorrelationMatrix(data)
  }, [watchlist, getOHLC, bars])

  const runBacktestHandler = async () => {
    setBtLoading(true)
    const data = await loadOHLC(activeSymbol)
    setTimeout(() => {
      const res = runBacktest(data, {
        asset: activeSymbol,
        strategy,
        params: getPresetParams(strategy, 'balanced'),
        initialCapital: 100000,
        commission: 0.05,
        startDate: data[Math.floor(data.length * 0.2)]?.date ?? data[0].date,
        endDate: data[data.length - 1].date,
      })
      setBacktestResult(res)
      setBtLoading(false)
      if (res.metrics.sharpeRatio > 1.5 || res.metrics.totalReturn > 25) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
        toast.success(t('excellent_result'))
      }
    }, 500)
  }

  const runMonteCarloHandler = () => {
    setMcResult(runMonteCarloSimulation(mcParams))
  }

  const toggleOverlay = (o: IndicatorOverlay) => {
    setOverlays((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o])
  }

  const mockOrderBook = useMemo(() => {
    const p = quote?.price ?? 100
    return {
      bids: Array.from({ length: 8 }, (_, i) => ({ price: p * (1 - 0.001 * (i + 1)), size: Math.round(100 + Math.random() * 900) })),
      asks: Array.from({ length: 8 }, (_, i) => ({ price: p * (1 + 0.001 * (i + 1)), size: Math.round(100 + Math.random() * 900) })),
    }
  }, [quote?.price])

  const tabs: { id: WorkspaceTab; icon: typeof Terminal; label: string }[] = [
    { id: 'chart', icon: BarChart3, label: t('term_chart') },
    { id: 'backtest', icon: Activity, label: t('term_backtest') },
    { id: 'monte_carlo', icon: FlaskConical, label: t('term_monte') },
    { id: 'analytics', icon: Layers, label: t('term_analytics') },
    { id: 'risk', icon: Shield, label: t('term_risk') },
    { id: 'correlation', icon: Grid3X3, label: t('term_correlation') },
    { id: 'portfolio', icon: Layers, label: t('term_portfolio') },
    { id: 'data', icon: Database, label: t('term_data') },
    { id: 'heatmap', icon: LayoutGrid, label: t('term_heatmap') },
    { id: 'signals', icon: Zap, label: t('term_signals') },
  ]

  return (
    <section id="terminal" className="py-16 relative">
      <div className="max-w-[1920px] mx-auto px-3 lg:px-6">
        {/* Terminal Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <Terminal className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary font-mono">{t('term_title')}</h2>
              <p className="text-xs text-text-secondary font-mono">{t('term_subtitle')}</p>
            </div>
          </div>

          <TickerSearch onSelect={selectTicker} search={search} />
        </div>

        <MacroBar />

        {/* Main Terminal Grid */}
        <div className="terminal-grid rounded-2xl border border-white/10 overflow-hidden bg-black/30">
          {/* Watchlist Sidebar */}
          <div className="terminal-watchlist border-r border-white/5 flex flex-col">
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">{t('term_watchlist')}</span>
              <span className="text-xs font-mono text-accent">{watchlist.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {watchlist.map((sym) => {
                const q = quotes[sym]
                const isActive = sym === activeSymbol
                const isUp = (q?.changePct ?? 0) >= 0
                return (
                  <button
                    key={sym}
                    onClick={() => { setActiveSymbol(sym); loadOHLC(sym) }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors ${isActive ? 'bg-accent/10 border-l-2 border-l-accent' : ''}`}
                  >
                    <div className="text-left">
                      <p className="font-mono text-sm font-semibold text-text-primary">{sym}</p>
                      {q && <p className="font-mono text-xs text-text-secondary">{formatPrice(sym, q.price)}</p>}
                    </div>
                    {q && (
                      <span className={`font-mono text-xs ${isUp ? 'text-positive' : 'text-negative'}`}>
                        {formatPercent(q.changePct)}
                      </span>
                    )}
                    {loading[sym] && <RefreshCw className="w-3 h-3 text-accent animate-spin" />}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => refreshQuote(activeSymbol)}
              className="px-3 py-2 border-t border-white/5 text-xs font-mono text-text-secondary hover:text-accent flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> {t('market_refresh')}
            </button>
          </div>

          {/* Center Workspace */}
          <div className="terminal-main flex flex-col min-h-0">
            {/* Ticker Bar */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-black/20 overflow-x-auto">
              <span className="font-mono text-lg font-bold text-accent">{activeSymbol}</span>
              {quote && (
                <>
                  <span className="font-mono text-xl font-bold">{formatPrice(activeSymbol, quote.price)}</span>
                  <span className={`font-mono text-sm ${quote.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({formatPercent(quote.changePct)})
                  </span>
                  <span className="text-xs font-mono text-text-secondary">{quote.exchange}</span>
                  <DataQualityBadge source={dataSource} fetchedAt={quote.fetchedAt} compact />
                  <QuantScorePanel score={quantScore} signals={quantSignals} compact />
                </>
              )}
              <div className="ml-auto flex gap-1">
                {tabs.map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTab(tb.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${tab === tb.id ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-secondary hover:bg-white/5'}`}
                  >
                    <tb.icon className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">{tb.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <PerformanceStrip
              perf={perf}
              volatility={perf?.volatility30d}
              avgVolume={perf?.avgVolume}
            />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {tab === 'chart' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-1 mr-1">
                          {(['candle', 'line'] as const).map((ct) => (
                            <button
                              key={ct}
                              onClick={() => setChartType(ct)}
                              className={`px-2 py-1 rounded text-[10px] font-mono uppercase ${
                                chartType === ct ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-text-secondary'
                              }`}
                            >
                              {ct}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1 mr-2">
                          {CHART_RANGES.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => setChartRange(r.id)}
                              className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                                chartRange === r.id ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-text-secondary hover:bg-white/10'
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                        {(['sma20', 'sma50', 'ema12', 'bollinger', 'rsi', 'macd', 'volume'] as IndicatorOverlay[]).map((o) => (
                          <button
                            key={o}
                            onClick={() => toggleOverlay(o)}
                            className={`px-2 py-1 rounded text-xs font-mono uppercase ${overlays.includes(o) ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-text-secondary'}`}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                      <div className="h-[400px] rounded-xl bg-black/40 border border-white/5 p-2">
                        {chartType === 'candle' && bars.length > 10 ? (
                          <CandlestickChart bars={bars} symbol={activeSymbol} slice={chartSlice} />
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData}>
                            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                            <YAxis yAxisId="price" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} fontFamily="monospace" />
                            {overlays.includes('volume') && <YAxis yAxisId="vol" orientation="right" stroke="#64748b" fontSize={10} />}
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }} />
                            {overlays.includes('bollinger') && (
                              <>
                                <Area yAxisId="price" dataKey="bbUpper" fill="rgba(34,211,238,0.03)" stroke="rgba(34,211,238,0.2)" dot={false} />
                                <Area yAxisId="price" dataKey="bbLower" fill="transparent" stroke="rgba(34,211,238,0.2)" dot={false} />
                              </>
                            )}
                            <Line yAxisId="price" dataKey="close" stroke="#F8FAFC" strokeWidth={1.5} dot={false} />
                            {overlays.includes('sma20') && <Line yAxisId="price" dataKey="sma20" stroke="#22D3EE" strokeWidth={1} dot={false} />}
                            {overlays.includes('sma50') && <Line yAxisId="price" dataKey="sma50" stroke="#A78BFA" strokeWidth={1} dot={false} />}
                            {overlays.includes('ema12') && <Line yAxisId="price" dataKey="ema12" stroke="#FBBF24" strokeWidth={1} dot={false} strokeDasharray="3 3" />}
                            {overlays.includes('volume') && <Bar yAxisId="vol" dataKey="volume" fill="rgba(148,163,184,0.3)" />}
                          </ComposedChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                      {(overlays.includes('rsi') || overlays.includes('macd')) && chartType === 'line' && (
                        <div className="h-[150px] rounded-xl bg-black/40 border border-white/5 p-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <XAxis dataKey="date" hide />
                              <YAxis stroke="#64748b" fontSize={10} domain={overlays.includes('rsi') ? [0, 100] : ['auto', 'auto']} />
                              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: 11 }} />
                              {overlays.includes('rsi') && <Line dataKey="rsi" stroke="#F87171" dot={false} strokeWidth={1.5} />}
                              {overlays.includes('macd') && (
                                <>
                                  <Line dataKey="macd" stroke="#22D3EE" dot={false} strokeWidth={1} />
                                  <Line dataKey="macdSignal" stroke="#FBBF24" dot={false} strokeWidth={1} />
                                </>
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'backtest' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {STRATEGIES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setStrategy(s.id)}
                            className={`p-3 rounded-lg text-left text-xs font-mono border transition-all ${strategy === s.id ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20'}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <Button onClick={runBacktestHandler} loading={btLoading}>{t('sim_run_backtest')}</Button>
                      {backtestResult && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {[
                              { l: t('bt_total_return'), v: backtestResult.metrics.totalReturn, s: '%' },
                              { l: t('bt_sharpe'), v: backtestResult.metrics.sharpeRatio, s: '' },
                              { l: t('bt_max_dd'), v: backtestResult.metrics.maxDrawdown, s: '%' },
                              { l: t('bt_win_rate'), v: backtestResult.metrics.winRate, s: '%' },
                              { l: t('bt_cagr'), v: backtestResult.metrics.cagr, s: '%' },
                              { l: t('bt_profit_factor'), v: backtestResult.metrics.profitFactor, s: '' },
                              { l: t('bt_num_trades'), v: backtestResult.metrics.numTrades, s: '', d: 0 },
                              { l: t('bt_buy_hold'), v: backtestResult.metrics.buyHoldReturn, s: '%' },
                            ].map((m) => (
                              <div key={m.l} className="p-2 rounded-lg bg-black/40 border border-white/5 text-center">
                                <p className="text-[10px] text-text-secondary font-mono">{m.l}</p>
                                <p className="text-sm font-bold font-mono text-accent">
                                  <CountUpDisplay value={m.v} suffix={m.s} decimals={m.d ?? 2} />
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="h-64 rounded-xl bg-black/40 border border-white/5 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={backtestResult.equityCurve}>
                                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickFormatter={(v) => v.slice(5)} />
                                <YAxis stroke="#64748b" fontSize={9} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ background: '#0f172a', fontFamily: 'monospace', fontSize: 11 }} />
                                <Line dataKey="equity" stroke="#22D3EE" dot={false} strokeWidth={2} />
                                <Line dataKey="buyHold" stroke="#64748b" dot={false} strokeDasharray="4 4" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'monte_carlo' && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                          <label className="text-xs font-mono text-text-secondary">Model</label>
                          <select
                            value={mcParams.model ?? 'gbm'}
                            onChange={(e) => setMcParams({ ...mcParams, model: e.target.value as MonteCarloParams['model'] })}
                            className="w-full mt-1 px-2 py-1.5 rounded bg-black/40 border border-white/10 text-xs font-mono"
                          >
                            {['gbm', 'jump_diffusion', 'heston_simplified'].map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        {([
                          { l: 'μ', key: 'drift' as const, min: -0.2, max: 0.5, step: 0.01 },
                          { l: 'σ', key: 'volatility' as const, min: 0.05, max: 1, step: 0.01 },
                          { l: 'Horizon', key: 'timeHorizon' as const, min: 0.25, max: 5, step: 0.25 },
                          { l: 'Paths', key: 'numPaths' as const, min: 100, max: 1000, step: 100 },
                        ]).map((ctrl) => (
                          <div key={ctrl.key}>
                            <label className="text-xs font-mono text-text-secondary">{ctrl.l}: {mcParams[ctrl.key].toFixed(2)}</label>
                            <input
                              type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                              value={mcParams[ctrl.key]}
                              onChange={(e) => setMcParams({ ...mcParams, [ctrl.key]: parseFloat(e.target.value) })}
                              className="w-full accent-accent"
                            />
                          </div>
                        ))}
                      </div>
                      <Button onClick={runMonteCarloHandler}>{t('sim_run')}</Button>
                      {mcResult && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                            {[
                              { l: 'E[V]', v: mcResult.kpis.expectedValue, $: true },
                              { l: 'P(Profit)', v: mcResult.kpis.probProfit, s: '%' },
                              { l: 'VaR 95%', v: mcResult.kpis.var95, s: '%' },
                              { l: 'CVaR 95%', v: mcResult.kpis.cvar95, s: '%' },
                              { l: 'Median', v: mcResult.kpis.medianReturn, s: '%' },
                              { l: 'Worst', v: mcResult.kpis.worstCase, $: true },
                              { l: 'Best', v: mcResult.kpis.bestCase, $: true },
                            ].map((k) => (
                              <div key={k.l} className="p-2 rounded bg-black/40 border border-white/5 text-center">
                                <p className="text-[10px] font-mono text-text-secondary">{k.l}</p>
                                <p className="text-sm font-mono font-bold text-accent">
                                  {k.$ ? formatPrice(activeSymbol, k.v) : <CountUpDisplay value={k.v} suffix={k.s ?? ''} decimals={1} />}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="h-64 rounded-xl bg-black/40 border border-white/5 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={mcResult.timeSteps.map((time, i) => ({
                                time: +time.toFixed(2),
                                p5: mcResult.percentiles.p5[i],
                                p50: mcResult.percentiles.p50[i],
                                p95: mcResult.percentiles.p95[i],
                              }))}>
                                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <Tooltip contentStyle={{ background: '#0f172a', fontFamily: 'monospace', fontSize: 11 }} />
                                <Area dataKey="p95" fill="rgba(52,211,153,0.05)" stroke="#34D399" strokeDasharray="3 3" dot={false} />
                                <Line dataKey="p50" stroke="#22D3EE" strokeWidth={2} dot={false} />
                                <Area dataKey="p5" fill="rgba(248,113,113,0.05)" stroke="#F87171" strokeDasharray="3 3" dot={false} />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'analytics' && riskMetrics && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[
                          { l: 'Ann. Vol', v: riskMetrics.annualVol * 100, s: '%' },
                          { l: 'Sharpe', v: riskMetrics.sharpe },
                          { l: 'Sortino', v: riskMetrics.sortino },
                          { l: 'Skewness', v: riskMetrics.skewness },
                          { l: 'Kurtosis', v: riskMetrics.kurtosis },
                          { l: 'Hurst', v: riskMetrics.hurst },
                        ].map((m) => (
                          <div key={m.l} className="p-3 rounded-lg bg-black/40 border border-white/5">
                            <p className="text-[10px] font-mono text-text-secondary">{m.l}</p>
                            <p className="text-lg font-mono font-bold text-accent"><CountUpDisplay value={m.v} suffix={m.s ?? ''} decimals={3} /></p>
                          </div>
                        ))}
                      </div>
                      {rolling.length > 0 && (
                        <div className="h-56 rounded-xl bg-black/40 border border-white/5 p-2">
                          <p className="text-xs font-mono text-text-secondary mb-1">{t('term_rolling_sharpe')}</p>
                          <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={rolling.slice(-120)}>
                              <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickFormatter={(v) => v.slice(5)} />
                              <YAxis stroke="#64748b" fontSize={9} />
                              <Tooltip contentStyle={{ background: '#0f172a', fontFamily: 'monospace', fontSize: 11 }} />
                              <Line dataKey="sharpe" stroke="#22D3EE" dot={false} strokeWidth={1.5} />
                              <Line dataKey="vol" stroke="#F87171" dot={false} strokeWidth={1} strokeDasharray="3 3" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      {regimes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {regimes.slice(-60).map((r) => (
                            <div
                              key={r.date}
                              className="w-2 h-6 rounded-sm"
                              style={{ backgroundColor: REGIME_COLORS[r.regime] }}
                              title={`${r.date}: ${r.regime} (${r.volatility.toFixed(1)}%)`}
                            />
                          ))}
                        </div>
                      )}
                      {drawdownCurve.length > 0 && (
                        <div className="h-48 rounded-xl bg-black/40 border border-white/5 p-2">
                          <p className="text-xs font-mono text-text-secondary mb-1">{t('term_drawdown')}</p>
                          <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={drawdownCurve}>
                              <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickFormatter={(v) => v.slice(5)} />
                              <YAxis stroke="#64748b" fontSize={9} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                              <Tooltip contentStyle={{ background: '#0f172a', fontFamily: 'monospace', fontSize: 11 }} />
                              <Area dataKey="drawdown" fill="rgba(248,113,113,0.15)" stroke="#F87171" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'risk' && riskMetrics && (
                    <div className="space-y-4">
                      <p className="text-xs font-mono text-text-secondary">
                        Beta vs <span className="text-accent">{getBenchmarkLabel(activeSymbol)}</span>
                      </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { l: 'VaR 95%', v: riskMetrics.var95, s: '%', c: 'text-negative' },
                        { l: 'VaR 99%', v: riskMetrics.var99, s: '%', c: 'text-negative' },
                        { l: 'CVaR 95%', v: riskMetrics.cvar95, s: '%', c: 'text-negative' },
                        { l: 'CVaR 99%', v: riskMetrics.cvar99, s: '%', c: 'text-negative' },
                        { l: 'Max DD', v: riskMetrics.maxDrawdown, s: '%', c: 'text-negative' },
                        { l: `Beta (${getBenchmarkLabel(activeSymbol).split(' ')[0]})`, v: riskMetrics.beta, c: 'text-accent' },
                        { l: 'Calmar', v: riskMetrics.calmar, c: 'text-accent' },
                        { l: 'Daily Vol', v: riskMetrics.dailyVol * 100, s: '%', c: 'text-text-primary' },
                      ].map((m) => (
                        <div key={m.l} className="p-4 rounded-xl bg-black/40 border border-white/5">
                          <p className="text-xs font-mono text-text-secondary">{m.l}</p>
                          <p className={`text-2xl font-mono font-bold ${m.c}`}>
                            <CountUpDisplay value={m.v} suffix={m.s ?? ''} decimals={3} />
                          </p>
                        </div>
                      ))}
                    </div>
                    </div>
                  )}

                  {tab === 'correlation' && correlationData && (
                    <div className="overflow-x-auto">
                      <table className="w-full font-mono text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 text-text-secondary" />
                            {correlationData.symbols.map((s) => (
                              <th key={s} className="p-2 text-accent">{s}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {correlationData.symbols.map((rowSym, i) => (
                            <tr key={rowSym}>
                              <td className="p-2 text-accent font-semibold">{rowSym}</td>
                              {correlationData.matrix[i].map((val, j) => {
                                const intensity = Math.abs(val)
                                const color = val > 0
                                  ? `rgba(52,211,153,${intensity * 0.6})`
                                  : `rgba(248,113,113,${intensity * 0.6})`
                                return (
                                  <td key={j} className="p-2 text-center" style={{ backgroundColor: i === j ? 'transparent' : color }}>
                                    {i === j ? '1.00' : val.toFixed(2)}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {tab === 'data' && (
                    <DataHub
                      deep={deep}
                      fundamentals={fund}
                      performance={perf}
                      symbol={activeSymbol}
                      loading={loading[`deep_${activeSymbol}`]}
                    />
                  )}

                  {tab === 'heatmap' && (
                    <WatchlistHeatmap
                      symbols={watchlist}
                      performances={performances}
                      quotes={heatmapQuotes}
                      active={activeSymbol}
                      onSelect={selectTicker}
                    />
                  )}

                  {tab === 'signals' && (
                    <div className="space-y-4">
                      <QuantScorePanel score={quantScore} signals={quantSignals} />
                      <div className="grid md:grid-cols-2 gap-4">
                        {sentiment.articles.length > 0 && <NewsSentimentPanel sentiment={sentiment} />}
                        {peerComparison && (
                          <PeerComparisonPanel comparison={peerComparison} onSelect={selectTicker} />
                        )}
                      </div>
                      {valuation && quote && (
                        <ValuationGauge valuation={valuation} symbol={activeSymbol} currentPrice={quote.price} />
                      )}
                      {quantSignals && (
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {quantSignals.signals.map((s) => (
                            <div
                              key={s.name}
                              className={`p-3 rounded-xl border font-mono text-xs ${
                                s.direction === 'bullish' ? 'bg-positive/5 border-positive/20' :
                                s.direction === 'bearish' ? 'bg-negative/5 border-negative/20' :
                                'bg-white/5 border-white/10'
                              }`}
                            >
                              <p className="text-text-secondary text-[10px] uppercase">{s.name}</p>
                              <p className={`font-bold mt-1 ${
                                s.direction === 'bullish' ? 'text-positive' : s.direction === 'bearish' ? 'text-negative' : 'text-text-primary'
                              }`}>
                                {s.value}
                              </p>
                              <p className="text-[9px] text-text-secondary mt-0.5">weight: {s.weight}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5 font-mono text-xs text-text-secondary leading-relaxed">
                        {t('quant_disclaimer')}
                      </div>
                    </div>
                  )}

                  {tab === 'portfolio' && (
                    <div className="space-y-4">
                      <p className="text-sm font-mono text-text-secondary">{t('term_portfolio_desc')}</p>
                      {portfolioOpt && (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                          {[
                            { l: t('port_return'), v: portfolioOpt.portfolioReturn, s: '%' },
                            { l: t('port_vol'), v: portfolioOpt.portfolioVol, s: '%' },
                            { l: 'Sharpe', v: portfolioOpt.sharpe, s: '' },
                            { l: t('port_diversify'), v: portfolioOpt.diversification, s: '%' },
                          ].map((m) => (
                            <div key={m.l} className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-center">
                              <p className="text-[10px] font-mono text-text-secondary">{m.l}</p>
                              <p className="text-lg font-bold font-mono text-accent">{m.v.toFixed(2)}{m.s}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs font-mono text-accent uppercase">{t('port_risk_parity')}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(portfolioOpt?.allocations ?? watchlist.slice(0, 6).map((sym) => ({
                          symbol: sym,
                          weight: 1 / Math.min(watchlist.length, 6),
                          expectedReturn: 0,
                          contribution: 0,
                          vol: 0,
                        }))).map((alloc) => {
                          const d = getOHLC(alloc.symbol)
                          const ret = d && d.length > 30 ? ((d[d.length - 1].close - d[d.length - 30].close) / d[d.length - 30].close) * 100 : 0
                          return (
                            <div key={alloc.symbol} className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                              <span className="font-mono font-bold text-accent w-20 truncate">{alloc.symbol.replace('.VN', '')}</span>
                              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full bg-accent rounded-full" style={{ width: `${alloc.weight * 100}%` }} />
                              </div>
                              <span className="font-mono text-xs w-14 text-right">{(alloc.weight * 100).toFixed(1)}%</span>
                              <span className={`font-mono text-xs w-14 text-right ${ret >= 0 ? 'text-positive' : 'text-negative'}`}>{ret.toFixed(1)}%</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="h-48 rounded-xl bg-black/40 border border-white/5 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={watchlist.slice(0, 8).map((sym) => {
                            const d = getOHLC(sym)
                            const ret = d && d.length > 30 ? ((d[d.length - 1].close - d[d.length - 30].close) / d[d.length - 30].close) * 100 : 0
                            return { sym, ret }
                          })}>
                            <XAxis dataKey="sym" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip contentStyle={{ background: '#0f172a', fontFamily: 'monospace' }} />
                            <Bar dataKey="ret" radius={[4, 4, 0, 0]}>
                              {watchlist.slice(0, 8).map((_, i) => (
                                <Cell key={i} fill={i % 2 === 0 ? '#22D3EE' : '#34D399'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel — Company Intel + Order Book */}
          <div className="terminal-side border-l border-white/5 flex flex-col">
            <div className="flex border-b border-white/5">
              {(['intel', 'orderbook', 'alerts'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSideTab(st)}
                  className={`flex-1 px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    sideTab === st ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {st === 'intel' ? <><Info className="w-3 h-3 inline mr-1" />{t('term_intel')}</> : st === 'alerts' ? t('alert_title') : t('term_orderbook')}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {sideTab === 'intel' ? (
                <CompanyIntelPanel
                  quote={quote}
                  fundamentals={fund}
                  deep={deep}
                  loading={loading[`fund_${activeSymbol}`]}
                />
              ) : sideTab === 'alerts' ? (
                <AlertPanel symbol={activeSymbol} currentPrice={quote?.price} />
              ) : (
                <div className="font-mono text-xs">
                  <p className="text-negative mb-1 text-center text-[10px] uppercase tracking-wider">Asks</p>
                  {[...mockOrderBook.asks].reverse().map((a, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-negative/80">
                      <span>{formatPrice(activeSymbol, a.price)}</span>
                      <span className="text-text-secondary">{a.size.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="my-2 py-1.5 text-center font-bold text-accent border-y border-accent/20 text-sm">
                    {quote ? formatPrice(activeSymbol, quote.price) : '—'}
                  </div>
                  <p className="text-positive mb-1 text-center text-[10px] uppercase tracking-wider">Bids</p>
                  {mockOrderBook.bids.map((b, i) => (
                    <div key={i} className="flex justify-between py-0.5 text-positive/80">
                      <span>{formatPrice(activeSymbol, b.price)}</span>
                      <span className="text-text-secondary">{b.size.toLocaleString()}</span>
                    </div>
                  ))}
                  {riskMetrics && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                      {[
                        { l: 'σ ann.', v: `${(riskMetrics.annualVol * 100).toFixed(1)}%` },
                        { l: 'Sharpe', v: riskMetrics.sharpe.toFixed(2) },
                        { l: 'VaR 95%', v: `${riskMetrics.var95.toFixed(2)}%` },
                      ].map((s) => (
                        <div key={s.l} className="flex justify-between">
                          <span className="text-text-secondary">{s.l}</span>
                          <span className="text-accent">{s.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Bar,
} from 'recharts'
import {
  Terminal, FlaskConical, Activity, ExternalLink, TrendingUp,
  Building2, BarChart2, Database, Newspaper, LineChart as LineChartIcon, LayoutGrid,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useData } from '../../lib/DataContext'
import { useSimulator } from '../../lib/SimulatorContext'
import { getFeaturedTicker } from '../../data/market-featured'
import { getVNStock } from '../../data/vn-stocks'
import { formatPrice, formatPercent, formatNumber, scrollToSection } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { PerformanceStrip } from '../terminal/PerformanceStrip'
import { DataHub } from '../terminal/DataHub'
import { QuantScorePanel } from './QuantScorePanel'
import { DataQualityBadge } from './DataQualityBadge'
import { computeQuantSignals } from '../../lib/analytics/signals'
import { computeQuantScore } from '../../lib/analytics/quant-score'
import { getOHLCDataSource } from '../../lib/market-api'
import { computeValuation } from '../../lib/analytics/valuation'
import { ValuationGauge } from './ValuationGauge'
import { NewsSentimentPanel } from './NewsSentimentPanel'
import { PeerComparisonPanel } from './PeerComparisonPanel'
import { analyzeNewsSentiment } from '../../lib/analytics/sentiment'
import { computePeerComparison } from '../../lib/analytics/peer-comparison'

type ResearchTab = 'overview' | 'chart' | 'data' | 'news'

interface MarketResearchModalProps {
  symbol: string | null
  onClose: () => void
}

export function MarketResearchModal({ symbol, onClose }: MarketResearchModalProps) {
  const { t } = useLanguage()
  const { navigateToSimulator } = useSimulator()
  const {
    quotes, fundamentals, deepData, performances, loading,
    loadAllForSymbol, getOHLC, setActiveSymbol, addToWatchlist, refreshQuote,
  } = useData()

  const [tab, setTab] = useState<ResearchTab>('overview')

  useEffect(() => {
    if (symbol) {
      setTab('overview')
      addToWatchlist(symbol)
      loadAllForSymbol(symbol)
    }
  }, [symbol]) // eslint-disable-line react-hooks/exhaustive-deps

  const quote = symbol ? quotes[symbol] : undefined
  const fund = symbol ? fundamentals[symbol] ?? null : null
  const deep = symbol ? deepData[symbol] ?? null : null
  const perf = symbol ? performances[symbol] ?? null : null
  const bars = symbol ? getOHLC(symbol) : null

  const meta = useMemo(() => {
    if (!symbol) return null
    const featured = getFeaturedTicker(symbol)
    const vn = getVNStock(symbol)
    return {
      name: fund?.name || quote?.name || featured?.name || vn?.nameVi || symbol,
      color: featured?.color ?? '#22D3EE',
      flag: featured?.flag ?? (symbol.endsWith('.VN') ? '🇻🇳' : '🌐'),
      sector: fund?.sector || vn?.sectorVi || vn?.sector,
    }
  }, [symbol, fund, quote])

  const quantSignals = useMemo(() => (bars ? computeQuantSignals(bars, fund) : null), [bars, fund])
  const quantScore = useMemo(
    () => computeQuantScore(bars ?? [], fund, perf, quantSignals),
    [bars, fund, perf, quantSignals],
  )
  const dataSource = quote?.dataSource ?? (getOHLCDataSource(symbol!) === 'yahoo' ? 'yahoo' : getOHLCDataSource(symbol!) === 'synthetic' ? 'synthetic' : 'cached')
  const valuation = useMemo(() => quote ? computeValuation(quote, fund) : null, [quote, fund])
  const sentiment = useMemo(() => analyzeNewsSentiment(deep?.news ?? []), [deep?.news])
  const peerComparison = useMemo(
    () => symbol ? computePeerComparison(symbol, fundamentals, performances, getOHLC) : null,
    [symbol, fundamentals, performances, getOHLC],
  )

  const chartData = useMemo(() => {
    if (!bars?.length) return []
    return bars.slice(-180).map((b) => ({
      date: b.date.slice(5),
      close: b.close,
      volume: b.volume / 1e6,
      high: b.high,
      low: b.low,
    }))
  }, [bars])

  const isLoading = symbol
    ? (loading[symbol] || loading[`fund_${symbol}`] || loading[`deep_${symbol}`]) && !quote
    : false

  const tabs: { id: ResearchTab; icon: typeof Database; label: string }[] = [
    { id: 'overview', icon: LayoutGrid, label: t('market_tab_overview') },
    { id: 'chart', icon: LineChartIcon, label: t('market_tab_chart') },
    { id: 'data', icon: Database, label: t('market_tab_data') },
    { id: 'news', icon: Newspaper, label: t('market_tab_news') },
  ]

  const handleOpenTerminal = () => {
    if (!symbol) return
    setActiveSymbol(symbol)
    addToWatchlist(symbol)
    onClose()
    scrollToSection('terminal')
    toast.success(t('market_open_terminal'))
  }

  const handleMonteCarlo = () => {
    if (!quote) return
    onClose()
    navigateToSimulator({ tab: 'monte_carlo', monteCarlo: { initialPrice: quote.price } })
  }

  const handleBacktest = () => {
    if (!symbol) return
    onClose()
    navigateToSimulator({ tab: 'backtest', asset: symbol, strategy: 'macd_crossover' })
  }

  if (!symbol) return null

  const range52 = quote?.fiftyTwoWeekHigh && quote?.fiftyTwoWeekLow
    ? ((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100
    : null

  return (
    <Modal open onClose={onClose} title="" wide>
      {isLoading ? (
        <div className="space-y-4 p-2">
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
          <div className="h-12 w-64 bg-white/5 rounded animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{meta?.flag}</span>
                <h2 className="text-2xl font-bold font-mono text-text-primary">{symbol}</h2>
                {fund?.recommendation && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    fund.recommendation.includes('buy') ? 'bg-positive/20 text-positive' : 'bg-white/10 text-text-secondary'
                  }`}>
                    {fund.recommendation.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary font-mono">{meta?.name}</p>
              {meta?.sector && <p className="text-xs text-accent font-mono mt-0.5">{meta.sector}</p>}
            </div>
            <div className="text-right">
              {quote ? (
                <>
                  <p className="text-3xl font-bold font-mono text-text-primary">{formatPrice(symbol, quote.price)}</p>
                  <p className={`text-lg font-mono font-semibold ${quote.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({formatPercent(quote.changePct)})
                  </p>
                  <p className="text-[10px] font-mono text-text-secondary mt-1">{quote.exchange}</p>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => refreshQuote(symbol)}>
                  {t('market_refresh')}
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DataQualityBadge source={dataSource} fetchedAt={quote?.fetchedAt} />
            <QuantScorePanel score={quantScore} signals={quantSignals} compact />
          </div>

          {perf && <PerformanceStrip perf={perf} volatility={perf.volatility30d} avgVolume={perf.avgVolume} />}

          {/* 52-week range */}
          {range52 != null && quote && (
            <div className="px-1">
              <div className="flex justify-between text-[10px] font-mono text-text-secondary mb-1">
                <span>52W Low</span>
                <span className="text-accent">{range52.toFixed(0)}% trong range</span>
                <span>52W High</span>
              </div>
              <div className="relative h-2 rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-negative/40 via-accent/40 to-positive/40" style={{ width: '100%' }} />
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full bg-accent border-2 border-bg-primary -translate-y-1/2"
                  style={{ left: `${Math.min(100, Math.max(0, range52))}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-text-secondary mt-1">
                <span>{formatPrice(symbol, quote.fiftyTwoWeekLow!)}</span>
                <span>{formatPrice(symbol, quote.fiftyTwoWeekHigh!)}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  tab === tb.id ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-secondary hover:bg-white/5'
                }`}
              >
                <tb.icon className="w-3.5 h-3.5" />
                {tb.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {tab === 'overview' && (
                <div className="space-y-4">
                  <QuantScorePanel score={quantScore} signals={quantSignals} />
                  <div className="grid md:grid-cols-2 gap-4">
                    {sentiment.articles.length > 0 && <NewsSentimentPanel sentiment={sentiment} />}
                    {peerComparison && (
                      <PeerComparisonPanel
                        comparison={peerComparison}
                        onSelect={(s) => { addToWatchlist(s); loadAllForSymbol(s) }}
                      />
                    )}
                  </div>
                  {valuation && quote && (
                    <ValuationGauge valuation={valuation} symbol={symbol} currentPrice={quote.price} />
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {[
                      { l: t('intel_market_cap'), v: fund?.marketCapFmt ?? (fund?.marketCap ? `$${(fund.marketCap / 1e9).toFixed(1)}B` : null), icon: Building2 },
                      { l: 'P/E', v: fund?.pe != null ? formatNumber(fund.pe, 1) : null, icon: BarChart2 },
                      { l: 'P/B', v: fund?.pb != null ? formatNumber(fund.pb, 2) : null, icon: BarChart2 },
                      { l: 'EPS', v: fund?.eps != null ? formatNumber(fund.eps, 2) : null, icon: TrendingUp },
                      { l: 'Beta', v: fund?.beta != null ? formatNumber(fund.beta, 2) : null, icon: Activity },
                      { l: 'ROE', v: fund?.roe != null ? `${fund.roe.toFixed(1)}%` : null, icon: TrendingUp },
                      { l: t('intel_dividend'), v: fund?.dividendYield ? `${fund.dividendYield.toFixed(2)}%` : null, icon: TrendingUp },
                      { l: t('intel_rev_growth'), v: fund?.revenueGrowth != null ? `${fund.revenueGrowth.toFixed(1)}%` : null, icon: TrendingUp },
                      { l: t('intel_gross_margin'), v: fund?.grossMargin != null ? `${fund.grossMargin.toFixed(1)}%` : null, icon: BarChart2 },
                      { l: t('intel_target'), v: fund?.targetPrice ? formatPrice(symbol, fund.targetPrice) : null, icon: TrendingUp },
                      { l: 'EV/EBITDA', v: deep?.evToEbitda != null ? formatNumber(deep.evToEbitda, 1) : null, icon: BarChart2 },
                      { l: 'D/E', v: deep?.debtToEquity != null ? formatNumber(deep.debtToEquity, 1) : null, icon: BarChart2 },
                    ].map((m) => (
                      <div key={m.l} className="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-accent/20 transition-colors">
                        <div className="flex items-center gap-1 mb-1">
                          <m.icon className="w-3 h-3 text-text-secondary" />
                          <span className="text-[9px] font-mono text-text-secondary uppercase">{m.l}</span>
                        </div>
                        <p className="text-sm font-mono font-bold text-accent">{m.v ?? '—'}</p>
                      </div>
                    ))}
                  </div>

                  {deep && deep.analyst.total > 0 && (
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <p className="text-xs font-mono text-accent mb-2">{t('data_analyst_consensus')} ({deep.analyst.total})</p>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { l: 'Strong Buy', v: deep.analyst.strongBuy, c: '#34D399' },
                          { l: 'Buy', v: deep.analyst.buy, c: '#22D3EE' },
                          { l: 'Hold', v: deep.analyst.hold, c: '#94A3B8' },
                          { l: 'Sell', v: deep.analyst.sell, c: '#FBBF24' },
                        ].filter((x) => x.v > 0).map((a) => (
                          <span key={a.l} className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: `${a.c}22`, color: a.c }}>
                            {a.l}: {a.v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fund?.description && (
                    <p className="text-xs font-mono text-text-secondary leading-relaxed p-3 rounded-xl bg-black/20 border border-white/5">
                      {fund.description}
                    </p>
                  )}
                </div>
              )}

              {tab === 'chart' && (
                <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                  {chartData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                          <YAxis yAxisId="price" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} fontFamily="monospace" />
                          <YAxis yAxisId="vol" orientation="right" stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }} />
                          <Area yAxisId="price" dataKey="close" fill={`${meta?.color}15`} stroke={meta?.color} strokeWidth={2} dot={false} />
                          <Bar yAxisId="vol" dataKey="volume" fill="rgba(148,163,184,0.2)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-text-secondary font-mono text-sm">
                      {t('market_loading')}
                    </div>
                  )}
                </div>
              )}

              {tab === 'data' && (
                <DataHub
                  deep={deep}
                  fundamentals={fund}
                  performance={perf}
                  symbol={symbol}
                  loading={loading[`deep_${symbol}`]}
                />
              )}

              {tab === 'news' && (
                <div className="space-y-2">
                  {deep?.news.length ? deep.news.map((n, i) => (
                    <a
                      key={i}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl bg-black/20 border border-white/5 hover:border-accent/20 hover:bg-white/5 transition-all group"
                    >
                      <p className="text-sm text-text-primary group-hover:text-accent transition-colors leading-snug">{n.title}</p>
                      <p className="text-[10px] font-mono text-text-secondary mt-1.5">
                        {n.publisher} · {n.time ? new Date(n.time).toLocaleDateString() : ''}
                      </p>
                    </a>
                  )) : (
                    <p className="text-center py-8 text-text-secondary font-mono text-sm">{t('data_no_data')}</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
            <Button onClick={handleOpenTerminal}>
              <Terminal className="w-4 h-4" />
              {t('market_open_terminal')}
            </Button>
            <Button variant="outline" onClick={handleMonteCarlo} disabled={!quote}>
              <FlaskConical className="w-4 h-4" />
              {t('market_run_mc')}
            </Button>
            <Button variant="secondary" onClick={handleBacktest}>
              <Activity className="w-4 h-4" />
              {t('market_run_bt')}
            </Button>
            {fund?.website && (
              <a
                href={fund.website.startsWith('http') ? fund.website : `https://${fund.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-mono text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </motion.div>
      )}
    </Modal>
  )
}
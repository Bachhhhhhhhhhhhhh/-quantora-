import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, Microscope, TrendingUp, TrendingDown, ArrowUpDown, GitCompare } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import type { TranslationKey } from '../../lib/i18n/translations'
import { useData } from '../../lib/DataContext'
import { FEATURED_TICKERS, type MarketCategory } from '../../data/market-featured'
import type { SearchResult } from '../../types'
import { formatPrice, formatPercent } from '../../lib/utils'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'
import { MarketResearchModal } from '../market/MarketResearchModal'
import { computeQuantScore } from '../../lib/analytics/quant-score'
import { computeQuantSignals } from '../../lib/analytics/signals'
import { MarketPulseBar } from '../market/MarketPulseBar'
import { MarketMovers } from '../market/MarketMovers'
import { SectorHeatmap } from '../market/SectorHeatmap'
import { Sparkline } from '../market/Sparkline'
import { StockScreener } from '../market/StockScreener'

const CATEGORIES: { id: MarketCategory; labelKey: TranslationKey }[] = [
  { id: 'all', labelKey: 'market_cat_all' },
  { id: 'us', labelKey: 'market_cat_us' },
  { id: 'vn', labelKey: 'market_cat_vn' },
  { id: 'crypto', labelKey: 'market_cat_crypto' },
  { id: 'etf', labelKey: 'market_cat_etf' },
]

type SortMode = 'change' | 'name' | 'price'

export function MarketSection() {
  const { t, lang } = useLanguage()
  const { quotes, performances, fundamentals, search: searchTickers, refreshQuote, addToWatchlist, loadOHLC, getOHLC } = useData()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketCategory>('all')
  const [sort, setSort] = useState<SortMode>('change')
  const [researchSymbol, setResearchSymbol] = useState<string | null>(null)
  const [compareA, setCompareA] = useState<string | null>(null)
  const [compareB, setCompareB] = useState<string | null>(null)
  const [universalResults, setUniversalResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    FEATURED_TICKERS.forEach((a) => loadOHLC(a.symbol))
  }, [loadOHLC])

  const filtered = useMemo(() => {
    let list = category === 'all' ? [...FEATURED_TICKERS] : FEATURED_TICKERS.filter((a) => a.category === category)

    if (search.length >= 2) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.nameVi.toLowerCase().includes(q),
      )
    }

    return list.sort((a, b) => {
      const qa = quotes[a.symbol]
      const qb = quotes[b.symbol]
      if (sort === 'name') return a.symbol.localeCompare(b.symbol)
      if (sort === 'price') return (qb?.price ?? 0) - (qa?.price ?? 0)
      return (qb?.changePct ?? 0) - (qa?.changePct ?? 0)
    })
  }, [category, search, sort, quotes])

  useEffect(() => {
    if (search.length < 2) {
      setUniversalResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const r = await searchTickers(search)
        setUniversalResults(r)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, searchTickers])

  const openResearch = (symbol: string) => {
    addToWatchlist(symbol)
    setResearchSymbol(symbol)
    setSearch('')
    setUniversalResults([])
  }

  const toggleCompare = (symbol: string) => {
    if (compareA === symbol) { setCompareA(null); return }
    if (compareB === symbol) { setCompareB(null); return }
    if (!compareA) setCompareA(symbol)
    else if (!compareB) setCompareB(symbol)
    else setCompareA(symbol)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all(FEATURED_TICKERS.map((a) => refreshQuote(a.symbol)))
    setRefreshing(false)
  }

  const getSparkData = (symbol: string) => {
    const bars = getOHLC(symbol)
    return bars?.slice(-30).map((b) => b.close) ?? []
  }

  return (
    <section id="market" className="py-24 bg-bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader title={t('market_title')} subtitle={t('market_subtitle')} />

        <MarketPulseBar
          quotes={Object.fromEntries(Object.entries(quotes).map(([k, v]) => [k, { changePct: v.changePct }]))}
          symbols={FEATURED_TICKERS.map((a) => a.symbol)}
        />

        <MarketMovers tickers={FEATURED_TICKERS} quotes={quotes} onResearch={openResearch} />

        <SectorHeatmap quotes={quotes} performances={performances} onSelect={openResearch} />

        <div className="mb-8">
          <StockScreener onSelect={openResearch} />
        </div>

        {/* Compare bar */}
        {(compareA || compareB) && (
          <div className="mb-6 p-4 rounded-2xl border border-accent/20 bg-accent/5 flex flex-wrap items-center gap-4">
            <GitCompare className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-accent">{t('market_compare')}</span>
            {compareA && (
              <button onClick={() => openResearch(compareA)} className="px-3 py-1.5 rounded-lg bg-black/30 font-mono text-sm text-accent border border-accent/30">
                {compareA}
              </button>
            )}
            <span className="text-text-secondary font-mono">vs</span>
            {compareB && (
              <button onClick={() => openResearch(compareB)} className="px-3 py-1.5 rounded-lg bg-black/30 font-mono text-sm text-accent border border-accent/30">
                {compareB}
              </button>
            )}
            {compareA && compareB && (
              <div className="flex gap-4 ml-auto text-xs font-mono">
                <span>
                  {compareA}: <span className={(quotes[compareA]?.changePct ?? 0) >= 0 ? 'text-positive' : 'text-negative'}>
                    {formatPercent(quotes[compareA]?.changePct ?? 0)}
                  </span>
                </span>
                <span>
                  {compareB}: <span className={(quotes[compareB]?.changePct ?? 0) >= 0 ? 'text-positive' : 'text-negative'}>
                    {formatPercent(quotes[compareB]?.changePct ?? 0)}
                  </span>
                </span>
              </div>
            )}
            <button onClick={() => { setCompareA(null); setCompareB(null) }} className="text-xs font-mono text-text-secondary hover:text-accent ml-auto">
              {t('close')}
            </button>
          </div>
        )}

        {/* Search + controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder={t('term_search_any')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50 transition-colors font-mono"
            />
            {universalResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-40 rounded-xl bg-bg-secondary border border-white/10 shadow-2xl max-h-72 overflow-y-auto">
                {searchLoading && (
                  <div className="px-4 py-3 text-xs font-mono text-text-secondary animate-pulse">{t('market_searching')}</div>
                )}
                {universalResults.map((r) => (
                  <div key={r.symbol} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 border-b border-white/5 last:border-0">
                    <button onClick={() => openResearch(r.symbol)} className="flex-1 text-left flex items-center gap-2 min-w-0">
                      <span>{r.flag ?? '🌐'}</span>
                      <span className="font-mono text-sm text-accent shrink-0">{r.symbol}</span>
                      <span className="text-text-secondary text-xs truncate">{r.name}</span>
                      {r.changePct != null && (
                        <span className={`text-xs font-mono ml-auto shrink-0 ${r.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {formatPercent(r.changePct)}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => openResearch(r.symbol)}
                      className="ml-2 shrink-0 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-mono flex items-center gap-1 hover:bg-accent/20"
                    >
                      <Microscope className="w-3.5 h-3.5" />
                      {t('market_research')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSort(sort === 'change' ? 'name' : sort === 'name' ? 'price' : 'change')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sort === 'change' ? t('market_sort_change') : sort === 'name' ? t('market_sort_name') : t('market_sort_price')}
            </button>
            <Button variant="secondary" onClick={handleRefresh} loading={refreshing}>
              <RefreshCw className="w-4 h-4" />
              {t('market_refresh')}
            </Button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                category === cat.id
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
              }`}
            >
              {t(cat.labelKey)}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-text-secondary self-center">
            {filtered.length} {t('market_assets')}
          </span>
        </div>

        {/* Asset grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset, i) => {
            const quote = quotes[asset.symbol]
            const perf = performances[asset.symbol]
            const isPositive = (quote?.changePct ?? perf?.d1 ?? 0) >= 0
            const displayName = lang === 'vi' ? asset.nameVi : asset.name
            const spark = getSparkData(asset.symbol)
            const bars = getOHLC(asset.symbol)
            const fund = fundamentals[asset.symbol]
            const sig = bars?.length ? computeQuantSignals(bars, fund) : null
            const score = bars?.length ? computeQuantScore(bars, fund ?? null, perf ?? null, sig) : null
            const isComparing = compareA === asset.symbol || compareB === asset.symbol
            const gradeColor: Record<string, string> = { 'A+': '#34D399', A: '#22D3EE', 'B+': '#A78BFA', B: '#94A3B8', C: '#FBBF24', D: '#FB923C', F: '#F87171' }

            return (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
                className={`glass-card p-5 flex flex-col transition-all duration-300 group ${
                  isComparing ? 'border-accent/50 ring-1 ring-accent/30' : 'hover:border-accent/30 hover:shadow-[0_8px_32px_rgba(34,211,238,0.08)]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: asset.color + '22', color: asset.color }}
                  >
                    {asset.flag ?? asset.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-semibold text-text-primary text-sm">{asset.symbol.replace('.VN', '')}</p>
                    <p className="text-[10px] text-text-secondary truncate">{displayName}</p>
                  </div>
                  {isPositive
                    ? <TrendingUp className="w-4 h-4 text-positive shrink-0" />
                    : <TrendingDown className="w-4 h-4 text-negative shrink-0" />
                  }
                </div>

                <Sparkline data={spark} color={asset.color} positive={isPositive} />

                {quote ? (
                  <div className="mt-2">
                    <p className="text-lg font-bold font-mono text-text-primary">{formatPrice(asset.symbol, quote.price)}</p>
                    <p className={`text-sm font-mono font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {formatPercent(quote.changePct)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                )}

                {score && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold font-mono" style={{ color: gradeColor[score.grade] }}>{score.grade}</span>
                    <span className="text-[10px] font-mono text-text-secondary">{score.total}/100</span>
                    {quote?.dataSource === 'yahoo' && (
                      <span className="text-[9px] font-mono text-positive ml-auto">LIVE</span>
                    )}
                  </div>
                )}

                {perf && (
                  <div className="flex gap-2 mt-2 text-[10px] font-mono text-text-secondary">
                    <span>1M: <span className={perf.m1 >= 0 ? 'text-positive' : 'text-negative'}>{formatPercent(perf.m1)}</span></span>
                    <span>1Y: <span className={perf.y1 >= 0 ? 'text-positive' : 'text-negative'}>{formatPercent(perf.y1)}</span></span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => openResearch(asset.symbol)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 text-accent text-xs font-mono hover:bg-accent/20 transition-colors"
                  >
                    <Microscope className="w-3.5 h-3.5" />
                    {t('market_research')}
                  </button>
                  <button
                    onClick={() => toggleCompare(asset.symbol)}
                    title={t('market_compare')}
                    className={`px-2.5 py-2 rounded-lg text-xs font-mono transition-colors ${
                      isComparing ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>
                </div>

                {asset.category === 'vn' && (
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono w-fit">HOSE/HNX</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <MarketResearchModal symbol={researchSymbol} onClose={() => setResearchSymbol(null)} />
    </section>
  )
}
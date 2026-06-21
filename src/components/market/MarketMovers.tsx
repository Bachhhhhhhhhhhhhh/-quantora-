import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { FeaturedTicker } from '../../data/market-featured'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatPrice, formatPercent } from '../../lib/utils'

interface MarketMoversProps {
  tickers: FeaturedTicker[]
  quotes: Record<string, { price: number; changePct: number }>
  onResearch: (symbol: string) => void
}

export function MarketMovers({ tickers, quotes, onResearch }: MarketMoversProps) {
  const { t } = useLanguage()

  const ranked = tickers
    .map((tk) => ({ tk, q: quotes[tk.symbol] }))
    .filter((x) => x.q)
    .sort((a, b) => (b.q?.changePct ?? 0) - (a.q?.changePct ?? 0))

  const gainers = ranked.slice(0, 5)
  const losers = [...ranked].reverse().slice(0, 5)

  const MoverRow = ({ tk, q, rank }: { tk: FeaturedTicker; q: { price: number; changePct: number }; rank: number }) => (
    <button
      onClick={() => onResearch(tk.symbol)}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
    >
      <span className="text-[10px] font-mono text-text-secondary w-4">#{rank}</span>
      <span className="text-sm">{tk.flag}</span>
      <span className="font-mono text-sm font-semibold text-accent w-16 shrink-0">
        {tk.symbol.replace('.VN', '')}
      </span>
      <span className="font-mono text-xs text-text-primary ml-auto">
        {formatPrice(tk.symbol, q.price)}
      </span>
      <span className={`font-mono text-xs font-bold w-16 text-right ${q.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
        {formatPercent(q.changePct)}
      </span>
    </button>
  )

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-positive/20 bg-positive/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-positive" />
          <span className="text-xs font-mono text-positive uppercase tracking-wider">{t('market_top_gainers')}</span>
        </div>
        {gainers.map(({ tk, q }, i) => q && <MoverRow key={tk.symbol} tk={tk} q={q} rank={i + 1} />)}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-negative/20 bg-negative/5 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-negative" />
          <span className="text-xs font-mono text-negative uppercase tracking-wider">{t('market_top_losers')}</span>
        </div>
        {losers.map(({ tk, q }, i) => q && <MoverRow key={tk.symbol} tk={tk} q={q} rank={i + 1} />)}
      </motion.div>
    </div>
  )
}
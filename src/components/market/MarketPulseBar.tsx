import { useEffect, useState } from 'react'
import { Activity, TrendingUp, TrendingDown, Globe } from 'lucide-react'
import { fetchMacroQuotes, type MacroQuote } from '../../lib/market-data-extended'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatPercent } from '../../lib/utils'

interface MarketPulseBarProps {
  quotes: Record<string, { changePct: number }>
  symbols: string[]
}

export function MarketPulseBar({ quotes, symbols }: MarketPulseBarProps) {
  const { t } = useLanguage()
  const [macro, setMacro] = useState<MacroQuote[]>([])

  useEffect(() => {
    fetchMacroQuotes().then(setMacro)
    const id = setInterval(() => fetchMacroQuotes().then(setMacro), 60_000)
    return () => clearInterval(id)
  }, [])

  const changes = symbols
    .map((s) => quotes[s]?.changePct)
    .filter((v): v is number => v != null)

  const gainers = changes.filter((c) => c > 0).length
  const losers = changes.filter((c) => c < 0).length
  const avgChange = changes.length
    ? changes.reduce((a, b) => a + b, 0) / changes.length
    : 0

  const highlights = macro.filter((m) =>
    ['^GSPC', 'VNINDEX.VN', 'BTC-USD', 'USDVND=X', '^VIX'].includes(m.symbol),
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden mb-6">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono text-accent uppercase tracking-wider">{t('market_pulse')}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1 text-positive">
            <TrendingUp className="w-3.5 h-3.5" />
            {gainers} {t('market_gainers')}
          </span>
          <span className="flex items-center gap-1 text-negative">
            <TrendingDown className="w-3.5 h-3.5" />
            {losers} {t('market_losers')}
          </span>
          <span className="flex items-center gap-1 text-text-secondary">
            <Activity className="w-3.5 h-3.5" />
            {t('market_avg')}:{' '}
            <span className={avgChange >= 0 ? 'text-positive' : 'text-negative'}>
              {formatPercent(avgChange)}
            </span>
          </span>
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto px-4 py-2.5 scrollbar-none">
        {highlights.map((m) => (
          <div key={m.symbol} className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-text-secondary">{m.label}</span>
            <span className="text-text-primary font-semibold">
              {m.price >= 1000 ? m.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : m.price.toFixed(2)}
            </span>
            <span className={m.changePct >= 0 ? 'text-positive' : 'text-negative'}>
              {formatPercent(m.changePct)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
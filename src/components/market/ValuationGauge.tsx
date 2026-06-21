import { motion } from 'framer-motion'
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ValuationResult } from '../../lib/analytics/valuation'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatPrice, formatPercent } from '../../lib/utils'

interface ValuationGaugeProps {
  valuation: ValuationResult
  symbol: string
  currentPrice: number
}

const VERDICT_STYLE = {
  undervalued: { color: '#34D399', icon: TrendingUp, label: 'Undervalued' },
  fair: { color: '#94A3B8', icon: Minus, label: 'Fair Value' },
  overvalued: { color: '#F87171', icon: TrendingDown, label: 'Overvalued' },
}

export function ValuationGauge({ valuation, symbol, currentPrice }: ValuationGaugeProps) {
  const { t } = useLanguage()
  const style = VERDICT_STYLE[valuation.verdict]
  const Icon = style.icon
  const position = Math.min(100, Math.max(0, 50 + valuation.upside))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-white/10 bg-black/40 p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">{t('val_fair_value')}</p>
          <p className="text-2xl font-bold font-mono text-accent mt-1">{formatPrice(symbol, valuation.fairValue)}</p>
          <p className="text-xs font-mono text-text-secondary mt-0.5">
            {t('val_current')}: {formatPrice(symbol, currentPrice)}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5" style={{ color: style.color }}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-mono font-bold uppercase">{style.label}</span>
          </div>
          <p className={`text-lg font-mono font-bold mt-1 ${valuation.upside >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatPercent(valuation.upside)} {t('val_upside')}
          </p>
          <p className="text-[10px] font-mono text-text-secondary">{t('quant_confidence')}: {valuation.confidence}%</p>
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-gradient-to-r from-negative/40 via-accent/30 to-positive/40 mb-4">
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${position}%` }}
          className="absolute top-1/2 w-4 h-4 rounded-full bg-accent border-2 border-bg-primary -translate-y-1/2 -translate-x-1/2"
        />
        <Target className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary opacity-50" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {valuation.models.map((m) => (
          <div key={m.name} className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-mono">
            <span className="text-text-secondary">{m.name}</span>
            <p className="text-accent font-bold mt-0.5">{formatPrice(symbol, m.value)}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
import { motion } from 'framer-motion'
import {
  Building2, Globe, Users, TrendingUp, DollarSign, BarChart2,
  Percent, Target, ExternalLink, Shield,
} from 'lucide-react'
import type { CompanyFundamentals, TickerQuote, TickerDeepData } from '../../types'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatCurrency, formatPercent, formatNumber } from '../../lib/utils'

interface CompanyIntelPanelProps {
  quote: TickerQuote | undefined
  fundamentals: CompanyFundamentals | null
  deep?: TickerDeepData | null
  loading?: boolean
}

function MetricCard({ label, value, icon: Icon, color = 'text-accent' }: {
  label: string; value: string; icon: typeof Building2; color?: string
}) {
  return (
    <div className="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-text-secondary" />
        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export function CompanyIntelPanel({ quote, fundamentals, deep, loading }: CompanyIntelPanelProps) {
  const { t } = useLanguage()

  if (loading && !fundamentals) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  const fmt = (v?: number, suffix = '', decimals = 2) =>
    v != null ? `${formatNumber(v, decimals)}${suffix}` : '—'

  const fmtCap = (v?: number, fmt?: string) => {
    if (fmt) return fmt
    if (!v) return '—'
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
    return formatCurrency(v)
  }

  const isVND = quote?.currency === 'VND'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {quote?.country === 'VN' && <span className="text-lg">🇻🇳</span>}
            <h3 className="font-mono font-bold text-text-primary text-sm leading-tight">
              {fundamentals?.name || quote?.name}
            </h3>
          </div>
          {fundamentals?.sector && (
            <p className="text-[10px] font-mono text-text-secondary">
              {fundamentals.sector}{fundamentals.industry ? ` · ${fundamentals.industry}` : ''}
            </p>
          )}
          {fundamentals?.country && (
            <p className="text-[10px] font-mono text-text-secondary flex items-center gap-1 mt-0.5">
              <Globe className="w-3 h-3" /> {fundamentals.country}
            </p>
          )}
        </div>
        {fundamentals?.recommendation && (
          <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
            fundamentals.recommendation === 'buy' || fundamentals.recommendation === 'strong_buy'
              ? 'bg-positive/20 text-positive'
              : fundamentals.recommendation === 'sell'
              ? 'bg-negative/20 text-negative'
              : 'bg-white/10 text-text-secondary'
          }`}>
            {fundamentals.recommendation.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Price block */}
      {quote && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10">
          <div className="flex items-end gap-3">
            <span className="text-2xl font-mono font-bold text-text-primary">
              {isVND ? `${quote.price.toLocaleString('vi-VN')} ₫` : formatCurrency(quote.price)}
            </span>
            <span className={`text-sm font-mono font-semibold mb-0.5 ${quote.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatPercent(quote.changePct)}
            </span>
          </div>
          {quote.fiftyTwoWeekHigh && quote.fiftyTwoWeekLow && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-text-secondary mb-1">
                <span>52W Low</span>
                <span>52W High</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-white/10">
                <div
                  className="absolute h-full rounded-full bg-accent"
                  style={{
                    left: `${((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100}%`,
                    width: '4px',
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-text-secondary mt-1">
                <span>{isVND ? quote.fiftyTwoWeekLow.toLocaleString('vi-VN') : formatCurrency(quote.fiftyTwoWeekLow)}</span>
                <span>{isVND ? quote.fiftyTwoWeekHigh.toLocaleString('vi-VN') : formatCurrency(quote.fiftyTwoWeekHigh)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label={t('intel_market_cap')} value={fmtCap(fundamentals?.marketCap, fundamentals?.marketCapFmt)} icon={Building2} />
        <MetricCard label="P/E" value={fmt(fundamentals?.pe)} icon={BarChart2} />
        <MetricCard label="EPS" value={fmt(fundamentals?.eps, isVND ? ' ₫' : '')} icon={DollarSign} />
        <MetricCard label="P/B" value={fmt(fundamentals?.pb)} icon={BarChart2} />
        <MetricCard label="Beta" value={fmt(fundamentals?.beta, '', 3)} icon={TrendingUp} />
        <MetricCard label={t('intel_dividend')} value={fundamentals?.dividendYield ? `${fundamentals.dividendYield.toFixed(2)}%` : '—'} icon={Percent} />
        <MetricCard label="ROE" value={fundamentals?.roe ? `${fundamentals.roe.toFixed(1)}%` : '—'} icon={TrendingUp} color="text-positive" />
        <MetricCard label="ROA" value={fundamentals?.roa ? `${fundamentals.roa.toFixed(1)}%` : '—'} icon={TrendingUp} />
        <MetricCard label={t('intel_revenue')} value={fundamentals?.revenueFmt ?? '—'} icon={DollarSign} />
        <MetricCard label={t('intel_rev_growth')} value={fundamentals?.revenueGrowth ? `${fundamentals.revenueGrowth.toFixed(1)}%` : '—'} icon={TrendingUp} color={fundamentals?.revenueGrowth && fundamentals.revenueGrowth > 0 ? 'text-positive' : 'text-negative'} />
        <MetricCard label={t('intel_gross_margin')} value={fundamentals?.grossMargin ? `${fundamentals.grossMargin.toFixed(1)}%` : '—'} icon={Percent} />
        <MetricCard label={t('intel_profit_margin')} value={fundamentals?.profitMargin ? `${fundamentals.profitMargin.toFixed(1)}%` : '—'} icon={Percent} />
        {fundamentals?.targetPrice && (
          <MetricCard label={t('intel_target')} value={formatCurrency(fundamentals.targetPrice)} icon={Target} color="text-positive" />
        )}
        {fundamentals?.employees && (
          <MetricCard label={t('intel_employees')} value={fundamentals.employees.toLocaleString()} icon={Users} />
        )}
        {fundamentals?.freeCashflow && (
          <MetricCard label="FCF" value={fundamentals.freeCashflow} icon={DollarSign} color="text-positive" />
        )}
        {fundamentals?.totalDebt && (
          <MetricCard label={t('intel_debt')} value={fundamentals.totalDebt} icon={Shield} color="text-negative" />
        )}
        {deep?.evToEbitda != null && (
          <MetricCard label="EV/EBITDA" value={fmt(deep.evToEbitda)} icon={BarChart2} />
        )}
        {deep?.debtToEquity != null && (
          <MetricCard label="D/E" value={fmt(deep.debtToEquity)} icon={Shield} />
        )}
        {deep?.currentRatio != null && (
          <MetricCard label="Current Ratio" value={fmt(deep.currentRatio)} icon={BarChart2} />
        )}
        {deep?.floatShares && (
          <MetricCard label={t('data_float')} value={deep.floatShares} icon={Users} />
        )}
        {deep?.shortPercent != null && (
          <MetricCard label={t('data_short')} value={`${deep.shortPercent.toFixed(2)}%`} icon={Shield} color="text-negative" />
        )}
        {deep?.exDividendDate && (
          <MetricCard label={t('data_ex_div')} value={deep.exDividendDate} icon={Percent} />
        )}
        {deep?.avgVolume3m && (
          <MetricCard label="Avg Vol 3M" value={deep.avgVolume3m} icon={BarChart2} />
        )}
      </div>

      {deep?.news && deep.news.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-accent uppercase tracking-wider">{t('data_news')}</p>
          {deep.news.slice(0, 3).map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded-lg bg-black/20 border border-white/5 hover:border-accent/20 transition-colors"
            >
              <p className="text-[10px] text-text-primary leading-snug line-clamp-2">{n.title}</p>
              <p className="text-[9px] font-mono text-text-secondary mt-0.5">{n.publisher}</p>
            </a>
          ))}
        </div>
      )}

      {/* Description */}
      {fundamentals?.description && (
        <div className="p-3 rounded-xl bg-black/20 border border-white/5">
          <p className="text-[11px] font-mono text-text-secondary leading-relaxed line-clamp-4">
            {fundamentals.description}
          </p>
        </div>
      )}

      {fundamentals?.website && (
        <a
          href={fundamentals.website.startsWith('http') ? fundamentals.website : `https://${fundamentals.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-mono text-accent hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          {fundamentals.website.replace(/^https?:\/\//, '')}
        </a>
      )}
    </motion.div>
  )
}
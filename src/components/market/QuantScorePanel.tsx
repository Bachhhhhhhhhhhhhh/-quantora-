import { motion } from 'framer-motion'
import type { QuantScoreBreakdown } from '../../lib/analytics/quant-score'
import type { QuantSignalResult } from '../../lib/analytics/signals'
import { useLanguage } from '../../lib/i18n/LanguageContext'

const GRADE_COLORS: Record<string, string> = {
  'A+': '#34D399', A: '#22D3EE', 'B+': '#A78BFA', B: '#94A3B8', C: '#FBBF24', D: '#FB923C', F: '#F87171',
}

const SIGNAL_COLORS: Record<string, string> = {
  strong_buy: '#34D399', buy: '#22D3EE', neutral: '#94A3B8', sell: '#FBBF24', strong_sell: '#F87171',
}

interface QuantScorePanelProps {
  score: QuantScoreBreakdown
  signals?: QuantSignalResult | null
  compact?: boolean
}

export function QuantScorePanel({ score, signals, compact }: QuantScorePanelProps) {
  const { t } = useLanguage()
  const color = GRADE_COLORS[score.grade] ?? '#94A3B8'

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
        <span className="text-lg font-bold font-mono" style={{ color }}>{score.grade}</span>
        <span className="text-xs font-mono text-text-secondary">{score.total}/100</span>
        {signals && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: `${SIGNAL_COLORS[signals.overall]}22`, color: SIGNAL_COLORS[signals.overall] }}>
            {signals.overall.replace('_', ' ')}
          </span>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-white/10 bg-black/40 p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">{t('quant_score')}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-bold font-mono" style={{ color }}>{score.grade}</span>
            <span className="text-2xl font-mono font-bold text-text-primary">{score.total}</span>
            <span className="text-sm font-mono text-text-secondary">/100</span>
          </div>
          <p className="text-xs font-mono text-accent mt-0.5">{score.label}</p>
        </div>
        {signals && (
          <div className="text-right">
            <p className="text-[10px] font-mono text-text-secondary">{t('quant_signal')}</p>
            <p className="text-sm font-mono font-bold uppercase mt-1" style={{ color: SIGNAL_COLORS[signals.overall] }}>
              {signals.overall.replace('_', ' ')}
            </p>
            <p className="text-[10px] font-mono text-text-secondary">{t('quant_confidence')}: {signals.confidence}%</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {[
          { l: t('quant_fundamental'), v: score.fundamental, c: '#22D3EE' },
          { l: t('quant_technical'), v: score.technical, c: '#A78BFA' },
          { l: t('quant_momentum'), v: score.momentum, c: '#34D399' },
        ].map((row) => (
          <div key={row.l}>
            <div className="flex justify-between text-[10px] font-mono text-text-secondary mb-0.5">
              <span>{row.l}</span>
              <span style={{ color: row.c }}>{row.v}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${row.v}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: row.c }}
              />
            </div>
          </div>
        ))}
      </div>

      {signals && signals.signals.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-1.5">
          {signals.signals.slice(0, 6).map((s) => (
            <div key={s.name} className="flex items-center justify-between px-2 py-1 rounded bg-white/5 text-[10px] font-mono">
              <span className="text-text-secondary">{s.name}</span>
              <span className={
                s.direction === 'bullish' ? 'text-positive' : s.direction === 'bearish' ? 'text-negative' : 'text-text-secondary'
              }>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
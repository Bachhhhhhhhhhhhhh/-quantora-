import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { SentimentResult } from '../../lib/analytics/sentiment'
import { useLanguage } from '../../lib/i18n/LanguageContext'

interface NewsSentimentPanelProps {
  sentiment: SentimentResult
  compact?: boolean
}

const LABEL_COLORS: Record<SentimentResult['label'], string> = {
  'Very Bullish': 'text-positive',
  Bullish: 'text-positive/80',
  Neutral: 'text-text-secondary',
  Bearish: 'text-negative/80',
  'Very Bearish': 'text-negative',
}

export function NewsSentimentPanel({ sentiment, compact }: NewsSentimentPanelProps) {
  const { t } = useLanguage()
  const Icon = sentiment.score > 10 ? TrendingUp : sentiment.score < -10 ? TrendingDown : Minus

  if (compact) {
    return (
      <span className={`font-mono text-[10px] ${LABEL_COLORS[sentiment.label]}`}>
        {t('sent_label')}: {sentiment.score > 0 ? '+' : ''}{sentiment.score}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${LABEL_COLORS[sentiment.label]}`} />
          <span className="font-mono text-sm font-bold text-text-primary">{t('sent_title')}</span>
        </div>
        <div className="text-right">
          <p className={`font-mono text-lg font-bold ${LABEL_COLORS[sentiment.label]}`}>
            {sentiment.score > 0 ? '+' : ''}{sentiment.score}
          </p>
          <p className={`text-[10px] font-mono ${LABEL_COLORS[sentiment.label]}`}>{sentiment.label}</p>
        </div>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
        <div className="bg-negative/60" style={{ width: `${sentiment.bearishCount / Math.max(sentiment.articles.length, 1) * 100}%` }} />
        <div className="bg-text-secondary/40" style={{ width: `${sentiment.neutralCount / Math.max(sentiment.articles.length, 1) * 100}%` }} />
        <div className="bg-positive/60" style={{ width: `${sentiment.bullishCount / Math.max(sentiment.articles.length, 1) * 100}%` }} />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-text-secondary">
        <span>{sentiment.bearishCount} {t('sent_bearish')}</span>
        <span>{t('sent_confidence')}: {sentiment.confidence}%</span>
        <span>{sentiment.bullishCount} {t('sent_bullish')}</span>
      </div>

      {sentiment.articles.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {sentiment.articles.slice(0, 6).map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] font-mono">
              <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1 ${
                a.label === 'bullish' ? 'bg-positive' : a.label === 'bearish' ? 'bg-negative' : 'bg-text-secondary'
              }`} />
              <span className="text-text-secondary line-clamp-2">{a.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
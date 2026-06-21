import type { PeerComparison } from '../../lib/analytics/peer-comparison'
import { useLanguage } from '../../lib/i18n/LanguageContext'

interface PeerComparisonPanelProps {
  comparison: PeerComparison
  onSelect?: (symbol: string) => void
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-positive', A: 'text-positive/90', 'B+': 'text-accent', B: 'text-text-primary',
  C: 'text-text-secondary', D: 'text-negative/70', F: 'text-negative',
}

export function PeerComparisonPanel({ comparison, onSelect }: PeerComparisonPanelProps) {
  const { t } = useLanguage()

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-text-primary">{t('peer_title')}</p>
          <p className="text-[10px] font-mono text-text-secondary">{comparison.sector}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold text-accent">#{comparison.rank}</p>
          <p className="text-[10px] font-mono text-text-secondary">
            {t('peer_of')} {comparison.totalPeers} · {comparison.percentile}th {t('peer_pct')}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {comparison.peers.map((p) => {
          const isActive = p.symbol === comparison.symbol
          return (
            <button
              key={p.symbol}
              onClick={() => onSelect?.(p.symbol)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg font-mono text-xs transition-colors ${
                isActive ? 'bg-accent/10 border border-accent/30' : 'hover:bg-white/5'
              }`}
            >
              <span className="w-5 text-text-secondary">#{p.rank}</span>
              <span className={`flex-1 text-left truncate ${isActive ? 'text-accent font-bold' : 'text-text-primary'}`}>
                {p.symbol.replace('.VN', '')}
              </span>
              <span className={`w-8 ${GRADE_COLORS[p.grade] ?? 'text-text-primary'}`}>{p.grade}</span>
              <span className="w-8 text-right text-accent">{p.quantScore}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
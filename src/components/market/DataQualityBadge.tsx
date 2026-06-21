import { CheckCircle2, AlertTriangle, Database } from 'lucide-react'
import type { DataSource } from '../../types'
import { useLanguage } from '../../lib/i18n/LanguageContext'

interface DataQualityBadgeProps {
  source: DataSource
  fetchedAt?: number
  compact?: boolean
}

export function DataQualityBadge({ source, fetchedAt, compact }: DataQualityBadgeProps) {
  const { t } = useLanguage()

  const config = {
    yahoo: { icon: CheckCircle2, color: 'text-positive', bg: 'bg-positive/10 border-positive/20', label: t('data_live') },
    cached: { icon: Database, color: 'text-accent', bg: 'bg-accent/10 border-accent/20', label: t('data_cached') },
    synthetic: { icon: AlertTriangle, color: 'text-negative', bg: 'bg-negative/10 border-negative/20', label: t('data_synthetic') },
  }[source]

  const age = fetchedAt ? Math.round((Date.now() - fetchedAt) / 1000) : null

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono border ${config.bg} ${config.color}`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${config.bg} ${config.color}`}>
      <config.icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {age != null && source === 'yahoo' && (
        <span className="text-text-secondary">· {age}s ago</span>
      )}
    </div>
  )
}
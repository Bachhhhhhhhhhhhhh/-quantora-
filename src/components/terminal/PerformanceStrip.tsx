import { motion } from 'framer-motion'
import type { PerformanceMetrics } from '../../types'

const PERIODS: { key: keyof PerformanceMetrics; label: string }[] = [
  { key: 'd1', label: '1D' },
  { key: 'w1', label: '1W' },
  { key: 'm1', label: '1M' },
  { key: 'm3', label: '3M' },
  { key: 'm6', label: '6M' },
  { key: 'ytd', label: 'YTD' },
  { key: 'y1', label: '1Y' },
  { key: 'y3', label: '3Y' },
  { key: 'y5', label: '5Y' },
  { key: 'max', label: 'MAX' },
]

interface PerformanceStripProps {
  perf: PerformanceMetrics | null
  volatility?: number
  avgVolume?: number
}

export function PerformanceStrip({ perf, volatility, avgVolume }: PerformanceStripProps) {
  if (!perf) return null

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 overflow-x-auto py-2 px-1 scrollbar-none"
    >
      {PERIODS.map(({ key, label }) => {
        const v = perf[key] as number
        if (typeof v !== 'number') return null
        const positive = v >= 0
        return (
          <div
            key={key}
            className={`flex flex-col items-center px-3 py-1.5 rounded-lg border min-w-[52px] transition-colors ${
              positive
                ? 'bg-positive/5 border-positive/20 hover:bg-positive/10'
                : 'bg-negative/5 border-negative/20 hover:bg-negative/10'
            }`}
          >
            <span className="text-[9px] font-mono text-text-secondary uppercase">{label}</span>
            <span className={`text-xs font-mono font-bold ${positive ? 'text-positive' : 'text-negative'}`}>
              {positive ? '+' : ''}{v.toFixed(2)}%
            </span>
          </div>
        )
      })}
      {volatility != null && (
        <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 min-w-[52px] ml-1">
          <span className="text-[9px] font-mono text-text-secondary">σ30D</span>
          <span className="text-xs font-mono font-bold text-accent">{volatility.toFixed(1)}%</span>
        </div>
      )}
      {avgVolume != null && avgVolume > 0 && (
        <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 min-w-[60px]">
          <span className="text-[9px] font-mono text-text-secondary">AVG VOL</span>
          <span className="text-xs font-mono font-bold text-text-primary">
            {avgVolume >= 1e6 ? `${(avgVolume / 1e6).toFixed(1)}M` : `${(avgVolume / 1e3).toFixed(0)}K`}
          </span>
        </div>
      )}
    </motion.div>
  )
}
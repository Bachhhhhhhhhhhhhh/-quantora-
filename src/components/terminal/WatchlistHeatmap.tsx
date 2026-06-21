import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PerformanceMetrics } from '../../types'
import { formatPrice, formatPercent } from '../../lib/utils'

type HeatPeriod = 'd1' | 'w1' | 'm1' | 'm3' | 'y1'

const PERIODS: { key: HeatPeriod; label: string }[] = [
  { key: 'd1', label: '1D' },
  { key: 'w1', label: '1W' },
  { key: 'm1', label: '1M' },
  { key: 'm3', label: '3M' },
  { key: 'y1', label: '1Y' },
]

interface WatchlistHeatmapProps {
  symbols: string[]
  performances: Record<string, PerformanceMetrics | null>
  quotes: Record<string, { price: number; changePct: number }>
  active: string
  onSelect: (sym: string) => void
}

function heatColor(pct: number): string {
  const intensity = Math.min(Math.abs(pct) / 5, 1)
  if (pct >= 0) return `rgba(52, 211, 153, ${0.08 + intensity * 0.35})`
  return `rgba(248, 113, 113, ${0.08 + intensity * 0.35})`
}

export function WatchlistHeatmap({ symbols, performances, quotes, active, onSelect }: WatchlistHeatmapProps) {
  const [period, setPeriod] = useState<HeatPeriod>('d1')

  return (
    <div className="space-y-3">
      <div className="flex gap-1 px-3">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              period === p.key ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-secondary hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 px-3 pb-3">
      {symbols.map((sym, i) => {
        const perf = performances[sym]
        const q = quotes[sym]
        const pct = perf?.[period] ?? q?.changePct ?? 0
        const isActive = sym === active

        return (
          <motion.button
            key={sym}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(sym)}
            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
              isActive ? 'border-accent/50 ring-1 ring-accent/30' : 'border-white/10'
            }`}
            style={{ backgroundColor: heatColor(pct) }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-sm text-text-primary">{sym.replace('.VN', '')}</span>
              {sym.endsWith('.VN') && <span className="text-[10px]">🇻🇳</span>}
            </div>
            {q && (
              <p className="font-mono text-xs text-text-secondary">{formatPrice(sym, q.price)}</p>
            )}
            <p className={`font-mono text-sm font-bold mt-1 ${pct >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatPercent(pct)}
            </p>
            {perf && period !== 'm1' && (
              <p className="font-mono text-[10px] text-text-secondary mt-0.5">
                1M: <span className={perf.m1 >= 0 ? 'text-positive' : 'text-negative'}>{formatPercent(perf.m1)}</span>
              </p>
            )}
          </motion.button>
        )
      })}
    </div>
    </div>
  )
}
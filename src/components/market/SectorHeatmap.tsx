import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FEATURED_TICKERS } from '../../data/market-featured'
import { getVNStock } from '../../data/vn-stocks'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatPercent } from '../../lib/utils'

interface SectorHeatmapProps {
  quotes: Record<string, { changePct: number }>
  performances: Record<string, { m1: number } | null>
  onSelect: (symbol: string) => void
}

export function SectorHeatmap({ quotes, performances, onSelect }: SectorHeatmapProps) {
  const { t, lang } = useLanguage()

  const sectors = useMemo(() => {
    const map = new Map<string, { tickers: string[]; changes: number[]; color: string }>()

    for (const tk of FEATURED_TICKERS) {
      const vn = getVNStock(tk.symbol)
      const sector = lang === 'vi'
        ? (vn?.sectorVi ?? tk.category.toUpperCase())
        : (vn?.sector ?? tk.category.toUpperCase())
      const q = quotes[tk.symbol]
      const perf = performances[tk.symbol]
      const change = q?.changePct ?? perf?.m1 ?? 0

      if (!map.has(sector)) map.set(sector, { tickers: [], changes: [], color: tk.color })
      const entry = map.get(sector)!
      entry.tickers.push(tk.symbol)
      entry.changes.push(change)
    }

    return [...map.entries()]
      .map(([name, data]) => ({
        name,
        avg: data.changes.reduce((a, b) => a + b, 0) / data.changes.length,
        count: data.tickers.length,
        top: data.tickers.reduce((best, sym) => {
          const c = quotes[sym]?.changePct ?? 0
          return c > (quotes[best]?.changePct ?? -999) ? sym : best
        }, data.tickers[0]),
        color: data.color,
      }))
      .sort((a, b) => b.avg - a.avg)
  }, [quotes, performances, lang])

  return (
    <div className="mb-8">
      <p className="text-xs font-mono text-accent uppercase tracking-wider mb-3">{t('sector_heatmap')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {sectors.map((s, i) => {
          const intensity = Math.min(Math.abs(s.avg) / 4, 1)
          const bg = s.avg >= 0
            ? `rgba(52, 211, 153, ${0.06 + intensity * 0.25})`
            : `rgba(248, 113, 113, ${0.06 + intensity * 0.25})`
          return (
            <motion.button
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(s.top)}
              className="p-3 rounded-xl border border-white/10 hover:border-accent/30 text-left transition-all"
              style={{ backgroundColor: bg }}
            >
              <p className="text-[10px] font-mono text-text-secondary truncate">{s.name}</p>
              <p className={`text-lg font-bold font-mono ${s.avg >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatPercent(s.avg)}
              </p>
              <p className="text-[9px] font-mono text-text-secondary mt-1">{s.count} {t('market_assets')}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
import { useState, useMemo } from 'react'
import { Filter, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useData } from '../../lib/DataContext'
import { FEATURED_TICKERS } from '../../data/market-featured'
import { screenStocks, SCREENER_PRESETS, type ScreenerFilter } from '../../lib/analytics/screener'
import { formatPercent } from '../../lib/utils'

interface StockScreenerProps {
  onSelect: (symbol: string) => void
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-positive/20 text-positive border-positive/30',
  A: 'bg-positive/15 text-positive border-positive/20',
  'B+': 'bg-accent/15 text-accent border-accent/25',
  B: 'bg-white/5 text-text-primary border-white/10',
  C: 'bg-white/5 text-text-secondary border-white/10',
  D: 'bg-negative/10 text-negative/80 border-negative/20',
  F: 'bg-negative/15 text-negative border-negative/30',
}

export function StockScreener({ onSelect }: StockScreenerProps) {
  const { t } = useLanguage()
  const { quotes, fundamentals, performances, getOHLC } = useData()
  const [filters, setFilters] = useState<ScreenerFilter>({ minQuantScore: 60 })
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const results = useMemo(
    () => screenStocks(FEATURED_TICKERS, quotes, fundamentals, performances, getOHLC, filters),
    [quotes, fundamentals, performances, getOHLC, filters],
  )

  const applyPreset = (id: string) => {
    const preset = SCREENER_PRESETS.find((p) => p.id === id)
    if (preset) {
      setFilters(preset.filters)
      setActivePreset(id)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/30">
        <Filter className="w-4 h-4 text-accent" />
        <span className="font-mono text-sm font-bold text-text-primary">{t('screen_title')}</span>
        <span className="ml-auto font-mono text-xs text-accent">{results.length} {t('screen_matches')}</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {SCREENER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase border transition-all ${
                activePreset === p.id ? 'bg-accent/15 text-accent border-accent/30' : 'bg-white/5 text-text-secondary border-white/10 hover:border-white/20'
              }`}
            >
              {t(p.labelKey as 'screen_quality')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="space-y-1">
            <span className="text-[10px] font-mono text-text-secondary">{t('screen_min_score')}</span>
            <input
              type="range" min={0} max={90} step={5}
              value={filters.minQuantScore ?? 0}
              onChange={(e) => { setActivePreset(null); setFilters((f) => ({ ...f, minQuantScore: +e.target.value })) }}
              className="w-full accent-accent"
            />
            <span className="text-xs font-mono text-accent">{filters.minQuantScore ?? 0}+</span>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-mono text-text-secondary">{t('screen_min_mom')}</span>
            <input
              type="range" min={-20} max={30} step={1}
              value={filters.minMomentum ?? -20}
              onChange={(e) => { setActivePreset(null); setFilters((f) => ({ ...f, minMomentum: +e.target.value })) }}
              className="w-full accent-accent"
            />
            <span className="text-xs font-mono text-accent">{filters.minMomentum ?? -20}%+</span>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-mono text-text-secondary">{t('screen_max_pe')}</span>
            <input
              type="range" min={5} max={80} step={5}
              value={filters.maxPE ?? 80}
              onChange={(e) => { setActivePreset(null); setFilters((f) => ({ ...f, maxPE: +e.target.value })) }}
              className="w-full accent-accent"
            />
            <span className="text-xs font-mono text-accent">≤{filters.maxPE ?? 80}</span>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-mono text-text-secondary">{t('screen_min_roe')}</span>
            <input
              type="range" min={0} max={40} step={2}
              value={filters.minROE ?? 0}
              onChange={(e) => { setActivePreset(null); setFilters((f) => ({ ...f, minROE: +e.target.value })) }}
              className="w-full accent-accent"
            />
            <span className="text-xs font-mono text-accent">{filters.minROE ?? 0}%+</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-text-secondary border-b border-white/5">
                <th className="text-left py-2 px-2">{t('screen_symbol')}</th>
                <th className="text-center py-2">{t('quant_score')}</th>
                <th className="text-right py-2">{t('screen_change')}</th>
                <th className="text-right py-2 hidden md:table-cell">P/E</th>
                <th className="text-right py-2 hidden md:table-cell">ROE</th>
                <th className="text-right py-2 hidden lg:table-cell">{t('quant_momentum')}</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 15).map((r) => (
                <tr
                  key={r.symbol}
                  onClick={() => onSelect(r.symbol)}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-2">
                    <span className="mr-1">{r.flag}</span>
                    <span className="font-bold text-text-primary">{r.symbol.replace('.VN', '')}</span>
                    <span className="text-text-secondary ml-2 hidden sm:inline">{r.name}</span>
                  </td>
                  <td className="text-center py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${GRADE_COLORS[r.grade] ?? ''}`}>
                      {r.grade} · {r.quantScore}
                    </span>
                  </td>
                  <td className={`text-right py-2.5 ${r.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {formatPercent(r.changePct)}
                  </td>
                  <td className="text-right py-2.5 text-text-secondary hidden md:table-cell">{r.pe?.toFixed(1) ?? '—'}</td>
                  <td className="text-right py-2.5 text-text-secondary hidden md:table-cell">{r.roe != null ? `${r.roe.toFixed(1)}%` : '—'}</td>
                  <td className={`text-right py-2.5 hidden lg:table-cell ${r.momentum >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {r.momentum.toFixed(1)}%
                  </td>
                  <td className="py-2.5"><ChevronRight className="w-3 h-3 text-text-secondary" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && (
            <p className="text-center py-8 font-mono text-sm text-text-secondary">{t('screen_no_match')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, Loader2, TrendingUp, Building2 } from 'lucide-react'
import type { SearchResult } from '../../types'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatCurrency, formatPercent } from '../../lib/utils'

interface TickerSearchProps {
  onSelect: (symbol: string) => void
  search: (q: string) => Promise<SearchResult[]>
}

const TYPE_COLORS: Record<string, string> = {
  equity: 'text-accent',
  etf: 'text-purple-400',
  crypto: 'text-orange-400',
  index: 'text-yellow-400',
  forex: 'text-green-400',
}

export function TickerSearch({ onSelect, search }: TickerSearchProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [focused, setFocused] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const doSearch = useCallback(async (q: string) => {
    if (!q || !q.trim()) { setResults([]); return }
    setSearching(true)
    const r = await search(q)
    setResults(r)
    setSearching(false)
    setHighlight(0)
  }, [search])

  const handleChange = (q: string) => {
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(q), 120)
  }

  const select = (sym: string) => {
    onSelect(sym)
    setQuery('')
    setResults([])
    setFocused(false)
    inputRef.current?.blur()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (!focused || results.length === 0) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); select(results[highlight].symbol) }
      if (e.key === 'Escape') { setFocused(false); setResults([]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focused, results, highlight])

  return (
    <div className="relative w-full lg:w-[520px]">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200 font-mono text-sm ${
        focused
          ? 'bg-black/60 border-accent/40 shadow-[0_0_30px_rgba(34,211,238,0.12)]'
          : 'bg-black/40 border-white/10 hover:border-white/20'
      }`}>
        <Command className="w-4 h-4 text-accent/60 shrink-0" />
        <Search className="w-4 h-4 text-text-secondary shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={t('term_search_any')}
          className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-secondary/50 text-sm"
        />
        {searching
          ? <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
          : <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-secondary border border-white/10">⌘K</kbd>
        }
      </div>

      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#0d1526]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                {results.length} {t('search_results')}
              </span>
              <span className="text-[10px] font-mono text-text-secondary">↑↓ Enter · Esc</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={r.symbol}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(r.symbol)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0 ${
                    i === highlight ? 'bg-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-base">
                    {r.flag ?? <Building2 className="w-4 h-4 text-text-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-accent text-sm">{r.symbol}</span>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${TYPE_COLORS[r.type]} bg-white/5`}>
                        {r.type}
                      </span>
                      {r.exchange && (
                        <span className="text-[10px] font-mono text-text-secondary">{r.exchange}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">{r.name}</p>
                    {r.sector && (
                      <p className="text-[10px] font-mono text-text-secondary/60">{r.sector}</p>
                    )}
                  </div>
                  {r.price != null && (
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm text-text-primary">
                        {r.symbol.endsWith('.VN')
                          ? `${r.price.toLocaleString('vi-VN')} ₫`
                          : formatCurrency(r.price)}
                      </p>
                      {r.changePct != null && (
                        <p className={`font-mono text-xs ${r.changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                          <TrendingUp className="w-3 h-3 inline" />
                          {formatPercent(r.changePct)}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
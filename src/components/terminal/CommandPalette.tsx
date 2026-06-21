import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Terminal, BarChart3, FlaskConical, Database, Zap } from 'lucide-react'
import type { SearchResult } from '../../types'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { scrollToSection } from '../../lib/utils'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onSelectSymbol: (symbol: string) => void
  search: (q: string) => Promise<SearchResult[]>
}

const COMMANDS = [
  { id: 'terminal', icon: Terminal, section: 'terminal', labelKey: 'nav_terminal' as const },
  { id: 'market', icon: BarChart3, section: 'market', labelKey: 'nav_market' as const },
  { id: 'simulator', icon: FlaskConical, section: 'simulator', labelKey: 'nav_simulator' as const },
  { id: 'signals', icon: Zap, section: 'terminal', labelKey: 'term_signals' as const },
  { id: 'data', icon: Database, section: 'terminal', labelKey: 'term_data' as const },
]

export function CommandPalette({ open, onClose, onSelectSymbol, search }: CommandPaletteProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); return }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      const items = query.length >= 2 ? results : []
      const total = items.length + COMMANDS.length
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % total) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + total) % total) }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (highlight < COMMANDS.length) {
          scrollToSection(COMMANDS[highlight].section)
          onClose()
        } else {
          const r = results[highlight - COMMANDS.length]
          if (r) { onSelectSymbol(r.symbol); onClose() }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, query, results, highlight, onClose, onSelectSymbol])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setResults(await search(q))
    setHighlight(0)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 150)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-accent" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('cmd_search')}
                className="flex-1 bg-transparent text-text-primary font-mono text-sm outline-none placeholder:text-text-secondary"
              />
              <kbd className="text-[10px] font-mono text-text-secondary px-2 py-0.5 rounded bg-white/5 border border-white/10">{t('cmd_hint')}</kbd>
              <kbd className="text-[10px] font-mono text-text-secondary px-2 py-0.5 rounded bg-white/5 border border-white/10">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <p className="text-[10px] font-mono text-text-secondary px-2 py-1 uppercase">{t('cmd_navigate')}</p>
              {COMMANDS.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => { scrollToSection(cmd.section); onClose() }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-mono text-sm ${
                    highlight === i ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-white/5'
                  }`}
                >
                  <cmd.icon className="w-4 h-4" />
                  {t(cmd.labelKey)}
                </button>
              ))}
              {results.length > 0 && (
                <>
                  <p className="text-[10px] font-mono text-text-secondary px-2 py-1 mt-2 uppercase">{t('cmd_tickers')}</p>
                  {results.map((r, i) => (
                    <button
                      key={r.symbol}
                      onClick={() => { onSelectSymbol(r.symbol); onClose() }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-mono text-sm ${
                        highlight === COMMANDS.length + i ? 'bg-accent/10 text-accent' : 'hover:bg-white/5'
                      }`}
                    >
                      <span>{r.flag} {r.symbol}</span>
                      <span className="text-text-secondary text-xs truncate ml-2">{r.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
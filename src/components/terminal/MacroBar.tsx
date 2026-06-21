import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchMacroQuotes, type MacroQuote } from '../../lib/market-data-extended'
import { formatPercent } from '../../lib/utils'

export function MacroBar() {
  const [quotes, setQuotes] = useState<MacroQuote[]>([])

  useEffect(() => {
    fetchMacroQuotes().then(setQuotes)
    const interval = setInterval(() => fetchMacroQuotes().then(setQuotes), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (quotes.length === 0) return null

  const items = [...quotes, ...quotes]

  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-black/40 py-1.5">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 whitespace-nowrap"
      >
        {items.map((q, i) => (
          <div key={`${q.symbol}-${i}`} className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-text-secondary">{q.label}</span>
            <span className="text-text-primary font-semibold">
              {q.price >= 1000 ? q.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : q.price.toFixed(2)}
            </span>
            <span className={q.changePct >= 0 ? 'text-positive' : 'text-negative'}>
              {formatPercent(q.changePct)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
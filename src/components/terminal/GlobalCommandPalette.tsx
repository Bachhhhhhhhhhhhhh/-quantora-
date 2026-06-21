import { useState, useEffect, useCallback } from 'react'
import { useData } from '../../lib/DataContext'
import { scrollToSection } from '../../lib/utils'
import { CommandPalette } from './CommandPalette'

export function GlobalCommandPalette() {
  const { search, setActiveSymbol, addToWatchlist, loadAllForSymbol } = useData()
  const [open, setOpen] = useState(false)

  const selectSymbol = useCallback((sym: string) => {
    scrollToSection('terminal')
    setActiveSymbol(sym)
    addToWatchlist(sym)
    loadAllForSymbol(sym)
  }, [setActiveSymbol, addToWatchlist, loadAllForSymbol])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
      onSelectSymbol={selectSymbol}
      search={search}
    />
  )
}
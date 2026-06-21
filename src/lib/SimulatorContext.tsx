import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { SimulatorPrefill } from '../types'
import { scrollToSection } from './utils'

interface SimulatorContextValue {
  prefill: SimulatorPrefill | null
  setPrefill: (prefill: SimulatorPrefill) => void
  navigateToSimulator: (prefill?: SimulatorPrefill) => void
  clearPrefill: () => void
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null)

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefillState] = useState<SimulatorPrefill | null>(null)

  const setPrefill = useCallback((p: SimulatorPrefill) => {
    setPrefillState(p)
  }, [])

  const clearPrefill = useCallback(() => setPrefillState(null), [])

  const navigateToSimulator = useCallback((p?: SimulatorPrefill) => {
    if (p) setPrefillState(p)
    scrollToSection('simulator')
  }, [])

  return (
    <SimulatorContext.Provider
      value={{ prefill, setPrefill, navigateToSimulator, clearPrefill }}
    >
      {children}
    </SimulatorContext.Provider>
  )
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext)
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider')
  return ctx
}
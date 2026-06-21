import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useSimulator } from '../../lib/SimulatorContext'
import { SectionHeader } from '../ui/SectionHeader'
import { MonteCarloTab } from '../simulator/MonteCarloTab'
import { BacktesterTab } from '../simulator/BacktesterTab'

type Tab = 'monte_carlo' | 'backtest'

export function SimulatorSection() {
  const { t } = useLanguage()
  const { prefill, clearPrefill } = useSimulator()
  const [tab, setTab] = useState<Tab>('backtest')

  useEffect(() => {
    if (prefill) {
      const mapped = prefill.tab === 'monte_carlo' ? 'monte_carlo' : 'backtest'
      setTab(mapped)
      const timer = setTimeout(clearPrefill, 500)
      return () => clearTimeout(timer)
    }
  }, [prefill, clearPrefill])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'monte_carlo', label: t('sim_tab_monte') },
    { id: 'backtest', label: t('sim_tab_backtest') },
  ]

  return (
    <section id="simulator" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t('sim_title')} subtitle={t('sim_subtitle')} />

        <div className="glass-card p-2 mb-8 inline-flex rounded-2xl">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`relative px-6 py-3 text-sm font-medium rounded-xl transition-colors ${
                tab === tb.id ? 'text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === tb.id && (
                <motion.div
                  layoutId="sim-tab-bg"
                  className="absolute inset-0 bg-accent rounded-xl"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span className="relative z-10">{tb.label}</span>
            </button>
          ))}
        </div>

        <div className="glass-card p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 'monte_carlo' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'monte_carlo' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {tab === 'monte_carlo' ? (
                <MonteCarloTab prefill={prefill?.monteCarlo} />
              ) : (
                <BacktesterTab
                  prefillAsset={prefill?.asset}
                  prefillStrategy={prefill?.strategy}
                  prefillParams={prefill?.params}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Play } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useSimulator } from '../../lib/SimulatorContext'
import type { StrategyType } from '../../types'
import { SectionHeader } from '../ui/SectionHeader'
import { Button } from '../ui/Button'

const STRATEGIES = [
  { id: 'sma_crossover' as StrategyType, nameKey: 'strat_sma_name' as const, descKey: 'strat_sma_desc' as const, mathKey: 'strat_sma_math' as const },
  { id: 'rsi_mean_reversion' as StrategyType, nameKey: 'strat_rsi_name' as const, descKey: 'strat_rsi_desc' as const, mathKey: 'strat_rsi_math' as const },
  { id: 'bollinger_rsi' as StrategyType, nameKey: 'strat_bb_name' as const, descKey: 'strat_bb_desc' as const, mathKey: 'strat_bb_math' as const },
  { nameKey: 'lib_momentum_name' as const, descKey: 'lib_momentum_desc' as const, mathKey: 'lib_momentum_math' as const, strategy: 'sma_crossover' as StrategyType },
  { nameKey: 'lib_pairs_name' as const, descKey: 'lib_pairs_desc' as const, mathKey: 'lib_pairs_math' as const, strategy: 'rsi_mean_reversion' as StrategyType },
  { nameKey: 'lib_mean_rev_name' as const, descKey: 'lib_mean_rev_desc' as const, mathKey: 'lib_mean_rev_math' as const, strategy: 'rsi_mean_reversion' as StrategyType },
  { nameKey: 'lib_vol_break_name' as const, descKey: 'lib_vol_break_desc' as const, mathKey: 'lib_vol_break_math' as const, strategy: 'sma_crossover' as StrategyType },
  { nameKey: 'lib_stat_arb_name' as const, descKey: 'lib_stat_arb_desc' as const, mathKey: 'lib_stat_arb_math' as const, strategy: 'bollinger_rsi' as StrategyType },
]

export function StrategiesSection() {
  const { t } = useLanguage()
  const { navigateToSimulator } = useSimulator()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const tryStrategy = (strategy: StrategyType) => {
    navigateToSimulator({ tab: 'backtest', strategy, asset: 'AAPL' })
  }

  return (
    <section id="strategies" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t('lib_title')} subtitle={t('lib_subtitle')} />

        <div className="space-y-3">
          {STRATEGIES.map((strat, i) => {
            const isOpen = openIndex === i
            const strategyId: StrategyType = ('id' in strat ? strat.id : strat.strategy) ?? 'sma_crossover'

            return (
              <motion.div
                key={strat.nameKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-text-primary">{t(strat.nameKey)}</span>
                  <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                        <p className="text-text-secondary leading-relaxed">{t(strat.descKey)}</p>
                        <code className="block text-sm text-accent bg-white/5 px-4 py-3 rounded-xl font-mono">
                          {t(strat.mathKey)}
                        </code>
                        <Button size="sm" onClick={() => tryStrategy(strategyId)}>
                          <Play className="w-4 h-4" />
                          {t('lib_try')}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
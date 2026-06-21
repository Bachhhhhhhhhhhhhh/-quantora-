import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, TrendingUp } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useSimulator } from '../../lib/SimulatorContext'
import { scrollToSection } from '../../lib/utils'
import { Button } from '../ui/Button'

const NAV_ITEMS = [
  { key: 'nav_home' as const, section: 'home' },
  { key: 'nav_terminal' as const, section: 'terminal' },
  { key: 'nav_simulator' as const, section: 'simulator' },
  { key: 'nav_market' as const, section: 'market' },
  { key: 'nav_strategies' as const, section: 'strategies' },
  { key: 'nav_about' as const, section: 'about' },
]

export function Navbar() {
  const { t, lang, setLang } = useLanguage()
  const { navigateToSimulator } = useSimulator()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (section: string) => {
    setMobileOpen(false)
    if (section === 'simulator') navigateToSimulator()
    else scrollToSection(section)
  }

  return (
    <motion.nav
      initial={false}
      className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2 group"
          >
            <TrendingUp className="w-6 h-6 text-accent group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="text-xl font-bold glow-accent text-text-primary">Quantora</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.section)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-white/5"
              >
                {t(item.key)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              {(['en', 'vi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    lang === l
                      ? 'bg-accent text-bg-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => navigateToSimulator()}
            >
              {t('nav_launch')}
            </Button>

            <button
              className="md:hidden p-2 text-text-secondary hover:text-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-bg-primary/95 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.section)}
                  className="block w-full text-left px-4 py-3 text-text-secondary hover:text-accent hover:bg-white/5 rounded-xl transition-colors"
                >
                  {t(item.key)}
                </button>
              ))}
              <Button className="w-full mt-2" onClick={() => { setMobileOpen(false); navigateToSimulator() }}>
                {t('nav_launch')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
import { motion } from 'framer-motion'
import { ArrowRight, Terminal, Activity, Cpu, Globe, Database } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { useData } from '../../lib/DataContext'
import { scrollToSection, formatPrice, formatPercent } from '../../lib/utils'
import { Button } from '../ui/Button'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

const STATS = [
  { key: 'hero_stat_strategies' as const, icon: Activity, value: '9' },
  { key: 'hero_stat_models' as const, icon: Cpu, value: '3' },
  { key: 'hero_stat_indicators' as const, icon: Terminal, value: '12+' },
  { key: 'hero_stat_universal' as const, icon: Globe, value: '174' },
]

const LIVE_TICKERS = ['NVDA', 'AAPL', 'VNM.VN', 'HPG.VN', 'BTC-USD', 'VNINDEX.VN']

export function Hero() {
  const { t } = useLanguage()
  const { quotes } = useData()

  const liveLines = LIVE_TICKERS.map((sym) => {
    const q = quotes[sym]
    if (!q) return null
    return `${sym} ${formatPrice(sym, q.price)} ${formatPercent(q.changePct)}`
  }).filter(Boolean)

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden scanline">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-positive/5 rounded-full blur-3xl" />

      {/* Live ticker tape */}
      <div className="absolute right-0 top-20 bottom-20 w-72 hidden xl:block overflow-hidden">
        <div className="opacity-30 font-mono text-[10px]">
          {(liveLines.length ? liveLines : ['Loading live feed...']).concat(liveLines).map((line, i) => (
            <motion.div
              key={`${line}-${i}`}
              animate={{ y: [0, -400] }}
              transition={{ duration: 20 + i * 2, repeat: Infinity, ease: 'linear' }}
              className={`whitespace-nowrap py-1 ${line?.includes('+') ? 'text-positive' : line?.includes('-') ? 'text-negative' : 'text-accent'}`}
            >
              [{new Date().toISOString().slice(11, 19)}] {line}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div variants={stagger} initial={false} animate="show">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 border border-accent/20 mb-8 font-mono">
            <Terminal className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent">QUANTORA TERMINAL v5.0</span>
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span className="text-xs text-text-secondary">LIVE DATA</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.05] mb-6 font-mono tracking-tight"
          >
            {t('hero_headline')}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base md:text-lg text-text-secondary max-w-3xl mb-10 leading-relaxed font-mono">
            {t('hero_subheadline')}
          </motion.p>

          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-2xl">
            {STATS.map((s) => (
              <div key={s.key} className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-accent/20 transition-colors">
                <s.icon className="w-4 h-4 text-accent mb-2" />
                <p className="text-xl font-bold font-mono text-text-primary">{s.value}</p>
                <p className="text-[10px] text-text-secondary font-mono uppercase">{t(s.key)}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
            <Button size="lg" onClick={() => scrollToSection('terminal')}>
              {t('hero_cta_simulate')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection('market')}>
              <Database className="w-5 h-5" />
              {t('hero_cta_market')}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => scrollToSection('strategies')}>
              {t('hero_cta_explore')}
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3 text-xs text-text-secondary font-mono">
            <div className="h-px flex-1 max-w-[40px] bg-accent/30" />
            <span>{t('hero_trust')}</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
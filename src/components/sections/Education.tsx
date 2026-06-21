import { motion } from 'framer-motion'
import { BarChart3, FlaskConical, Globe, Languages } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'

const features = [
  { icon: FlaskConical, titleKey: 'edu_feature_sim_title' as const, descKey: 'edu_feature_sim_desc' as const },
  { icon: BarChart3, titleKey: 'edu_feature_backtest_title' as const, descKey: 'edu_feature_backtest_desc' as const },
  { icon: Globe, titleKey: 'edu_feature_market_title' as const, descKey: 'edu_feature_market_desc' as const },
  { icon: Languages, titleKey: 'edu_feature_bilingual_title' as const, descKey: 'edu_feature_bilingual_desc' as const },
]

export function Education() {
  const { t } = useLanguage()

  return (
    <section className="py-24 bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {t('edu_what_title')}
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
            {t('edu_what_desc')}
          </p>
        </motion.div>

        <SectionHeader title={t('edu_why_title')} />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t(f.titleKey)}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{t(f.descKey)}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
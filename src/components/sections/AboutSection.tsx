import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Link, Mail, Send, Cpu, Database, LineChart } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { SectionHeader } from '../ui/SectionHeader'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

const TAGS = [
  'about_tag_backtest',
  'about_tag_stat_arb',
  'about_tag_web',
  'about_tag_quant',
  'about_tag_risk',
] as const

const EXPERTISE_COLORS = ['#22D3EE', '#34D399', '#A78BFA', '#FBBF24', '#F87171']

export function AboutSection() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return
    toast.success(t('about_sent'))
    setEmail('')
    setMessage('')
  }

  return (
    <section id="about" className="py-24 bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t('about_title')} />

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Abstract quant visualization — NO avatar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-square max-w-md mx-auto lg:mx-0 border border-white/10 bg-black/40">
              <div className="absolute inset-0 grid-bg opacity-50" />
              {/* Animated quant mesh */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2
                  const x1 = 200 + Math.cos(angle) * 80
                  const y1 = 200 + Math.sin(angle) * 80
                  const x2 = 200 + Math.cos(angle + 0.5) * 150
                  const y2 = 200 + Math.sin(angle + 0.5) * 150
                  return (
                    <motion.line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="rgba(34,211,238,0.2)"
                      strokeWidth="1"
                      initial={{ opacity: 0.1 }}
                      animate={{ opacity: [0.1, 0.5, 0.1] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity }}
                    />
                  )
                })}
                <motion.circle
                  cx="200" cy="200" r="60"
                  fill="none" stroke="#22D3EE" strokeWidth="1.5"
                  animate={{ r: [55, 65, 55], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.circle
                  cx="200" cy="200" r="30"
                  fill="rgba(34,211,238,0.1)" stroke="#22D3EE" strokeWidth="2"
                />
                <text x="200" y="195" textAnchor="middle" fill="#22D3EE" fontSize="28" fontFamily="monospace" fontWeight="bold">Q</text>
                <text x="200" y="220" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">QUANTORA ENGINE</text>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-primary to-transparent">
                <h3 className="text-2xl font-bold text-text-primary">{t('about_name')}</h3>
                <p className="text-accent text-sm mt-1 font-mono">{t('about_role')}</p>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {[Cpu, Database, LineChart].map((Icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-8"
          >
            <p className="text-text-secondary text-lg leading-relaxed">{t('about_bio')}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="text-accent font-semibold mb-2">{t('about_vision_title')}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">{t('about_vision')}</p>
              </Card>
              <Card className="p-6">
                <h4 className="text-accent font-semibold mb-2">{t('about_mission_title')}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">{t('about_mission')}</p>
              </Card>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-3">{t('about_expertise')}</p>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag, i) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full text-sm font-medium border font-mono"
                    style={{
                      borderColor: EXPERTISE_COLORS[i] + '44',
                      color: EXPERTISE_COLORS[i],
                      backgroundColor: EXPERTISE_COLORS[i] + '11',
                    }}
                  >
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              {[
                { icon: Link, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: Code2, href: 'https://github.com', label: 'GitHub' },
                { icon: Mail, href: 'mailto:contact@quantora.dev', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 transition-all"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <Card className="p-6">
              <h4 className="font-semibold text-text-primary mb-4">{t('about_contact')}</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder={t('about_email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50 font-mono text-sm"
                />
                <textarea
                  placeholder={t('about_message_placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50 resize-none font-mono text-sm"
                />
                <Button type="submit">
                  <Send className="w-4 h-4" />
                  {t('about_send')}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
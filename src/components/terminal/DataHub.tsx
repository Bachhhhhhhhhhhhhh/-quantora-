import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Users, Newspaper, TrendingUp, FileText, PieChart, ExternalLink,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { TickerDeepData, PerformanceMetrics, CompanyFundamentals } from '../../types'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { formatNumber, formatPrice } from '../../lib/utils'

type DataTab = 'earnings' | 'analysts' | 'financials' | 'holders' | 'news' | 'ratios'

interface DataHubProps {
  deep: TickerDeepData | null
  fundamentals: CompanyFundamentals | null
  performance: PerformanceMetrics | null
  symbol?: string
  loading?: boolean
}

const ANALYST_COLORS = ['#34D399', '#22D3EE', '#94A3B8', '#FBBF24', '#F87171']

export function DataHub({ deep, fundamentals, performance, symbol, loading }: DataHubProps) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<DataTab>('earnings')

  const tabs: { id: DataTab; icon: typeof BarChart3; label: string }[] = [
    { id: 'earnings', icon: TrendingUp, label: t('data_earnings') },
    { id: 'analysts', icon: Users, label: t('data_analysts') },
    { id: 'financials', icon: FileText, label: t('data_financials') },
    { id: 'holders', icon: PieChart, label: t('data_holders') },
    { id: 'ratios', icon: BarChart3, label: t('data_ratios') },
    { id: 'news', icon: Newspaper, label: t('data_news') },
  ]

  if (loading && !deep) {
    return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!deep) {
    return (
      <div className="p-8 text-center text-text-secondary font-mono text-sm">
        {t('data_loading')}
      </div>
    )
  }

  const analystChart = [
    { name: 'Strong Buy', value: deep.analyst.strongBuy, color: ANALYST_COLORS[0] },
    { name: 'Buy', value: deep.analyst.buy, color: ANALYST_COLORS[1] },
    { name: 'Hold', value: deep.analyst.hold, color: ANALYST_COLORS[2] },
    { name: 'Sell', value: deep.analyst.sell, color: ANALYST_COLORS[3] },
    { name: 'Strong Sell', value: deep.analyst.strongSell, color: ANALYST_COLORS[4] },
  ].filter((d) => d.value > 0)

  const ratioCards = [
    { l: 'EV/EBITDA', v: deep.evToEbitda },
    { l: 'EV/Revenue', v: deep.evToRevenue },
    { l: 'P/S', v: deep.priceToSales },
    { l: 'P/E (Fwd)', v: fundamentals?.forwardPe },
    { l: 'P/E (TTM)', v: fundamentals?.pe },
    { l: 'P/B', v: fundamentals?.pb },
    { l: 'PEG', v: fundamentals?.peg },
    { l: 'Current Ratio', v: deep.currentRatio },
    { l: 'Quick Ratio', v: deep.quickRatio },
    { l: 'D/E', v: deep.debtToEquity },
    { l: 'Short %', v: deep.shortPercent },
    { l: 'Short Ratio', v: deep.shortRatio },
    { l: 'Payout', v: deep.payoutRatio, s: '%' },
    { l: 'Beta', v: fundamentals?.beta },
    { l: 'ROE', v: fundamentals?.roe, s: '%' },
    { l: 'ROA', v: fundamentals?.roa, s: '%' },
    { l: 'Gross Margin', v: fundamentals?.grossMargin, s: '%' },
    { l: 'Op. Margin', v: fundamentals?.operatingMargin, s: '%' },
    { l: 'Profit Margin', v: fundamentals?.profitMargin, s: '%' },
    { l: 'Rev Growth', v: fundamentals?.revenueGrowth, s: '%' },
    { l: 'σ 30D', v: performance?.volatility30d, s: '%' },
    { l: 'Book Value', v: deep.bookValue },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              tab === tb.id ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-secondary hover:bg-white/5'
            }`}
          >
            <tb.icon className="w-3.5 h-3.5" />
            {tb.label}
          </button>
        ))}
      </div>

      {deep.nextEarningsDate && (
        <div className="px-4 py-2 rounded-xl bg-accent/5 border border-accent/20 font-mono text-xs flex items-center gap-4">
          <span className="text-accent font-semibold">{t('data_next_earnings')}: {deep.nextEarningsDate}</span>
          {deep.epsEstimate != null && <span className="text-text-secondary">EPS Est: {formatNumber(deep.epsEstimate)}</span>}
          {deep.revenueEstimate && <span className="text-text-secondary">Rev Est: {deep.revenueEstimate}</span>}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {tab === 'earnings' && (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="bg-white/5 text-text-secondary">
                    <th className="text-left p-3">{t('data_period')}</th>
                    <th className="text-right p-3">EPS Actual</th>
                    <th className="text-right p-3">EPS Est.</th>
                    <th className="text-right p-3">Surprise</th>
                  </tr>
                </thead>
                <tbody>
                  {deep.earnings.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-text-secondary">{t('data_no_data')}</td></tr>
                  ) : deep.earnings.map((e) => (
                    <tr key={e.period} className="border-t border-white/5 hover:bg-white/5">
                      <td className="p-3 text-text-primary">{e.period}</td>
                      <td className="p-3 text-right text-accent">{e.actual?.toFixed(2) ?? '—'}</td>
                      <td className="p-3 text-right text-text-secondary">{e.estimate?.toFixed(2) ?? '—'}</td>
                      <td className={`p-3 text-right font-semibold ${(e.surprise ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {e.surprise != null ? `${e.surprise >= 0 ? '+' : ''}${e.surprise.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'analysts' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-56 rounded-xl bg-black/30 border border-white/5 p-3">
                <p className="text-xs font-mono text-text-secondary mb-2">{t('data_analyst_consensus')} ({deep.analyst.total})</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={analystChart} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={70} />
                    <Tooltip contentStyle={{ background: '#0f172a', fontFamily: 'monospace', fontSize: 11 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {analystChart.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {analystChart.map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5">
                    <span className="font-mono text-xs text-text-secondary">{a.name}</span>
                    <span className="font-mono text-sm font-bold" style={{ color: a.color }}>{a.value}</span>
                  </div>
                ))}
                {fundamentals?.targetPrice && (
                  <div className="p-3 rounded-xl bg-positive/5 border border-positive/20 mt-4">
                    <p className="text-[10px] font-mono text-text-secondary">{t('intel_target')}</p>
                    <p className="font-mono text-lg font-bold text-positive">
                      {symbol ? formatPrice(symbol, fundamentals.targetPrice) : `$${fundamentals.targetPrice.toFixed(2)}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'financials' && (
            <div className="space-y-4">
              {[
                { title: t('data_income'), rows: deep.incomeStatement, fields: ['totalRevenue', 'grossProfit', 'operatingIncome', 'netIncome', 'ebitda'] },
                { title: t('data_balance'), rows: deep.balanceSheet, fields: ['totalAssets', 'totalLiab', 'totalStockholderEquity', 'cash', 'longTermDebt'] },
                { title: t('data_cashflow'), rows: deep.cashflow, fields: ['totalCashFromOperatingActivities', 'capitalExpenditures', 'dividendsPaid', 'freeCashFlow'] },
              ].map((section) => section.rows.length > 0 && (
                <div key={section.title}>
                  <p className="text-xs font-mono text-accent mb-2 uppercase tracking-wider">{section.title}</p>
                  <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full font-mono text-[11px]">
                      <thead>
                        <tr className="bg-white/5 text-text-secondary">
                          <th className="text-left p-2">{t('data_metric')}</th>
                          {section.rows.map((r) => <th key={r.date} className="text-right p-2">{r.date}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {section.fields.map((f) => (
                          <tr key={f} className="border-t border-white/5 hover:bg-white/5">
                            <td className="p-2 text-text-secondary">{f.replace(/([A-Z])/g, ' $1').trim()}</td>
                            {section.rows.map((r) => (
                              <td key={r.date} className="p-2 text-right text-text-primary">{r.values[f] ?? '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'holders' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-accent mb-2 uppercase">{t('data_institutional')}</p>
                {deep.holders.length === 0 ? (
                  <p className="text-text-secondary text-sm font-mono p-4">{t('data_no_data')}</p>
                ) : deep.holders.map((h) => (
                  <div key={h.name} className="flex justify-between p-2 border-b border-white/5 font-mono text-xs">
                    <span className="text-text-primary truncate mr-2">{h.name}</span>
                    <span className="text-accent shrink-0">{h.percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-mono text-accent mb-2 uppercase">{t('data_insider')}</p>
                {deep.insiders.length === 0 ? (
                  <p className="text-text-secondary text-sm font-mono p-4">{t('data_no_data')}</p>
                ) : deep.insiders.map((ins, i) => (
                  <div key={i} className="p-2 border-b border-white/5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-primary">{ins.name}</span>
                      <span className="text-text-secondary">{ins.date}</span>
                    </div>
                    <p className="text-text-secondary mt-0.5">{ins.action} {ins.shares && `· ${ins.shares} shares`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'ratios' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {ratioCards.map((r) => (
                <div key={r.l} className="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-accent/20 transition-colors">
                  <p className="text-[10px] font-mono text-text-secondary uppercase">{r.l}</p>
                  <p className="text-sm font-mono font-bold text-accent mt-1">
                    {r.v != null ? `${formatNumber(r.v, 2)}${r.s ?? ''}` : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === 'news' && (
            <div className="space-y-2">
              {deep.news.length === 0 ? (
                <p className="text-text-secondary text-sm font-mono p-4 text-center">{t('data_no_data')}</p>
              ) : deep.news.map((n, i) => (
                <a
                  key={i}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-black/20 border border-white/5 hover:border-accent/20 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-text-primary group-hover:text-accent transition-colors leading-snug">{n.title}</p>
                      <p className="text-[10px] font-mono text-text-secondary mt-1.5">
                        {n.publisher} · {n.time ? new Date(n.time).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-secondary shrink-0 opacity-0 group-hover:opacity-100" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
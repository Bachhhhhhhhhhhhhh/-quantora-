import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'
import { Download } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { runMonteCarloSimulation, monteCarloToCSV } from '../../lib/monte-carlo'
import { downloadCSV } from '../../lib/utils'
import type { MonteCarloParams, MonteCarloResult } from '../../types'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { CountUpDisplay } from '../ui/CountUpDisplay'

const DEFAULT_PARAMS: MonteCarloParams = {
  initialPrice: 100,
  drift: 0.08,
  volatility: 0.25,
  timeHorizon: 1,
  numPaths: 200,
  stepsPerYear: 252,
}

interface MonteCarloTabProps {
  prefill?: Partial<MonteCarloParams>
}

export function MonteCarloTab({ prefill }: MonteCarloTabProps) {
  const { t } = useLanguage()
  const [params, setParams] = useState<MonteCarloParams>({ ...DEFAULT_PARAMS, ...prefill })
  const [result, setResult] = useState<MonteCarloResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prefill) setParams((p) => ({ ...p, ...prefill }))
  }, [prefill])

  const runSimulation = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(runMonteCarloSimulation(params))
      setLoading(false)
    }, 600)
  }

  const chartData = result
    ? result.timeSteps.map((time, i) => ({
        time: +time.toFixed(2),
        p5: result.percentiles.p5[i],
        p50: result.percentiles.p50[i],
        p95: result.percentiles.p95[i],
        ...Object.fromEntries(
          result.paths.slice(0, 8).map((p, j) => [`path${j}`, p[i]])
        ),
      }))
    : []

  const kpis = result
    ? [
        { label: t('mc_expected'), value: result.kpis.expectedValue, format: 'currency' as const },
        { label: t('mc_prob_profit'), value: result.kpis.probProfit, format: 'percent' as const },
        { label: t('mc_worst'), value: result.kpis.worstCase, format: 'currency' as const },
        { label: t('mc_best'), value: result.kpis.bestCase, format: 'currency' as const },
        { label: t('mc_median_return'), value: result.kpis.medianReturn, format: 'percent' as const },
        { label: t('mc_var95'), value: result.kpis.var95, format: 'percent' as const },
      ]
    : []

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Slider label={t('mc_initial_price')} value={params.initialPrice} min={10} max={100000} step={10} onChange={(v) => setParams({ ...params, initialPrice: v })} format={(v) => `$${v}`} />
        <Slider label={t('mc_drift')} value={params.drift} min={-0.2} max={0.5} step={0.01} onChange={(v) => setParams({ ...params, drift: v })} format={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label={t('mc_volatility')} value={params.volatility} min={0.05} max={1} step={0.01} onChange={(v) => setParams({ ...params, volatility: v })} format={(v) => `${(v * 100).toFixed(0)}%`} />
        <Slider label={t('mc_horizon')} value={params.timeHorizon} min={0.25} max={5} step={0.25} onChange={(v) => setParams({ ...params, timeHorizon: v })} format={(v) => `${v}y`} />
        <Slider label={t('mc_paths')} value={params.numPaths} min={50} max={500} step={50} onChange={(v) => setParams({ ...params, numPaths: v })} />
      </div>

      <Button onClick={runSimulation} loading={loading} size="lg">
        {loading ? t('sim_running') : t('sim_run')}
      </Button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="p-4 text-center">
                <p className="text-xs text-text-secondary mb-1">{kpi.label}</p>
                <p className="text-lg font-bold text-text-primary">
                  {kpi.format === 'currency' ? (
                    <CountUpDisplay value={kpi.value} prefix="$" decimals={0} />
                  ) : (
                    <CountUpDisplay value={kpi.value} suffix="%" decimals={1} />
                  )}
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${v}y`} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Area dataKey="p95" fill="rgba(34,211,238,0.05)" stroke="none" />
                  <Area dataKey="p5" fill="#0B1120" stroke="none" />
                  <Line dataKey="p50" stroke="#22D3EE" strokeWidth={2} dot={false} name="Median" />
                  <Line dataKey="p5" stroke="#F87171" strokeWidth={1} strokeDasharray="4 4" dot={false} name="5%" />
                  <Line dataKey="p95" stroke="#34D399" strokeWidth={1} strokeDasharray="4 4" dot={false} name="95%" />
                  {result.paths.slice(0, 8).map((_, i) => (
                    <Line key={i} dataKey={`path${i}`} stroke="rgba(148,163,184,0.2)" strokeWidth={0.5} dot={false} />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Button
            variant="secondary"
            onClick={() => downloadCSV('monte-carlo-results.csv', monteCarloToCSV(result))}
          >
            <Download className="w-4 h-4" />
            {t('mc_download')}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
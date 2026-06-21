import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { Download, ArrowUpDown } from 'lucide-react'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { runBacktest, getPresetParams } from '../../lib/backtest/engine'
import { useData } from '../../lib/DataContext'
import { BACKTEST_ASSETS } from '../../data/assets'
import { downloadCSV } from '../../lib/utils'
import type { BacktestResult, StrategyType, StrategyParams, PresetType } from '../../types'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { CountUpDisplay } from '../ui/CountUpDisplay'

const STRATEGIES: { id: StrategyType; nameKey: string; descKey: string }[] = [
  { id: 'sma_crossover', nameKey: 'strat_sma_name', descKey: 'strat_sma_desc' },
  { id: 'rsi_mean_reversion', nameKey: 'strat_rsi_name', descKey: 'strat_rsi_desc' },
  { id: 'bollinger_rsi', nameKey: 'strat_bb_name', descKey: 'strat_bb_desc' },
  { id: 'macd_crossover', nameKey: 'strat_macd_name', descKey: 'strat_macd_desc' },
  { id: 'atr_breakout', nameKey: 'strat_atr_name', descKey: 'strat_atr_desc' },
  { id: 'zscore_mean_reversion', nameKey: 'strat_zscore_name', descKey: 'strat_zscore_desc' },
  { id: 'dual_momentum', nameKey: 'strat_momentum_name', descKey: 'strat_momentum_desc' },
  { id: 'keltner_breakout', nameKey: 'strat_keltner_name', descKey: 'strat_keltner_desc' },
  { id: 'adx_trend', nameKey: 'strat_adx_name', descKey: 'strat_adx_desc' },
]

interface BacktesterTabProps {
  prefillAsset?: string
  prefillStrategy?: StrategyType
  prefillParams?: StrategyParams
}

export function BacktesterTab({ prefillAsset, prefillStrategy, prefillParams }: BacktesterTabProps) {
  const { t } = useLanguage()
  const { loadOHLC } = useData()
  const defaultAsset = 'AAPL'

  const [asset, setAsset] = useState(prefillAsset ?? defaultAsset)
  const [customTicker, setCustomTicker] = useState('')
  const [strategy, setStrategy] = useState<StrategyType>(prefillStrategy ?? 'sma_crossover')
  const [params, setParams] = useState<StrategyParams>(
    prefillParams ?? getPresetParams('sma_crossover', 'balanced')
  )
  const [preset, setPreset] = useState<PresetType>('balanced')
  const [initialCapital, setInitialCapital] = useState(100000)
  const [commission, setCommission] = useState(0.1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<'pnl' | 'returnPct'>('pnl')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    if (prefillAsset) setAsset(prefillAsset)
    if (prefillStrategy) setStrategy(prefillStrategy)
    if (prefillParams) setParams(prefillParams)
  }, [prefillAsset, prefillStrategy, prefillParams])

  useEffect(() => {
    loadOHLC(asset).then((data) => {
      if (data.length > 0) {
        setStartDate(data[Math.floor(data.length * 0.2)].date)
        setEndDate(data[data.length - 1].date)
      }
    })
  }, [asset, loadOHLC])

  const applyPreset = (p: PresetType) => {
    setPreset(p)
    setParams(getPresetParams(strategy, p))
  }

  const runTest = async () => {
    setLoading(true)
    const bars = await loadOHLC(asset)
    setTimeout(() => {
      const res = runBacktest(bars, {
        asset,
        strategy,
        params,
        initialCapital,
        commission,
        startDate,
        endDate,
      })
      setResult(res)
      setLoading(false)

      if (res.metrics.sharpeRatio > 1.5 || res.metrics.totalReturn > 30) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        toast.success(t('excellent_result'))
      }
    }, 800)
  }

  const sortedTrades = useMemo(() => {
    if (!result) return []
    return [...result.trades].sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      return sortAsc ? av - bv : bv - av
    })
  }, [result, sortField, sortAsc])

  const paramSliders = () => {
    switch (strategy) {
      case 'sma_crossover':
        return (
          <>
            <Slider label="SMA Fast" value={params.smaFast ?? 10} min={3} max={50} step={1} onChange={(v) => setParams({ ...params, smaFast: v })} />
            <Slider label="SMA Slow" value={params.smaSlow ?? 50} min={10} max={200} step={5} onChange={(v) => setParams({ ...params, smaSlow: v })} />
          </>
        )
      case 'rsi_mean_reversion':
        return (
          <>
            <Slider label="RSI Period" value={params.rsiPeriod ?? 14} min={5} max={30} step={1} onChange={(v) => setParams({ ...params, rsiPeriod: v })} />
            <Slider label="Oversold" value={params.rsiOversold ?? 30} min={15} max={40} step={1} onChange={(v) => setParams({ ...params, rsiOversold: v })} />
            <Slider label="Overbought" value={params.rsiOverbought ?? 70} min={60} max={85} step={1} onChange={(v) => setParams({ ...params, rsiOverbought: v })} />
          </>
        )
      case 'bollinger_rsi':
        return (
          <>
            <Slider label="BB Period" value={params.bbPeriod ?? 20} min={10} max={40} step={1} onChange={(v) => setParams({ ...params, bbPeriod: v })} />
            <Slider label="BB Std Dev" value={params.bbStdDev ?? 2} min={1} max={3} step={0.1} onChange={(v) => setParams({ ...params, bbStdDev: v })} />
            <Slider label="RSI Period" value={params.rsiPeriod ?? 14} min={5} max={30} step={1} onChange={(v) => setParams({ ...params, rsiPeriod: v })} />
            <Slider label="RSI Threshold" value={params.bbRsiThreshold ?? 40} min={25} max={50} step={1} onChange={(v) => setParams({ ...params, bbRsiThreshold: v })} />
          </>
        )
    }
  }

  const exportTrades = () => {
    if (!result) return
    const header = 'ID,Entry,Exit,Entry Price,Exit Price,PnL,Return%\n'
    const rows = result.trades.map((tr) =>
      `${tr.id},${tr.entryDate},${tr.exitDate},${tr.entryPrice},${tr.exitPrice},${tr.pnl.toFixed(2)},${tr.returnPct.toFixed(2)}`
    ).join('\n')
    downloadCSV(`backtest-${asset}-${strategy}.csv`, header + rows)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-text-secondary mb-3">{t('bt_asset')}</p>
        <div className="flex gap-2 mb-4">
          <input
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
            placeholder={t('term_search_any')}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-sm focus:outline-none focus:border-accent/50"
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && customTicker) {
                setAsset(customTicker)
                setCustomTicker('')
              }
            }}
          />
          <Button size="sm" onClick={() => { if (customTicker) { setAsset(customTicker); setCustomTicker('') } }}>
            Load
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BACKTEST_ASSETS.map((a) => (
            <button
              key={a.symbol}
              onClick={() => setAsset(a.symbol)}
              className={`p-4 rounded-xl border transition-all text-left ${
                asset === a.symbol
                  ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: a.color + '33', color: a.color }}>
                {a.symbol.slice(0, 2)}
              </div>
              <p className="font-semibold text-text-primary">{a.symbol}</p>
              <p className="text-xs text-text-secondary">{a.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-3">{t('bt_strategy')}</p>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStrategy(s.id); setParams(getPresetParams(s.id, preset)) }}
              className={`p-3 rounded-xl border transition-all text-left ${
                strategy === s.id ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
              title={t(s.descKey as 'strat_sma_name')}
            >
              <p className="font-semibold text-text-primary text-sm font-mono">{t(s.nameKey as 'strat_sma_name')}</p>
              <p className="text-[10px] text-text-secondary mt-1 line-clamp-2">{t(s.descKey as 'strat_sma_desc')}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['conservative', 'balanced', 'aggressive'] as PresetType[]).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              preset === p ? 'bg-accent text-bg-primary' : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            {t(p === 'conservative' ? 'bt_preset_conservative' : p === 'balanced' ? 'bt_preset_balanced' : 'bt_preset_aggressive')}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{paramSliders()}</div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Slider label={t('bt_initial_capital')} value={initialCapital} min={10000} max={1000000} step={10000} onChange={setInitialCapital} format={(v) => `$${v.toLocaleString()}`} />
        <Slider label={t('bt_commission')} value={commission} min={0} max={1} step={0.05} onChange={setCommission} format={(v) => `${v}%`} />
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">{t('bt_start_date')}</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-text-primary" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-text-secondary">{t('bt_end_date')}</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-text-primary" />
        </div>
      </div>

      <Button onClick={runTest} loading={loading} size="lg">
        {loading ? t('sim_backtest_running') : t('sim_run_backtest')}
      </Button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <h3 className="text-xl font-bold text-text-primary">{t('results')}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: t('bt_total_return'), value: result.metrics.totalReturn, suffix: '%', color: result.metrics.totalReturn >= 0 ? 'text-positive' : 'text-negative' },
              { label: t('bt_cagr'), value: result.metrics.cagr, suffix: '%', color: result.metrics.cagr >= 0 ? 'text-positive' : 'text-negative' },
              { label: t('bt_sharpe'), value: result.metrics.sharpeRatio, suffix: '', color: 'text-accent' },
              { label: t('bt_max_dd'), value: result.metrics.maxDrawdown, suffix: '%', color: 'text-negative' },
              { label: t('bt_win_rate'), value: result.metrics.winRate, suffix: '%', color: 'text-text-primary' },
              { label: t('bt_profit_factor'), value: result.metrics.profitFactor, suffix: '', color: 'text-text-primary' },
              { label: t('bt_num_trades'), value: result.metrics.numTrades, suffix: '', color: 'text-text-primary', decimals: 0 },
              { label: t('bt_buy_hold'), value: result.metrics.buyHoldReturn, suffix: '%', color: result.metrics.buyHoldReturn >= 0 ? 'text-positive' : 'text-negative' },
            ].map((m) => (
              <Card key={m.label} className="p-3 text-center">
                <p className="text-xs text-text-secondary mb-1">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>
                  <CountUpDisplay value={m.value} suffix={m.suffix} decimals={m.decimals ?? 2} />
                </p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <p className="text-sm text-text-secondary mb-3">{t('bt_equity_curve')}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.equityCurve}>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Line dataKey="equity" stroke="#22D3EE" strokeWidth={2} dot={false} name="Strategy" />
                    <Line dataKey="buyHold" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Buy & Hold" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-text-secondary mb-3">{t('bt_drawdown')}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.drawdownCurve}>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Area dataKey="drawdown" fill="rgba(248,113,113,0.2)" stroke="#F87171" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-text-primary">{t('bt_trade_log')}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={exportTrades}>
                  <Download className="w-4 h-4" /> {t('bt_export_csv')}
                </Button>
              </div>
            </div>
            {sortedTrades.length === 0 ? (
              <p className="text-text-secondary text-center py-8">{t('no_trades')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary border-b border-white/10">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">{t('bt_entry_date')}</th>
                    <th className="text-left py-2 px-2">{t('bt_exit_date')}</th>
                    <th className="text-right py-2 px-2">{t('bt_entry_price')}</th>
                    <th className="text-right py-2 px-2">{t('bt_exit_price')}</th>
                    <th className="text-right py-2 px-2 cursor-pointer" onClick={() => { setSortField('pnl'); setSortAsc(!sortAsc) }}>
                      <span className="inline-flex items-center gap-1">{t('bt_pnl')} <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                    <th className="text-right py-2 px-2 cursor-pointer" onClick={() => { setSortField('returnPct'); setSortAsc(!sortAsc) }}>
                      <span className="inline-flex items-center gap-1">{t('bt_return')} <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTrades.map((tr) => (
                    <tr key={tr.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-2 text-text-secondary">{tr.id}</td>
                      <td className="py-2 px-2">{tr.entryDate}</td>
                      <td className="py-2 px-2">{tr.exitDate}</td>
                      <td className="py-2 px-2 text-right">${tr.entryPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">${tr.exitPrice.toFixed(2)}</td>
                      <td className={`py-2 px-2 text-right font-medium ${tr.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                        ${tr.pnl.toFixed(2)}
                      </td>
                      <td className={`py-2 px-2 text-right ${tr.returnPct >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {tr.returnPct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}
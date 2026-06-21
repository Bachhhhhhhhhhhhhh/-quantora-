import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '../../lib/i18n/LanguageContext'
import { loadAlerts, addAlert, removeAlert, type PriceAlert } from '../../lib/alerts'
import { formatPrice } from '../../lib/utils'
import { Button } from '../ui/Button'

interface AlertPanelProps {
  symbol: string
  currentPrice?: number
}

export function AlertPanel({ symbol, currentPrice }: AlertPanelProps) {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [price, setPrice] = useState('')

  useEffect(() => {
    setAlerts(loadAlerts().filter((a) => a.symbol === symbol && !a.triggered))
  }, [symbol])

  const handleAdd = () => {
    const p = parseFloat(price)
    if (!p || p <= 0) return
    addAlert(symbol, condition, p)
    setAlerts(loadAlerts().filter((a) => a.symbol === symbol && !a.triggered))
    setPrice('')
    toast.success(t('alert_created'))
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center gap-2 text-accent">
        <Bell className="w-4 h-4" />
        <span className="uppercase tracking-wider">{t('alert_title')}</span>
      </div>

      <div className="flex gap-2">
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
          className="flex-1 px-2 py-1.5 rounded bg-black/40 border border-white/10 text-xs"
        >
          <option value="above">{t('alert_above')}</option>
          <option value="below">{t('alert_below')}</option>
        </select>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={currentPrice ? String(currentPrice) : '0'}
          className="flex-1 px-2 py-1.5 rounded bg-black/40 border border-white/10 text-xs"
        />
        <Button size="sm" onClick={handleAdd}><Plus className="w-3 h-3" /></Button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-text-secondary text-center py-4">{t('alert_none')}</p>
      ) : alerts.map((a) => (
        <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
          <span className="text-text-primary">
            {a.condition === 'above' ? '≥' : '≤'} {formatPrice(symbol, a.price)}
          </span>
          <button onClick={() => { removeAlert(a.id); setAlerts(loadAlerts().filter((x) => x.symbol === symbol && !x.triggered)) }}>
            <Trash2 className="w-3 h-3 text-negative hover:text-negative/80" />
          </button>
        </div>
      ))}
    </div>
  )
}
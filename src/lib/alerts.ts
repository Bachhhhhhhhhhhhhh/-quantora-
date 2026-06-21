export interface PriceAlert {
  id: string
  symbol: string
  condition: 'above' | 'below'
  price: number
  createdAt: number
  triggered?: boolean
}

const STORAGE_KEY = 'quantora-alerts'

export function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAlerts(alerts: PriceAlert[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function addAlert(symbol: string, condition: 'above' | 'below', price: number): PriceAlert {
  const alert: PriceAlert = {
    id: `${symbol}-${Date.now()}`,
    symbol,
    condition,
    price,
    createdAt: Date.now(),
  }
  const alerts = loadAlerts().filter((a) => !(a.symbol === symbol && !a.triggered))
  alerts.push(alert)
  saveAlerts(alerts)
  return alert
}

export function removeAlert(id: string): void {
  saveAlerts(loadAlerts().filter((a) => a.id !== id))
}

export function checkAlerts(
  quotes: Record<string, { price: number }>,
  onTrigger: (alert: PriceAlert, currentPrice: number) => void,
): void {
  const alerts = loadAlerts()
  let changed = false
  for (const alert of alerts) {
    if (alert.triggered) continue
    const q = quotes[alert.symbol]
    if (!q) continue
    const hit = alert.condition === 'above' ? q.price >= alert.price : q.price <= alert.price
    if (hit) {
      alert.triggered = true
      changed = true
      onTrigger(alert, q.price)
    }
  }
  if (changed) saveAlerts(alerts)
}
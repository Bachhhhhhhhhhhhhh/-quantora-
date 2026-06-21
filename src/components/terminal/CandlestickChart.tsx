import { useMemo } from 'react'
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line,
} from 'recharts'
import type { OHLCBar } from '../../types'
import { formatPrice } from '../../lib/utils'

interface CandlestickChartProps {
  bars: OHLCBar[]
  symbol: string
  slice?: number
}

export function CandlestickChart({ bars, symbol, slice = 120 }: CandlestickChartProps) {
  const data = useMemo(() => {
    return bars.slice(-slice).map((b) => {
      const bullish = b.close >= b.open
      return {
        date: b.date.slice(5),
        open: b.open,
        close: b.close,
        high: b.high,
        low: b.low,
        volume: b.volume / 1e6,
        body: [Math.min(b.open, b.close), Math.max(b.open, b.close)],
        wick: [b.low, b.high],
        bullish,
      }
    })
  }, [bars, slice])

  if (!data.length) return null

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
          <YAxis yAxisId="price" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} fontFamily="monospace" />
          <Tooltip content={<OhlcTooltip symbol={symbol} />} />
          <Bar yAxisId="price" dataKey="body" fill="#22D3EE" shape={<CandleShape />} />
          <Line yAxisId="price" dataKey="close" stroke="rgba(248,250,252,0.3)" dot={false} strokeWidth={1} />
        </ComposedChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height="15%">
        <ComposedChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Bar dataKey="volume" fill="rgba(148,163,184,0.25)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

interface OhlcTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: {
    date: string; open: number; high: number; low: number; close: number; volume: number; bullish: boolean
  } }>
  symbol: string
}

function OhlcTooltip({ active, payload, symbol }: OhlcTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2 font-mono text-[11px] shadow-xl">
      <p className="text-text-secondary mb-1">{d.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-text-secondary">O</span><span>{formatPrice(symbol, d.open)}</span>
        <span className="text-text-secondary">H</span><span className="text-positive">{formatPrice(symbol, d.high)}</span>
        <span className="text-text-secondary">L</span><span className="text-negative">{formatPrice(symbol, d.low)}</span>
        <span className="text-text-secondary">C</span><span className={d.bullish ? 'text-positive' : 'text-negative'}>{formatPrice(symbol, d.close)}</span>
      </div>
      <p className="text-text-secondary mt-1">Vol {d.volume.toFixed(2)}M</p>
    </div>
  )
}

function CandleShape(props: {
  x?: number; y?: number; width?: number; height?: number
  payload?: { open: number; close: number; high: number; low: number; bullish: boolean }
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props
  if (!payload) return null

  const color = payload.bullish ? '#34D399' : '#F87171'
  const cx = x + width / 2
  const bodyTop = y
  const bodyH = Math.max(height, 1)

  const range = payload.high - payload.low || 1
  const scale = bodyH / Math.max(Math.abs(payload.close - payload.open), range * 0.01)
  const wickTop = bodyTop - (payload.high - Math.max(payload.open, payload.close)) * scale
  const wickH = (payload.high - payload.low) * scale

  return (
    <g>
      <line x1={cx} y1={wickTop} x2={cx} y2={wickTop + wickH} stroke={color} strokeWidth={1} />
      <rect x={x + 1} y={bodyTop} width={Math.max(width - 2, 2)} height={bodyH} fill={color} opacity={0.9} />
    </g>
  )
}
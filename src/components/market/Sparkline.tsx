import { useMemo } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  color?: string
  positive?: boolean
  height?: number
}

export function Sparkline({ data, color, positive, height = 36 }: SparklineProps) {
  const chartData = useMemo(
    () => data.map((v, i) => ({ i, v })),
    [data],
  )

  if (data.length < 2) {
    return <div className="h-9 bg-white/5 rounded animate-pulse" style={{ height }} />
  }

  const stroke = color ?? (positive ? '#34D399' : '#F87171')

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`spark-${stroke}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#spark-${stroke})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
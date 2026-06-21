import { useCountUp } from '../../hooks/useCountUp'

interface CountUpDisplayProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  active?: boolean
  className?: string
}

export function CountUpDisplay({
  value,
  suffix = '',
  prefix = '',
  decimals = 2,
  active = true,
  className = '',
}: CountUpDisplayProps) {
  const display = useCountUp(value, 1200, decimals, active)
  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
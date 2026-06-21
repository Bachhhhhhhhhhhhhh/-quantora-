import { motion } from 'framer-motion'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variants = {
  primary:
    'bg-accent text-bg-primary font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]',
  secondary:
    'bg-white/10 text-text-primary hover:bg-white/15 border border-white/10',
  ghost: 'bg-transparent text-text-secondary hover:text-accent hover:bg-white/5',
  outline:
    'bg-transparent border border-accent/50 text-accent hover:bg-accent/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  className = '',
  disabled,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.03, y: isDisabled ? 0 : -2 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      className="inline-flex"
    >
      <button
        type={type}
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    </motion.div>
  )
}
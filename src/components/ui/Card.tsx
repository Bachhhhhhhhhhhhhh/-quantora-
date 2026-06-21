import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={`glass-card p-6 ${hover ? 'cursor-pointer hover:border-accent/30 hover:shadow-[0_8px_32px_rgba(34,211,238,0.08)]' : ''} transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}
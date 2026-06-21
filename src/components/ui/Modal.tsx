import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLanguage } from '../../lib/i18n/LanguageContext'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  wide?: boolean
}

export function Modal({ open, onClose, children, title, wide }: ModalProps) {
  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`glass-card w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto p-6 md:p-8 relative`}
          >
            <div className="flex items-center justify-between mb-6">
              {title && <h3 className="text-xl font-bold text-text-primary">{title}</h3>}
              <button
                onClick={onClose}
                className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                aria-label={t('close')}
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
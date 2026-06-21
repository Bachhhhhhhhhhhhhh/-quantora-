import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Language } from '../../types'
import { t, type TranslationKey } from './translations'
import { safeStorageGet, safeStorageSet } from '../bootstrap'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'quantora-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = safeStorageGet(STORAGE_KEY)
    return stored === 'vi' ? 'vi' : 'en'
  })

  useEffect(() => {
    safeStorageSet(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Language) => setLangState(l), [])

  const translate = useCallback(
    (key: TranslationKey) => t(lang, key),
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
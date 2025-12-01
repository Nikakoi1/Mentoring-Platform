'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type SupportedLocale = 'en' | 'ka'

interface LanguageContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  loading: boolean
}

const STORAGE_KEY = 'mentoring-platform:locale'

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  loading: false
})

interface LanguageProviderProps {
  children: React.ReactNode
  initialLocale?: SupportedLocale
}

export function LanguageProvider({ children, initialLocale = 'en' }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const savedLocale = typeof window !== 'undefined'
      ? (window.localStorage.getItem(STORAGE_KEY) as SupportedLocale | null)
      : null

    if (savedLocale && savedLocale !== locale) {
      setLocaleState(savedLocale)
    }
    setHydrated(true)
  }, [locale])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale)
    }
  }, [locale])

  const setLocale = (nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale)
  }

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale,
    loading: !hydrated
  }), [locale, hydrated])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export type { SupportedLocale }

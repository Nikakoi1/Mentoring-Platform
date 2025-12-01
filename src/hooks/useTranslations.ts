'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslationsByNamespaces } from '@/lib/services/database'

type TranslationMap = Record<string, string>

interface UseTranslationsOptions {
  namespace: string
  defaults?: TranslationMap
}

interface UseTranslationsResult {
  t: (key: string, fallback?: string) => string
  translations: TranslationMap
  loading: boolean
  error: Error | null
  locale: string
  refresh: () => Promise<void>
}

export function useTranslations({ namespace, defaults = {} }: UseTranslationsOptions): UseTranslationsResult {
  const { locale } = useLanguage()
  const [cache, setCache] = useState<Record<string, TranslationMap>>({
    [locale]: defaults
  })
  const [activeLocale, setActiveLocale] = useState(locale)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const requestIdRef = useRef(0)

  const stableDefaults = useMemo(() => defaults, [defaults])

  const loadTranslations = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    console.log(`[useTranslations] Fetching translations for namespace="${namespace}" locale="${locale}"`)
    const { data, error } = await getTranslationsByNamespaces([namespace], locale)
    console.log(`[useTranslations] Server returned ${data?.length ?? 0} translations for locale="${locale}"`, data)

    if (requestId !== requestIdRef.current) {
      return
    }

    if (error) {
      console.error(`[useTranslations] Error fetching translations:`, error)
      setError(error)
      setLoading(false)
      return
    }

    const serverMap = (data ?? []).reduce<TranslationMap>((acc, translation) => {
      acc[translation.key] = translation.value
      return acc
    }, {})

    const merged = { ...stableDefaults, ...serverMap }

    setCache((prev) => ({
      ...prev,
      [locale]: merged
    }))
    setActiveLocale(locale)
    setLoading(false)
  }, [locale, namespace, stableDefaults])

  useEffect(() => {
    const cached = cache[locale]
    if (cached) {
      setActiveLocale(locale)
      setLoading(false)
    }
  }, [cache, locale])

  useEffect(() => {
    loadTranslations()
  }, [locale, namespace, loadTranslations])

  const translations = cache[activeLocale] ?? stableDefaults

  const t = useCallback((key: string, fallback?: string) => {
    return translations[key] ?? fallback ?? key
  }, [translations])

  return {
    t,
    translations,
    loading,
    error,
    locale,
    refresh: loadTranslations
  }
}

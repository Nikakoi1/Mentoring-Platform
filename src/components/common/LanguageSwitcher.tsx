'use client'

import { useLanguage, type SupportedLocale } from '@/contexts/LanguageContext'

const OPTIONS: { label: string; value: SupportedLocale }[] = [
  { label: 'EN', value: 'en' },
  { label: 'KA', value: 'ka' }
]

export function LanguageSwitcher() {
  const { locale, setLocale, loading } = useLanguage()

  return (
    <div className="inline-flex rounded-full border border-gray-200 bg-white shadow-sm text-xs font-semibold">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={loading}
          onClick={() => setLocale(option.value)}
          className={[
            'px-3 py-1 transition-colors rounded-full',
            option.value === locale
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

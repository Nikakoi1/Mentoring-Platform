'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'

export function ConfirmEmailForm() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setLocale } = useLanguage()
  
  const { t } = useTranslations({
    namespace: 'auth.confirm',
    defaults: {
      'title': 'Confirm Your Email',
      'subtitle': 'Please wait while we confirm your email address...',
      'success.title': 'Email Confirmed!',
      'success.message': 'Your email has been successfully confirmed. You can now sign in to your account.',
      'error.title': 'Confirmation Failed',
      'error.invalid': 'This confirmation link is invalid or has expired.',
      'error.generic': 'An error occurred during confirmation. Please try again or contact support.',
      'cta.signIn': 'Sign In',
      'cta.home': 'Go to Homepage',
      // Georgian translations
      'ka.title': 'დაადასტურეთ თქვენი ელ.ფოსტა',
      'ka.subtitle': 'გთხოვთ, დაიცადოთ, სანამ დავადასტურებთ თქვენს ელ.ფოსტის მისამართს...',
      'ka.success.title': 'ელ.ფოსტა დადასტურებულია!',
      'ka.success.message': 'თქვენი ელ.ფოსტა წარმატებით დადასტურდა. ახლა შეგიძლიათ შეხვიდეთ თქვენს ანგარიშზე.',
      'ka.error.title': 'დადასტურება ვერ მოხერხდა',
      'ka.error.invalid': 'ეს დადასტურების ბმული არასწორია ან ვადაგასულია.',
      'ka.error.generic': 'დადასტურებისას შეცდომა მოხდა. გთხოვთ, სცადოთ თავიდან ან დაუკავშირდეთ მხარდაჭერის სერვისს.',
      'ka.cta.signIn': 'შესვლა',
      'ka.cta.home': 'მთავარზე დაბრუნება'
    }
  })

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token')
      const locale = searchParams.get('locale') || 'en'

      // Set the locale based on URL parameter or user metadata
      if (locale === 'ka' || locale === 'en') {
        setLocale(locale)
      }

      if (!token) {
        setError(t('error.invalid'))
        setLoading(false)
        return
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        })

        if (error) {
          setError(t('error.invalid'))
        } else {
          setSuccess(true)
        }
      } catch (err) {
        setError(t('error.generic'))
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, t, setLocale])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('title')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('error.title')}</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('cta.signIn')}
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('cta.home')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('success.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('success.message')}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('cta.signIn')}
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('cta.home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

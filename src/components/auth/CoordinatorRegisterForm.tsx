'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'

export function CoordinatorRegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { locale } = useLanguage()
  const { t } = useTranslations({
    namespace: 'auth.register',
    defaults: {
      'title': 'Register as Coordinator',
      'subtitle': 'Manage mentorship programs and coordinate activities',
      'labels.fullName': 'Full Name',
      'labels.email': 'Email',
      'labels.password': 'Password',
      'cta.loading': 'Creating Account...',
      'cta.submit': 'Create Coordinator Account',
      'footer.prompt': 'Already have an account?',
      'footer.link': 'Sign in',
      'success': 'Registration successful! Please check your email to verify your account.',
      // Georgian defaults
      'ka.title': 'რეგისტრაცია კოორდინატორად',
      'ka.subtitle': 'მართეთ მენტორული პროგრამები და კოორდინირეთ საქმიანობა',
      'ka.labels.fullName': 'სრული სახელი',
      'ka.labels.email': 'ელ.ფოსტა',
      'ka.labels.password': 'პაროლი',
      'ka.cta.loading': 'ანგარიშის შექმნა...',
      'ka.cta.submit': 'შექმენით კოორდინატორის ანგარიში',
      'ka.footer.prompt': 'უკვე გაქვს ანგარიში?',
      'ka.footer.link': 'შესვლა',
      'ka.success': 'რეგისტრაცია წარმატებულია! გთხოვთ, შეამოწმოთ თქვენი ელ.ფოსტა ანგარიშის დასადასტურებლად.',
      'ka.errors.emailExists': 'ეს ელ.ფოსტა უკვე რეგისტრირებულია. გთხოვთ, შეხვიდეთ სისტემაში.'
    }
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'coordinator',
            locale
          }
        }
      })

      if (error) throw error

      alert(t('success'))
      router.push('/login?from=coordinator')
    } catch (error: unknown) {
       if (error instanceof Error) {
        // Handle common Supabase errors with user-friendly messages
        if (error.message.includes('User already registered')) {
          setError(t('errors.emailExists'))
        } else if (error.message.includes('duplicate key')) {
          setError(t('errors.emailExists'))
        } else {
          setError(error.message)
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        const msg = error.message
        if (msg.includes('User already registered') || msg.includes('duplicate key')) {
          setError(t('errors.emailExists'))
        } else {
          setError(msg)
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <form className="space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('labels.fullName')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('labels.email')}</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('labels.password')}</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('cta.loading') : t('cta.submit')}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t('footer.prompt')}{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            {t('footer.link')}
          </a>
        </p>
      </div>
    </div>
  )
}

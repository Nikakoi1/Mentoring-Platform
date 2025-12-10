'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslations } from '@/hooks/useTranslations'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  const { t } = useTranslations({
    namespace: 'auth.forgotPassword',
    defaults: {
      'title': 'Reset Your Password',
      'subtitle': 'Enter your email address and we\'ll send you a link to reset your password.',
      'label.email': 'Email',
      'placeholder.email': 'Enter your email',
      'cta.submit': 'Send Reset Link',
      'cta.loading': 'Sending...',
      'success.title': 'Reset Link Sent!',
      'success.message': 'Check your email for a link to reset your password. If it doesn\'t appear within a few minutes, check your spam folder.',
      'cta.backToLogin': 'Back to Login',
      'error.invalidEmail': 'Please enter a valid email address.',
      'error.failed': 'Failed to send reset link. Please try again.',
      // Georgian translations
      'ka.title': 'აღადგინეთ თქვენი პაროლი',
      'ka.subtitle': 'შეიყვანეთ თქვენი ელფოსტის მისამართი და ჩვენ გამოგიგზავნით ბმულს პაროლის აღსადგენად.',
      'ka.label.email': 'ელფოსტა',
      'ka.placeholder.email': 'შეიყვანეთ თქვენი ელფოსტა',
      'ka.cta.submit': 'აღდგენის ბმულის გაგზავნა',
      'ka.cta.loading': 'გაგზავნა...',
      'ka.success.title': 'აღდგენის ბმული გაგზავნილია!',
      'ka.success.message': 'შეამოწმეთ თქვენი ელფოსტა პაროლის აღსადგენი ბმულისთვის. თუ ის რამდენიმე წუთში არ გამოჩნდება, შეამოწმეთ სპამ ფოლდერი.',
      'ka.cta.backToLogin': 'შესვლის გვერდზე დაბრუნება',
      'ka.error.invalidEmail': 'გთხოვთ, შეიყვანოთ სწორი ელფოსტის მისამართი.',
      'ka.error.failed': 'აღდგენის ბმულის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.'
    }
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateEmail(email)) {
      setError(t('error.invalidEmail'))
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        setError(String((error as { message: string }).message))
      } else {
        setError(t('error.failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md p-8 space-y-6 rounded-lg border bg-white shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-green-600">{t('success.title')}</h1>
            <p className="text-sm text-gray-600">{t('success.message')}</p>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              {t('cta.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg border bg-white shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600">{t('subtitle')}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.email')}
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('placeholder.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? t('cta.loading') : t('cta.submit')}
          </button>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {t('cta.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  )
}

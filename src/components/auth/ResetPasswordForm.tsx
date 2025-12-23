'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslations } from '@/hooks/useTranslations'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { t } = useTranslations({
    namespace: 'auth.resetPassword',
    defaults: {
      'title': 'Set New Password',
      'subtitle': 'Enter your new password below.',
      'label.password': 'New Password',
      'placeholder.password': 'Enter your new password',
      'label.confirmPassword': 'Confirm Password',
      'placeholder.confirmPassword': 'Confirm your new password',
      'cta.submit': 'Update Password',
      'cta.loading': 'Updating...',
      'success.title': 'Password Updated!',
      'success.message': 'Your password has been successfully updated. You can now sign in with your new password.',
      'cta.signIn': 'Sign In',
      'error.passwordMismatch': 'Passwords do not match.',
      'error.passwordRequired': 'Password must be at least 6 characters long.',
      'error.failed': 'Failed to update password. The link may have expired. Please try again.',
      'error.invalidLink': 'This password reset link is invalid or has expired.'
    }
  })

  useEffect(() => {
    // Check if we have the reset tokens in the URL hash (Supabase uses hash fragments)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setError(t('error.invalidLink'))
    }
  }, [t])

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePassword(password)) {
      setError(t('error.passwordRequired'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('error.passwordMismatch'))
      return
    }

    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (!accessToken || !refreshToken) {
      setError(t('error.invalidLink'))
      return
    }

    setLoading(true)

    try {
      // Set the session using the tokens from the URL
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) throw sessionError

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

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
              {t('cta.signIn')}
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.password')}
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('placeholder.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('placeholder.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import { getUserProfile } from '@/lib/services/database'
import { useTranslations } from '@/hooks/useTranslations'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslations({
    namespace: 'auth.login',
    defaults: {
      'title': 'Welcome back',
      'subtitle': 'Sign in to your mentoring platform account',
      'labels.email': 'Email',
      'placeholders.email': 'Enter your email',
      'labels.password': 'Password',
      'placeholders.password': 'Enter your password',
      'forgotPassword': 'Forgot password?',
      'cta.loading': 'Signing in...',
      'cta.submit': 'Sign in',
      'footer.prompt': "Don't have an account?",
      'footer.link': 'Sign up'
    }
  })

  // Determine registration redirect based on referrer
  const getRegistrationRedirect = () => {
    const from = searchParams.get('from')
    
    if (from === 'mentor') return '/register/mentor'
    if (from === 'mentee') return '/register/mentee'
    return '/register/mentor' // default to mentor registration
  }

  // Show both registration options when no context
  const showBothOptions = () => {
    const from = searchParams.get('from')
    return !from || (from !== 'mentor' && from !== 'mentee')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Get user profile to determine role-based redirect
      if (authData.user) {
        const { data: profile, error: profileError } = await getUserProfile(authData.user.id)
        
        if (profileError || !profile) {
          console.warn('Could not fetch user profile:', profileError)
          router.push('/dashboard')
          return
        }

        // Always redirect to /dashboard which will render role-specific UI
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        setError(String((error as { message: string }).message));
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
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('labels.email')}
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('placeholders.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('labels.password')}
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                {t('forgotPassword')}
              </a>
            </div>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('placeholders.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
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
        <p className="text-sm text-gray-600 mb-2">
          {t('footer.prompt')}
        </p>
        {showBothOptions() ? (
          <div className="space-x-4">
            <a href="/register/mentor" className="text-blue-600 hover:underline font-medium">
              Register as Mentor
            </a>
            <span className="text-gray-400">or</span>
            <a href="/register/mentee" className="text-green-600 hover:underline font-medium">
              Register as Mentee
            </a>
          </div>
        ) : (
          <a href={getRegistrationRedirect()} className="text-blue-600 hover:underline">
            {t('footer.link')}
          </a>
        )}
      </div>
    </div>
  )
}

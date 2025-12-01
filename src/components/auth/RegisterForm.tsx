'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('mentee')
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t } = useTranslations({
    namespace: 'auth.register',
    defaults: {
      'title': 'Create Account',
      'subtitle': 'Join our mentoring platform',
      'labels.fullName': 'Full Name',
      'labels.email': 'Email',
      'labels.password': 'Password',
      'labels.region': 'Region',
      'labels.role': 'Role',
      'options.role.mentee': 'Mentee',
      'options.role.mentor': 'Mentor',
      'options.role.coordinator': 'Coordinator',
      'cta.loading': 'Creating Account...',
      'cta.submit': 'Create Account',
      'footer.prompt': 'Already have an account?',
      'footer.link': 'Sign in',
      'success': 'Registration successful! Please check your email to verify your account.'
    }
  })

  const requiresRegion = useMemo(() => role === 'mentee' || role === 'mentor', [role])

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
            role: role,
            region: requiresRegion ? region : undefined
          }
        }
      })

      if (error) throw error

      // Show success message
      alert(t('success'))
      router.push('/login')
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

          <div>
            <label className="block text-sm font-medium mb-1">{t('labels.role')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              <option value="mentee">{t('options.role.mentee')}</option>
              <option value="mentor">{t('options.role.mentor')}</option>
              <option value="coordinator">{t('options.role.coordinator')}</option>
            </select>
          </div>

          {requiresRegion && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('labels.region')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              />
            </div>
          )}
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

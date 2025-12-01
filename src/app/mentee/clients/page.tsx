'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import { MenteeClientsList } from '@/components/dashboard/MenteeClientsList'

export default function MenteeClientsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslations({
    namespace: 'mentee.clientsPage',
    defaults: {
      title: 'Client Management',
      loading: 'Loading your account...',
      unauthorized: 'Only mentees can manage clients.'
    }
  })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (userProfile?.role !== 'mentee') {
        router.push('/dashboard')
      }
    }
  }, [loading, router, user, userProfile?.role])

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    )
  }

  if (userProfile.role !== 'mentee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">{t('unauthorized')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <MenteeClientsList />
      </div>
    </div>
  )
}

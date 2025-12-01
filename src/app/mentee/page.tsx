'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function MenteePage() {
  const router = useRouter()
  const { userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        // Not authenticated - redirect to mentee registration
        router.replace('/register/mentee')
      } else if (userProfile.role !== 'mentee') {
        // Wrong role - redirect to dashboard
        router.push('/dashboard')
      } else {
        // Correct role - redirect to general dashboard (shows mentee UI)
        router.replace('/dashboard')
      }
    }
  }, [router, userProfile, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}

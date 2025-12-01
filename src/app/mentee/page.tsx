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
        router.push('/login')
      } else if (userProfile.role !== 'mentee') {
        router.push('/dashboard')
      } else {
        router.replace('/mentee/clients')
      }
    }
  }, [router, userProfile, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}

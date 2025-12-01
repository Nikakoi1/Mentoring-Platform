'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinMentorPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to mentor registration page
    router.replace('/register/mentor')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to mentor registration...</p>
      </div>
    </div>
  )
}

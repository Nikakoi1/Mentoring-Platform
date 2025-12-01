'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinMenteePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to mentee registration page
    router.replace('/register/mentee')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to mentee registration...</p>
      </div>
    </div>
  )
}

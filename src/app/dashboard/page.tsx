'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { MentorDashboard } from '@/components/dashboard/MentorDashboard'
import { MenteeDashboard } from '@/components/dashboard/MenteeDashboard'
import { CoordinatorDashboard } from '@/components/dashboard/CoordinatorDashboard'

export default function DashboardPage() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const renderDashboard = () => {
    if (!userProfile) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      )
    }

    switch (userProfile.role) {
      case 'mentor':
        return <MentorDashboard />
      case 'mentee':
        return <MenteeDashboard />
      case 'coordinator':
        return <CoordinatorDashboard />
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Mentoring Platform</h2>
            <p className="text-gray-600">Your role is not recognized. Please contact support.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Mentoring Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {userProfile?.full_name || user.email}
                {userProfile?.role && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                    {userProfile.role}
                  </span>
                )}
              </span>
              <Link href="/profile/edit">
                <span className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer">
                  Edit Profile
                </span>
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderDashboard()}
        </div>
      </main>
    </div>
  )
}

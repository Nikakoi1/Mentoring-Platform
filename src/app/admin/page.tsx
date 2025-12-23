'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const { userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading && userProfile && userProfile.role !== 'coordinator') {
      router.push('/dashboard')
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Coordinator Access</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">Private admin signup portal</h1>
            <p className="mt-4 text-lg text-gray-600">
              This page is reserved for program coordinators we&rsquo;ve invited to manage the mentoring program.
              Use the secure signup link to create your coordinator account or sign in if you already have one.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/register/coordinator"
              className="block rounded-xl border border-blue-200 bg-white px-6 py-8 text-left shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900">Request Coordinator Access</h2>
              <p className="mt-2 text-sm text-gray-600">
                Use the coordinator signup flow with the invitation email you received.
              </p>
            </Link>
            <Link
              href="/login"
              className="block rounded-xl border border-gray-200 px-6 py-8 text-left hover:border-gray-300 transition-colors"
            >
              <div className="text-3xl mb-4">🔐</div>
              <h2 className="text-xl font-semibold text-gray-900">Already have access?</h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to continue coordinating mentor / mentee onboarding and program activities.
              </p>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Didn&rsquo;t receive an invitation? Contact the Adviso program team so we can verify and onboard you.
          </p>
        </div>
      </div>
    )
  }

  if (userProfile.role !== 'coordinator') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors block">
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-medium">Manage Users</div>
                </div>
              </Link>
              
              <Link href="/admin/pairings/create" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors block">
                <div className="text-center">
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="font-medium">Create Pairings</div>
                </div>
              </Link>
              
              <Link href="/admin/reports" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors block">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">View Reports</div>
                </div>
              </Link>
              
              <Link href="/admin/settings" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors block">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-medium">System Settings</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

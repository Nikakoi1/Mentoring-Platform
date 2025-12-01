'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const { userProfile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.push('/login')
      } else if (userProfile.role !== 'coordinator') {
        router.push('/dashboard')
      } else {
        // Don't auto-redirect - show admin navigation
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

  if (!userProfile || userProfile.role !== 'coordinator') {
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

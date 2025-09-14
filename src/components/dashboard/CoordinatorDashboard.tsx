'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function CoordinatorDashboard() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load coordinator-specific data here
    setLoading(false)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coordinator Dashboard</h2>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name || user?.email}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-500">Registered users</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Pairings</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500">Mentor-mentee pairs</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions This Month</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-gray-500">Total sessions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-orange-600">0%</p>
          <p className="text-sm text-gray-500">Average progress</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
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

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
              P
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New pairing created</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
              S
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Session completed</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mentors</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mentees</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Coordinators</span>
              <span className="font-medium">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-green-600 font-medium">✓ Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Authentication</span>
              <span className="text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Notifications</span>
              <span className="text-green-600 font-medium">✓ Running</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

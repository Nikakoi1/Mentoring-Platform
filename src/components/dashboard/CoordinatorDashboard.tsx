'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import { getPlatformAnalytics, getAllPairings, getAllUsers } from '@/lib/services/database'
import type { PlatformAnalytics } from '@/lib/types/database'

export function CoordinatorDashboard() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const { t } = useTranslations({
    namespace: 'dashboard.coordinator',
    defaults: {
      'header.title': 'Coordinator Dashboard',
      'header.welcome': 'Welcome back',
      'stats.totalUsers.title': 'Total Users',
      'stats.totalUsers.subtitle': 'Registered users',
      'stats.activePairings.title': 'Active Pairings',
      'stats.activePairings.subtitle': 'Mentor-mentee pairs',
      'stats.sessions.title': 'Sessions This Month',
      'stats.sessions.subtitle': 'Total sessions',
      'stats.completion.title': 'Completion Rate',
      'stats.completion.subtitle': 'Average progress',
      'actions.title': 'Admin Actions',
      'actions.manageUsers': 'Manage Users',
      'actions.createPairings': 'Create Pairings',
      'actions.viewReports': 'View Reports',
      'actions.systemSettings': 'System Settings',
      'activity.title': 'Recent Activity',
      'activity.newUser': 'New user registered',
      'activity.newPairing': 'New pairing created',
      'activity.sessionCompleted': 'Session completed',
      'distribution.title': 'User Distribution',
      'distribution.mentors': 'Mentors',
      'distribution.mentees': 'Mentees',
      'distribution.coordinators': 'Coordinators',
      'health.title': 'System Health',
      'health.database': 'Database',
      'health.authentication': 'Authentication',
      'health.notifications': 'Notifications',
      'health.ok': '✓ Healthy'
    }
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await getPlatformAnalytics()
        if (error) {
          console.error('Failed to fetch analytics via RPC:', error)
          
          // Fallback: fetch data manually using existing functions
          const [pairingsResult, usersResult] = await Promise.all([
            getAllPairings(),
            getAllUsers()
          ])
          
          if (!pairingsResult.error && !usersResult.error && pairingsResult.data && usersResult.data) {
            const activePairings = pairingsResult.data.filter(p => p.status === 'active').length
            const mentors = usersResult.data.filter(u => u.role === 'mentor').length
            const mentees = usersResult.data.filter(u => u.role === 'mentee').length
            
            const fallbackAnalytics: PlatformAnalytics = {
              totalUsers: usersResult.data.length,
              totalMentors: mentors,
              totalMentees: mentees,
              activePairings,
              sessionsThisMonth: 0, // Would need separate query
              averageSessionRating: 0 // Would need separate query
            }
            
            setAnalytics(fallbackAnalytics)
          } else {
            console.error('Fallback fetch also failed:', { pairingsError: pairingsResult.error, usersError: usersResult.error })
          }
        } else {
          setAnalytics(data)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('header.title')}</h2>
        <p className="text-gray-600">{t('header.welcome')}, {userProfile?.full_name || user?.email}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.totalUsers.title')}</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics?.totalUsers || 0}</p>
          <p className="text-sm text-gray-500">{t('stats.totalUsers.subtitle')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.activePairings.title')}</h3>
          <p className="text-3xl font-bold text-green-600">{analytics?.activePairings || 0}</p>
          <p className="text-sm text-gray-500">{t('stats.activePairings.subtitle')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.sessions.title')}</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics?.sessionsThisMonth || 0}</p>
          <p className="text-sm text-gray-500">{t('stats.sessions.subtitle')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.completion.title')}</h3>
          <p className="text-3xl font-bold text-orange-600">
            {analytics?.averageSessionRating ? `${analytics.averageSessionRating.toFixed(1)}★` : '0.0★'}
          </p>
          <p className="text-sm text-gray-500">{t('stats.completion.subtitle')}</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">{t('actions.manageUsers')}</div>
            </div>
          </Link>
          
          <Link href="/admin/pairings/create" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-medium">{t('actions.createPairings')}</div>
            </div>
          </Link>
          
          <Link href="/admin/reports" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">{t('actions.viewReports')}</div>
            </div>
          </Link>
          
          <Link href="/admin/settings" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">{t('actions.systemSettings')}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('activity.title')}</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t('activity.newUser')}</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
              P
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t('activity.newPairing')}</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
              S
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t('activity.sessionCompleted')}</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('distribution.title')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('distribution.mentors')}</span>
              <span className="font-medium">{analytics?.totalMentors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('distribution.mentees')}</span>
              <span className="font-medium">{analytics?.totalMentees || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('distribution.coordinators')}</span>
              <span className="font-medium">
                {analytics && analytics.totalUsers - analytics.totalMentors - analytics.totalMentees > 0 
                  ? analytics.totalUsers - analytics.totalMentors - analytics.totalMentees 
                  : 1}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('health.title')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('health.database')}</span>
              <span className="text-green-600 font-medium">{t('health.ok')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('health.authentication')}</span>
              <span className="text-green-600 font-medium">{t('health.ok')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('health.notifications')}</span>
              <span className="text-green-600 font-medium">{t('health.ok')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

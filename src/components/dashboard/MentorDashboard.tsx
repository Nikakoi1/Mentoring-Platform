'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getMentorStats, getUpcomingSessions } from '@/lib/services/database'
import type { MentorStats, Session } from '@/lib/types/database'

export function MentorDashboard() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<MentorStats | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        const [statsResult, sessionsResult] = await Promise.all([
          getMentorStats(user.id),
          getUpcomingSessions(user.id)
        ])

        if (statsResult.data) setStats(statsResult.data)
        if (sessionsResult.data) setUpcomingSessions(sessionsResult.data)
      } catch (error) {
        console.error('Error loading mentor dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Dashboard</h2>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name || user?.email}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Mentees</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.active_mentees || 0}</p>
          <p className="text-sm text-gray-500">Currently mentoring</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.total_sessions || 0}</p>
          <p className="text-sm text-gray-500">Sessions completed</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Sessions</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.upcoming_sessions || 0}</p>
          <p className="text-sm text-gray-500">Sessions scheduled</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/sessions/schedule" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium">Schedule Session</div>
            </div>
          </Link>
          
          <Link href="/mentor/mentees" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">View Mentees</div>
            </div>
          </Link>
          
          <Link href="/mentor/progress" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Progress Reports</div>
            </div>
          </Link>
          
          <Link href="/resources" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Resources</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{session.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
                    {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Join
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming sessions scheduled.</p>
        )}
      </div>
    </div>
  )
}

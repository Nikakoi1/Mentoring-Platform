'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getMenteeProgress, getUpcomingSessions, getUserPairings } from '@/lib/services/database'
import type { MenteeProgress, Session, PairingWithUsers } from '@/lib/types/database'

export function MenteeDashboard() {
  const { user, userProfile } = useAuth()
  const [progress, setProgress] = useState<MenteeProgress | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        const [progressResult, sessionsResult, pairingsResult] = await Promise.all([
          getMenteeProgress(user.id),
          getUpcomingSessions(user.id),
          getUserPairings(user.id)
        ])

        if (progressResult.data) setProgress(progressResult.data)
        if (sessionsResult.data) setUpcomingSessions(sessionsResult.data)
        if (pairingsResult.data) setPairings(pairingsResult.data)
      } catch (error) {
        console.error('Error loading mentee dashboard:', error)
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentee Dashboard</h2>
        <p className="text-gray-600">Welcome back, {userProfile?.full_name || user?.email}!</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{progress?.goal_completion_rate || 0}%</p>
          <p className="text-sm text-gray-500">{progress?.completed_goals || 0} of {progress?.total_goals || 0} goals completed</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Attendance</h3>
          <p className="text-3xl font-bold text-green-600">{progress?.session_attendance_rate || 0}%</p>
          <p className="text-sm text-gray-500">{progress?.completed_sessions || 0} of {progress?.total_sessions || 0} sessions attended</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Mentors</h3>
          <p className="text-3xl font-bold text-purple-600">{pairings.length}</p>
          <p className="text-sm text-gray-500">Currently paired with</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/goals/create" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Set Goals</div>
            </div>
          </Link>
          
          <Link href="/progress/log" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Log Progress</div>
            </div>
          </Link>
          
          <Link href="/messages" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">Message Mentor</div>
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

      {/* Current Mentors */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mentors</h3>
        {pairings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairings.map((pairing) => (
              <div key={pairing.id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {pairing.mentor?.full_name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h4 className="font-medium">{pairing.mentor?.full_name || 'Mentor'}</h4>
                    <p className="text-sm text-gray-600">{pairing.mentor?.mentor?.expertise_areas?.join(', ') || 'General Mentoring'}</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Link href={`/messages/${pairing.id}?recipientId=${pairing.mentor.id}`}>
                    <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">Message</span>
                  </Link>
                  <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You&apos;re not currently paired with any mentors.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Find a Mentor
            </button>
          </div>
        )}
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

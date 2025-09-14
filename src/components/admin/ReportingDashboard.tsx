'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getPlatformAnalytics } from '@/lib/services/database'

// Dummy data for now - will be replaced with live data
const initialReportData = {
  totalUsers: 0,
  totalMentors: 0,
  totalMentees: 0,
  activePairings: 0,
  sessionsThisMonth: 0,
  averageSessionRating: 0,
}

export function ReportingDashboard() {
  const { userProfile } = useAuth()
  const [reportData, setReportData] = useState(initialReportData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReportData = async () => {
      if (userProfile?.role !== 'coordinator') {
        setError('You do not have permission to view this page.')
        setLoading(false)
        return
      }
      // TODO: Fetch real data from the database
      // For now, we'll just use the dummy data after a short delay
      const { data, error } = await getPlatformAnalytics()
      if (error) {
        setError('Failed to load analytics data.')
        console.error(error)
      } else if (data) {
        setReportData(data)
      }
      setLoading(false)
    }
    fetchReportData()
  }, [userProfile])

  if (loading) {
    return <div className="text-center p-8">Loading reports...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-4xl font-bold text-blue-600">{reportData.totalUsers}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">Active Pairings</h3>
            <p className="text-4xl font-bold text-green-600">{reportData.activePairings}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">Sessions This Month</h3>
            <p className="text-4xl font-bold text-purple-600">{reportData.sessionsThisMonth}</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Detailed Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">User Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mentors</span>
                  <span className="font-bold text-lg">{reportData.totalMentors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mentees</span>
                  <span className="font-bold text-lg">{reportData.totalMentees}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Session Rating</span>
                  <span className="font-bold text-lg">{reportData.averageSessionRating.toFixed(1)} / 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

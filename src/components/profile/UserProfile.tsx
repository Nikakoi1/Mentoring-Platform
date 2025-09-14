'use client'

import { useState, useEffect } from 'react'
import { getUserProfile } from '@/lib/services/database'
import type { UserWithRole } from '@/lib/types/database'

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data, error } = await getUserProfile(userId)
      if (error) {
        setError('Failed to load user profile.')
        console.error(error)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [userId])

  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>
  }

  if (error || !profile) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error || 'Profile not found.'}</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-gray-600">{profile.email}</p>
            <span className="mt-2 inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full capitalize">
              {profile.role}
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
            <p><strong>Location:</strong> {profile.location || 'Not provided'}</p>
            <p><strong>Timezone:</strong> {profile.timezone || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {profile.role === 'mentor' && profile.mentor && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Mentor Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Bio</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.mentor.bio || 'No bio provided.'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Skills</h3>
              <p className="text-gray-700">{profile.mentor.skills?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Areas of Expertise</h3>
              <p className="text-gray-700">{profile.mentor.expertise_areas?.join(', ') || 'Not specified'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Years of Experience:</strong> {profile.mentor.years_experience}</p>
              {profile.mentor.linkedin_url && (
                <p><strong>LinkedIn:</strong> <a href={profile.mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a></p>
              )}
            </div>
          </div>
        </div>
      )}

      {profile.role === 'mentee' && profile.mentee && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Mentee Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Career Goals</h3>
              <p className="text-gray-700">{profile.mentee.career_goals?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Learning Objectives</h3>
              <p className="text-gray-700">{profile.mentee.learning_objectives?.join(', ') || 'Not specified'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Experience Level:</strong> <span className="capitalize">{profile.mentee.current_level}</span></p>
              <p><strong>Years of Experience:</strong> {profile.mentee.years_experience}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserProfileForm } from '@/components/profile/UserProfileForm'
import { MentorProfileForm } from '@/components/profile/MentorProfileForm'
import { MenteeProfileForm } from '@/components/profile/MenteeProfileForm'

export function EditProfile() {
  const { userProfile, loading } = useAuth()

  if (loading || !userProfile) {
    return <div className="text-center p-8">Loading profile...</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
        {/* General User Profile Form */}
        <UserProfileForm userProfile={userProfile} />
      </div>

      {/* Role-Specific Profile Form */}
      {userProfile.role === 'mentor' && userProfile.mentor && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-6">Mentor Details</h2>
          <MentorProfileForm mentorProfile={userProfile.mentor} />
        </div>
      )}

      {userProfile.role === 'mentee' && userProfile.mentee && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-6">Mentee Details</h2>
          <MenteeProfileForm menteeProfile={userProfile.mentee} />
        </div>
      )}
    </div>
  )
}

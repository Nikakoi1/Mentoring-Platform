'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/lib/services/database'
import type { UserWithRole } from '@/lib/types/database'

interface UserProfileFormProps {
  userProfile: UserWithRole;
}

export function UserProfileForm({ userProfile }: UserProfileFormProps) {
  const [fullName, setFullName] = useState(userProfile.full_name || '')
  const [phone, setPhone] = useState(userProfile.phone || '')
  const [location, setLocation] = useState(userProfile.location || '')
  const [timezone, setTimezone] = useState(userProfile.timezone || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const updates = {
      full_name: fullName,
      phone,
      location,
      timezone,
    }

    const { error: updateError } = await updateUserProfile(userProfile.id, updates)

    if (updateError) {
      setError(`Failed to update profile: ${updateError.message}`)
    } else {
      setSuccess('Profile updated successfully!')
      // Optionally, refresh the user profile in the auth context
    }
    setSubmitting(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., San Francisco, CA"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g., PST"
          />
        </div>
      </div>

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
      {success && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{success}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

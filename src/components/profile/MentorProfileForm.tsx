'use client'

import { useState } from 'react'
import { updateMentorProfile } from '@/lib/services/database'
import type { Mentor } from '@/lib/types/database'

interface MentorProfileFormProps {
  mentorProfile: Mentor;
}

export function MentorProfileForm({ mentorProfile }: MentorProfileFormProps) {
  const [bio, setBio] = useState(mentorProfile.bio || '')
  const [skills, setSkills] = useState((mentorProfile.skills || []).join(', '))
  const [expertiseAreas, setExpertiseAreas] = useState((mentorProfile.expertise_areas || []).join(', '))
  const [yearsExperience, setYearsExperience] = useState(mentorProfile.years_experience || 0)
  const [linkedinUrl, setLinkedinUrl] = useState(mentorProfile.linkedin_url || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const updates = {
      bio,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      expertise_areas: expertiseAreas.split(',').map(s => s.trim()).filter(Boolean),
      years_experience: yearsExperience,
      linkedin_url: linkedinUrl,
    }

    const { error: updateError } = await updateMentorProfile(mentorProfile.id, updates)

    if (updateError) {
      setError(`Failed to update mentor details: ${updateError.message}`)
    } else {
      setSuccess('Mentor details updated successfully!')
    }
    setSubmitting(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Share a bit about your background, experience, and what you enjoy about mentoring."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Skills</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., React, Node.js, Python"
          />
          <p className="text-xs text-gray-500 mt-1">Separate skills with a comma.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Areas of Expertise</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={expertiseAreas}
            onChange={(e) => setExpertiseAreas(e.target.value)}
            placeholder="e.g., Frontend Development, DevOps"
          />
           <p className="text-xs text-gray-500 mt-1">Separate areas with a comma.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Years of Experience</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn Profile URL</label>
          <input
            type="url"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-profile"
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
          {submitting ? 'Saving...' : 'Save Mentor Details'}
        </button>
      </div>
    </form>
  )
}

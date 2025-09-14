'use client'

import { useState } from 'react'
import { updateMenteeProfile } from '@/lib/services/database'
import type { Mentee, ExperienceLevel } from '@/lib/types/database'

interface MenteeProfileFormProps {
  menteeProfile: Mentee;
}

export function MenteeProfileForm({ menteeProfile }: MenteeProfileFormProps) {
  const [careerGoals, setCareerGoals] = useState((menteeProfile.career_goals || []).join(', '))
  const [learningObjectives, setLearningObjectives] = useState((menteeProfile.learning_objectives || []).join(', '))
  const [yearsExperience, setYearsExperience] = useState(menteeProfile.years_experience || 0)
  const [currentLevel, setCurrentLevel] = useState<ExperienceLevel>(menteeProfile.current_level || 'beginner')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const updates = {
      career_goals: careerGoals.split(',').map(s => s.trim()).filter(Boolean),
      learning_objectives: learningObjectives.split(',').map(s => s.trim()).filter(Boolean),
      years_experience: yearsExperience,
      current_level: currentLevel,
    }

    const { error: updateError } = await updateMenteeProfile(menteeProfile.id, updates)

    if (updateError) {
      setError(`Failed to update mentee details: ${updateError.message}`)
    } else {
      setSuccess('Mentee details updated successfully!')
    }
    setSubmitting(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Career Goals</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={careerGoals}
          onChange={(e) => setCareerGoals(e.target.value)}
          rows={3}
          placeholder="e.g., Become a Senior Developer, Lead a team"
        />
        <p className="text-xs text-gray-500 mt-1">Separate goals with a comma.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Learning Objectives</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          rows={3}
          placeholder="e.g., Improve TypeScript skills, Learn system design"
        />
        <p className="text-xs text-gray-500 mt-1">Separate objectives with a comma.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Years of Professional Experience</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Current Skill Level</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value as ExperienceLevel)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
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
          {submitting ? 'Saving...' : 'Save Mentee Details'}
        </button>
      </div>
    </form>
  )
}

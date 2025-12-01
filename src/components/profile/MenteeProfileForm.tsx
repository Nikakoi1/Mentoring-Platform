'use client'

import { useState } from 'react'

import { updateMenteeProfile } from '@/lib/services/database'
import type { Mentee, ExperienceLevel } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

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
  const { t } = useTranslations({
    namespace: 'profile.form.mentee',
    defaults: {
      'label.careerGoals': 'Career Goals',
      'label.learningObjectives': 'Learning Objectives',
      'label.yearsExperience': 'Years of Professional Experience',
      'label.currentLevel': 'Current Skill Level',
      'placeholder.careerGoals': 'e.g., Become a Senior Developer, Lead a team',
      'placeholder.learningObjectives': 'e.g., Improve TypeScript skills, Learn system design',
      'hint.separator': 'Separate values with a comma.',
      'options.level.beginner': 'Beginner',
      'options.level.intermediate': 'Intermediate',
      'options.level.advanced': 'Advanced',
      'error.update': 'Failed to update mentee details',
      'success.update': 'Mentee details updated successfully!',
      'cta.saving': 'Saving...',
      'cta.submit': 'Save Mentee Details'
    }
  })

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
      setError(`${t('error.update')}: ${updateError.message}`)
    } else {
      setSuccess(t('success.update'))
    }
    setSubmitting(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">{t('label.careerGoals')}</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={careerGoals}
          onChange={(e) => setCareerGoals(e.target.value)}
          rows={3}
          placeholder={t('placeholder.careerGoals')}
        />
        <p className="text-xs text-gray-500 mt-1">{t('hint.separator')}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('label.learningObjectives')}</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          rows={3}
          placeholder={t('placeholder.learningObjectives')}
        />
        <p className="text-xs text-gray-500 mt-1">{t('hint.separator')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t('label.yearsExperience')}</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('label.currentLevel')}</label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value as ExperienceLevel)}
          >
            <option value="beginner">{t('options.level.beginner')}</option>
            <option value="intermediate">{t('options.level.intermediate')}</option>
            <option value="advanced">{t('options.level.advanced')}</option>
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
          {submitting ? t('cta.saving') : t('cta.submit')}
        </button>
      </div>
    </form>
  )
}

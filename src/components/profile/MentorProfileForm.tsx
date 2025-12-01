'use client'

import { useState } from 'react'

import { updateMentorProfile } from '@/lib/services/database'
import type { Mentor } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

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
  const { t } = useTranslations({
    namespace: 'profile.form.mentor',
    defaults: {
      'label.bio': 'Bio',
      'label.skills': 'Skills',
      'label.expertise': 'Areas of Expertise',
      'label.experience': 'Years of Experience',
      'label.linkedin': 'LinkedIn Profile URL',
      'placeholder.bio': 'Share a bit about your background, experience, and what you enjoy about mentoring.',
      'placeholder.skills': 'e.g., React, Node.js, Python',
      'placeholder.expertise': 'e.g., Frontend Development, DevOps',
      'placeholder.linkedin': 'https://linkedin.com/in/your-profile',
      'hint.separator': 'Separate values with a comma.',
      'error.update': 'Failed to update mentor details',
      'success.update': 'Mentor details updated successfully!',
      'cta.saving': 'Saving...',
      'cta.submit': 'Save Mentor Details'
    }
  })

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
      setError(`${t('error.update')}: ${updateError.message}`)
    } else {
      setSuccess(t('success.update'))
    }
    setSubmitting(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">{t('label.bio')}</label>
        <textarea
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder={t('placeholder.bio')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t('label.skills')}</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder={t('placeholder.skills')}
          />
          <p className="text-xs text-gray-500 mt-1">{t('hint.separator')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('label.expertise')}</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={expertiseAreas}
            onChange={(e) => setExpertiseAreas(e.target.value)}
            placeholder={t('placeholder.expertise')}
          />
           <p className="text-xs text-gray-500 mt-1">{t('hint.separator')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('label.experience')}</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value, 10))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('label.linkedin')}</label>
          <input
            type="url"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder={t('placeholder.linkedin')}
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
          {submitting ? t('cta.saving') : t('cta.submit')}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import { createPairing, getAllUsers } from '@/lib/services/database'
import type { User } from '@/lib/types/database'

export function CreatePairingForm() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [mentors, setMentors] = useState<User[]>([])
  const [mentees, setMentees] = useState<User[]>([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [selectedMenteeId, setSelectedMenteeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { t } = useTranslations({
    namespace: 'adminPairingsCreate',
    defaults: {
      title: 'Create a New Pairing',
      subtitle: 'Assign a mentor to a mentee to begin their journey.',
      mentorLabel: 'Select Mentor',
      mentorPlaceholder: '-- Select a mentor --',
      menteeLabel: 'Select Mentee',
      menteePlaceholder: '-- Select a mentee --',
      loading: 'Loading mentors and mentees...',
      noPermission: 'You do not have permission to perform this action.',
      loadError: 'Failed to load users. Please try again later.',
      validationSelectBoth: 'Please select both a mentor and a mentee.',
      success: 'Pairing created successfully!',
      buttonCreate: 'Create Pairing',
      buttonCreating: 'Creating Pairing...',
      errorGeneric: 'Something went wrong. Please try again.'
    }
  })

  useEffect(() => {
    const fetchUsers = async () => {
      if (userProfile?.role !== 'coordinator') {
        setError(t('noPermission'))
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await getAllUsers()
      if (error) {
        setError(t('loadError'))
        console.error(error)
      } else if (data) {
        setMentors(data.filter(u => u.role === 'mentor' && u.active))
        setMentees(data.filter(u => u.role === 'mentee' && u.active))
      }
      setLoading(false)
    }
    fetchUsers()
  }, [userProfile, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMentorId || !selectedMenteeId) {
      setError(t('validationSelectBoth'))
      return
    }
    setSubmitting(true)
    setError('')

    const pairingData = {
      mentor_id: selectedMentorId,
      mentee_id: selectedMenteeId,
      coordinator_id: userProfile?.id,
      status: 'active' as const,
      start_date: new Date().toISOString(),
    }

    const { error: createError } = await createPairing(pairingData)

    if (createError) {
      setError(createError.message ?? t('errorGeneric'))
    } else {
      alert(t('success'))
      router.push('/admin/users') // Redirect to user management or a new pairings page
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (error && !loading) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('mentorLabel')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              required
            >
              <option value="" disabled>{t('mentorPlaceholder')}</option>
              {mentors.map(mentor => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.full_name || mentor.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('menteeLabel')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMenteeId}
              onChange={(e) => setSelectedMenteeId(e.target.value)}
              required
            >
              <option value="" disabled>{t('menteePlaceholder')}</option>
              {mentees.map(mentee => (
                <option key={mentee.id} value={mentee.id}>
                  {mentee.full_name || mentee.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? t('buttonCreating') : t('buttonCreate')}
        </button>
      </form>
    </div>
  )
}

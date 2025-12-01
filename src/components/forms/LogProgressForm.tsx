'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { createProgressEntry, getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers, ProgressEntryType, ProgressVisibility } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

export function LogProgressForm() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [selectedPairingId, setSelectedPairingId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [entryType, setEntryType] = useState<ProgressEntryType>('reflection')
  const [visibility, setVisibility] = useState<ProgressVisibility>('mentor')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const { t } = useTranslations({
    namespace: 'progress.log',
    defaults: {
      'loading.profile': 'Loading your profile...',
      'loading.pairings': 'Loading your mentee pairings...',
      'error.loadPairings': 'Failed to load your mentee pairings. Please try again later.',
      'error.noPairings': 'You must be paired with a mentee to log progress.',
      'error.selectPairing': 'Please select a mentee pairing.',
      'error.invalidPairing': 'Invalid pairing selected.',
      'error.roleRestricted': 'Only mentors can log mentee progress.',
      'error.generic': 'Something went wrong. Please try again.',
      'title': 'Log Mentee Progress',
      'subtitle': 'Share an update on your mentee’s journey.',
      'label.title': 'Title',
      'placeholder.title': 'e.g., Completed React Tutorial',
      'label.content': 'Progress Update',
      'placeholder.content': "Describe what you've accomplished, any challenges you faced, and what you learned.",
      'label.entryType': 'Entry Type',
      'entryType.reflection': 'Reflection',
      'entryType.milestone': 'Milestone',
      'entryType.achievement': 'Achievement',
      'entryType.feedback': 'Feedback Request',
      'label.visibility': 'Visibility',
      'visibility.mentor': 'Mentor Only',
      'visibility.private': 'Private (Just for me)',
      'cta.loading': 'Logging Progress...',
      'cta.submit': 'Log Progress',
      'success': 'Progress logged successfully!'
    }
  })

  const isMentor = userProfile?.role === 'mentor'

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user?.id || !userProfile) {
        return
      }

      if (!isMentor) {
        setLoading(false)
        setPairings([])
        setErrorKey('error.roleRestricted')
        setErrorMessage('')
        return
      }

      setLoading(true)
      setErrorKey(null)
      setErrorMessage('')
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setErrorKey('error.loadPairings')
        setErrorMessage('')
        console.error(error)
      } else if (data) {
        const mentorPairings = data.filter((p: PairingWithUsers) => p.mentor_id === user.id)
        setPairings(mentorPairings)
        if (mentorPairings.length === 1) {
          setSelectedPairingId(mentorPairings[0].id)
        }
        setErrorKey(null)
        setErrorMessage('')
      }
      setLoading(false)
    }
    void fetchPairings()
  }, [user?.id, userProfile, isMentor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPairingId || !isMentor) {
      setErrorKey('error.selectPairing')
      setErrorMessage('')
      return
    }
    setSubmitting(true)
    setErrorKey(null)
    setErrorMessage('')

    const selectedPairing = pairings.find((p) => p.id === selectedPairingId)
    if (!selectedPairing) {
      setErrorKey('error.invalidPairing')
      setErrorMessage('')
      setSubmitting(false)
      return
    }

    const progressData = {
      pairing_id: selectedPairingId,
      mentee_id: selectedPairing.mentee_id,
      mentor_id: selectedPairing.mentor_id,
      entry_type: entryType,
      title,
      content,
      visibility,
    }

    const { error: createError } = await createProgressEntry(progressData)

    if (createError) {
      if (createError.message) {
        setErrorMessage(createError.message)
        setErrorKey(null)
      } else {
        setErrorKey('error.generic')
        setErrorMessage('')
      }
    } else {
      alert(t('success'))
      router.push('/dashboard')
    }
    setSubmitting(false)
  }

  const resolvedError = errorKey ? t(errorKey) : errorMessage

  if (!userProfile) {
    return <div className="text-center p-8">{t('loading.profile')}</div>
  }

  if (!isMentor) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">{t('error.roleRestricted')}</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center p-8">{t('loading.pairings')}</div>
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">{t('error.noPairings')}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input type="hidden" value={selectedPairingId} />

          <div>
            <label className="block text-sm font-medium mb-1">{t('label.title')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('placeholder.title')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('label.content')}</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder={t('placeholder.content')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('label.entryType')}</label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as ProgressEntryType)}
              >
                <option value="reflection">{t('entryType.reflection')}</option>
                <option value="milestone">{t('entryType.milestone')}</option>
                <option value="achievement">{t('entryType.achievement')}</option>
                <option value="feedback">{t('entryType.feedback')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('label.visibility')}</label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ProgressVisibility)}
              >
                <option value="mentor">{t('visibility.mentor')}</option>
                <option value="private">{t('visibility.private')}</option>
              </select>
            </div>
          </div>
        </div>

        {resolvedError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {resolvedError}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? t('cta.loading') : t('cta.submit')}
        </button>
      </form>
    </div>
  )
}

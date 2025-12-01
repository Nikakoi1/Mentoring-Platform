'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { createGoal, getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers, CreateGoalForm as CreateGoalFormType, GoalPriority } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

export function CreateGoalForm() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [selectedPairingId, setSelectedPairingId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [priority, setPriority] = useState<GoalPriority>('medium')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const { t } = useTranslations({
    namespace: 'goals.create',
    defaults: {
      'loading.profile': 'Loading your profile...',
      'loading.pairings': 'Loading your mentee pairings...',
      'error.loadPairings': 'Failed to load your mentee pairings. Please try again later.',
      'error.noPairings': 'You must be paired with a mentee to set goals.',
      'error.selectPairing': 'Please select a mentee pairing.',
      'error.roleRestricted': 'Only mentors can set mentorship goals.',
      'title': 'Set a New Goal',
      'subtitle': 'Define a new goal for your mentee.',
      'label.selectMentor': 'Select Mentee Pairing',
      'option.selectMentor': '-- Select a mentee --',
      'label.title': 'Goal Title',
      'placeholder.title': 'e.g., Master React Hooks',
      'label.description': 'Description (Optional)',
      'placeholder.description': 'Specific, measurable, achievable, relevant, time-bound objectives.',
      'label.category': 'Category',
      'placeholder.category': 'e.g., Technical Skills',
      'label.targetDate': 'Target Date (Optional)',
      'label.priority': 'Priority',
      'priority.low': 'Low',
      'priority.medium': 'Medium',
      'priority.high': 'High',
      'cta.loading': 'Creating Goal...',
      'cta.submit': 'Create Goal',
      'success': 'Goal created successfully!'
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
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setErrorKey('error.loadPairings')
        setErrorMessage('')
        console.error(error)
      } else if (data) {
        const mentorPairings = data.filter((pairing: PairingWithUsers) => pairing.mentor_id === user.id)
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

    const selectedPairing = pairings.find((pairing) => pairing.id === selectedPairingId)
    if (!selectedPairing) {
      setErrorKey('error.selectPairing')
      setSubmitting(false)
      return
    }

    const goalData: CreateGoalFormType & { mentee_id: string } = {
      pairing_id: selectedPairingId,
      mentee_id: selectedPairing.mentee_id,
      title,
      description,
      category,
      target_date: targetDate || undefined,
      priority,
    }

    const { error: createError } = await createGoal(goalData)

    if (createError) {
      if (createError.message) {
        setErrorMessage(createError.message)
        setErrorKey(null)
      } else {
        setErrorKey('error.loadPairings')
        setErrorMessage('')
      }
    } else {
      alert(t('success'))
      router.push('/goals')
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
          <div>
            <label className="block text-sm font-medium mb-1">{t('label.selectMentor')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPairingId}
              onChange={(e) => setSelectedPairingId(e.target.value)}
              required
            >
              <option value="" disabled>{t('option.selectMentor')}</option>
              {pairings.map(p => (
                <option key={p.id} value={p.id}>
                  {p.mentee.full_name || p.mentee.email}
                </option>
              ))}
            </select>
          </div>

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
            <label className="block text-sm font-medium mb-1">{t('label.description')}</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('placeholder.description')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('label.category')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('placeholder.category')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('label.targetDate')}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium mb-1">{t('label.priority')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value as GoalPriority)}
            >
              <option value="low">{t('priority.low')}</option>
              <option value="medium">{t('priority.medium')}</option>
              <option value="high">{t('priority.high')}</option>
            </select>
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

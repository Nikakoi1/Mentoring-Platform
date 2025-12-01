'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import {
  createClientVisit,
  createSession,
  getGoalsByPairingIds,
  getMenteeClients,
  getUserPairings
} from '@/lib/services/database'
import type { Client, Goal, PairingWithUsers } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

export function ScheduleSessionForm() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedMenteeIds, setSelectedMenteeIds] = useState<string[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [loadingGoals, setLoadingGoals] = useState(false)
  const [goalErrorKey, setGoalErrorKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const role = userProfile?.role
  const isMentor = role === 'mentor'
  const isMentee = role === 'mentee'
  const { t } = useTranslations({
    namespace: 'sessions.schedule',
    defaults: {
      'loading.pairings': 'Loading your mentees...',
      'loading.clients': 'Loading your clients...',
      'loading.profile': 'Loading your profile...',
      'error.loadPairings': 'Failed to load your mentees. Please try again later.',
      'error.loadClients': 'Failed to load your clients. Please try again later.',
      'error.loadGoals': 'Failed to load goals for this mentee. You can still schedule without selecting one.',
      'error.selectMentee': 'Please select a mentee.',
      'error.selectClient': 'Please select a client.',
      'error.invalidMentee': 'Selected mentee is not in an active pairing.',
      'error.invalidClient': 'Selected client could not be found.',
      'error.generic': 'Something went wrong. Please try again.',
      'error.unsupportedRole': 'Scheduling is only available to mentors and mentees.',
      'empty.message': "You don't have any active mentees to schedule a session with.",
      'empty.clients': "You don't have any clients yet. Add one before scheduling a visit.",
      'title.mentor': 'Schedule a New Session',
      'subtitle.mentor': 'Fill out the details below to book a session with your mentee.',
      'title.mentee': 'Schedule a Client Visit',
      'subtitle.mentee': 'Fill out the details below to schedule a visit with your client.',
      'label.mentees': 'Select Mentees',
      'placeholder.mentees': '-- Choose one or more mentees --',
      'label.mentee': 'Select Mentee',
      'placeholder.mentee': '-- Select a mentee --',
      'label.client': 'Select Client',
      'placeholder.client': '-- Select a client --',
      'label.title': 'Session Title',
      'placeholder.title': 'e.g., Weekly Check-in',
      'label.description': 'Description (Optional)',
      'placeholder.description': 'Topics to discuss, goals for the session, etc.',
      'label.goal': 'Associate Goal (Optional)',
      'placeholder.goal': '-- Select a goal (optional) --',
      'empty.goals': 'This mentee has no goals yet.',
      'loading.goals': 'Loading goals...',
      'helper.goal.optional': 'Optional: associate this session with a goal.',
      'label.datetime': 'Date and Time',
      'label.duration': 'Duration (minutes)',
      'cta.loading': 'Scheduling...',
      'cta.loadingVisit': 'Scheduling visit...',
      'cta.submit': 'Schedule Session',
      'cta.submitVisit': 'Schedule Visit',
      'success.mentor': 'Session scheduled successfully!',
      'success.mentee': 'Visit scheduled successfully!'
    }
  })

  useEffect(() => {
    if (!user?.id || !role) return

    const fetchData = async () => {
      setLoading(true)
      try {
        if (isMentor) {
          const { data, error } = await getUserPairings(user.id)
          if (error) {
            setErrorKey('error.loadPairings')
            setErrorMessage('')
            console.error(error)
          } else if (data) {
            setPairings(data.filter(p => p.mentor_id === user.id))
            setErrorKey(null)
            setErrorMessage('')
          }
          setClients([])
        } else if (isMentee) {
          const { data, error } = await getMenteeClients(user.id)
          if (error) {
            setErrorKey('error.loadClients')
            setErrorMessage('')
            console.error(error)
          } else {
            setClients(data ?? [])
            setErrorKey(null)
            setErrorMessage('')
          }
          setPairings([])
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [user?.id, role, isMentor, isMentee])

  useEffect(() => {
    setSelectedMenteeIds([])
    setSelectedClientId('')
    setSelectedGoalId('')
    setGoals([])
    setGoalErrorKey(null)
  }, [role])

  useEffect(() => {
    if (!isMentor) {
      return
    }

    const fetchGoals = async () => {
      if (pairings.length === 0) {
        setGoals([])
        setSelectedGoalId('')
        setGoalErrorKey(null)
        return
      }

      setLoadingGoals(true)
      const pairingIds = pairings.map((pairing) => pairing.id)
      const { data, error } = await getGoalsByPairingIds(pairingIds)
      if (error) {
        console.error(error)
        setGoalErrorKey('error.loadGoals')
        setGoals([])
      } else {
        setGoalErrorKey(null)
        setGoals(data ?? [])
      }
      setLoadingGoals(false)
    }

    void fetchGoals()
  }, [isMentor, pairings])

  const pairingNameLookup = useMemo(() => {
    const lookup: Record<string, string> = {}
    pairings.forEach((pairing) => {
      lookup[pairing.id] = pairing.mentee.full_name || pairing.mentee.email
    })
    return lookup
  }, [pairings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !role) {
      setErrorKey('error.generic')
      setErrorMessage('')
      return
    }
    setSubmitting(true)
    setErrorKey(null)
    setErrorMessage('')

    let submitError: Error | null = null

    if (isMentor) {
      if (selectedMenteeIds.length === 0) {
        setErrorKey('error.selectMentee')
        setSubmitting(false)
        return
      }

      // For single mentee, use existing pairing_id logic
      // For multiple mentees, we'll handle this in the database service
      const sessionData = {
        mentor_id: user.id,
        mentee_ids: selectedMenteeIds,
        title,
        description,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        goal_id: selectedGoalId || undefined
      }

      const { error: createError } = await createSession(sessionData)
      submitError = createError
    } else if (isMentee) {
      if (!selectedClientId) {
        setErrorKey('error.selectClient')
        setSubmitting(false)
        return
      }

      const selectedClient = clients.find(c => c.id === selectedClientId)
      if (!selectedClient) {
        setErrorKey('error.invalidClient')
        setSubmitting(false)
        return
      }

      const visitData = {
        client_id: selectedClient.id,
        title,
        description,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
      }

      const { error: createError } = await createClientVisit(user.id, visitData)
      submitError = createError
    } else {
      setErrorKey('error.unsupportedRole')
      setSubmitting(false)
      return
    }

    if (submitError) {
      if (submitError.message) {
        setErrorMessage(submitError.message)
        setErrorKey(null)
      } else {
        setErrorKey('error.generic')
        setErrorMessage('')
      }
    } else {
      alert(t(isMentor ? 'success.mentor' : 'success.mentee'))
      router.push('/dashboard')
    }
    setSubmitting(false)
  }

  const resolvedError = errorKey ? t(errorKey) : errorMessage

  if (!user) {
    return <div className="text-center p-8">{t('error.generic')}</div>
  }

  if (!role) {
    return <div className="text-center p-8">{t('loading.profile')}</div>
  }

  if (!isMentor && !isMentee) {
    return <div className="text-center p-8">{t('error.unsupportedRole')}</div>
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        {t(isMentor ? 'loading.pairings' : 'loading.clients')}
      </div>
    )
  }

  if (isMentor && pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">{t('empty.message')}</p>
      </div>
    )
  }

  if (isMentee && clients.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow space-y-4">
        <p className="text-gray-600">{t('empty.clients')}</p>
        <Link
          href="/mentee/clients"
          className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {t('mentee.clients.cta', 'Manage Clients')}
        </Link>
      </div>
    )
  }

  const titleKey = isMentor ? 'title.mentor' : 'title.mentee'
  const subtitleKey = isMentor ? 'subtitle.mentor' : 'subtitle.mentee'
  const partnerLabel = isMentor ? (selectedMenteeIds.length > 1 ? t('label.mentees') : t('label.mentee')) : t('label.client')
  const partnerPlaceholder = isMentor ? (selectedMenteeIds.length > 1 ? t('placeholder.mentees') : t('placeholder.mentee')) : t('placeholder.client')
  const submitCopy = submitting
    ? t(isMentor ? 'cta.loading' : 'cta.loadingVisit')
    : t(isMentor ? 'cta.submit' : 'cta.submitVisit')

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
        <p className="text-sm text-gray-600">{t(subtitleKey)}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{partnerLabel}</label>
            {isMentor ? (
              <div className="space-y-2">
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {pairings.map(p => (
                    <label key={p.mentee.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedMenteeIds.includes(p.mentee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMenteeIds(prev => [...prev, p.mentee.id])
                          } else {
                            setSelectedMenteeIds(prev => prev.filter(id => id !== p.mentee.id))
                          }
                        }}
                      />
                      <span className="text-sm">{p.mentee.full_name || p.mentee.email}</span>
                    </label>
                  ))}
                </div>
                {selectedMenteeIds.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedMenteeIds.length} {selectedMenteeIds.length === 1 ? 'mentee' : 'mentees'} selected
                  </div>
                )}
              </div>
            ) : (
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
              >
                <option value="" disabled>{partnerPlaceholder}</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.display_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isMentor && (
            <div>
              <label htmlFor="mentor-goal-select" className="block text-sm font-medium mb-1">
                {t('label.goal')}
              </label>
              <select
                id="mentor-goal-select"
                aria-describedby="mentor-goal-helper"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                disabled={loadingGoals}
              >
                <option value="">{t('placeholder.goal')}</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {pairingNameLookup[goal.pairing_id]
                      ? `${goal.title} — ${pairingNameLookup[goal.pairing_id]}`
                      : goal.title}
                  </option>
                ))}
              </select>
              <p
                id="mentor-goal-helper"
                className={`text-xs mt-1 ${goalErrorKey ? 'text-red-600' : 'text-gray-500'}`}
              >
                {goalErrorKey
                  ? t(goalErrorKey)
                  : loadingGoals
                    ? t('loading.goals')
                    : goals.length === 0
                      ? t('empty.goals')
                      : t('helper.goal.optional')}
              </p>
            </div>
          )}

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
              <label className="block text-sm font-medium mb-1">{t('label.datetime')}</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('label.duration')}</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                required
                min="15"
              />
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
          {submitCopy}
        </button>
      </form>
    </div>
  )
}

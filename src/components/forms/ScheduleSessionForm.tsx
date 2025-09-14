'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createSession, getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers, CreateSessionForm as CreateSessionFormType } from '@/lib/types/database'

export function ScheduleSessionForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [selectedMenteeId, setSelectedMenteeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setError('Failed to load your mentees. Please try again later.')
        console.error(error)
      } else if (data) {
        setPairings(data.filter(p => p.mentor_id === user.id));
      }
      setLoading(false)
    }
    fetchPairings()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedMenteeId) {
      setError('Please select a mentee.')
      return
    }
    setSubmitting(true)
    setError('')

    const selectedPairing = pairings.find(p => p.mentee_id === selectedMenteeId)
    if (!selectedPairing) {
        setError('Selected mentee is not in an active pairing.')
        setSubmitting(false)
        return
    }

    const sessionData = {
      pairing_id: selectedPairing.id,
      mentor_id: user.id,
      mentee_id: selectedMenteeId,
      title,
      description,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: duration,
    }

    const { error: createError } = await createSession(sessionData)

    if (createError) {
      setError(createError.message)
    } else {
      alert('Session scheduled successfully!')
      router.push('/dashboard')
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center p-8">Loading your mentees...</div>
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">You don't have any active mentees to schedule a session with.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Schedule a New Session</h1>
        <p className="text-sm text-gray-600">Fill out the details below to book a session with your mentee.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Mentee</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMenteeId}
              onChange={(e) => setSelectedMenteeId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a mentee --</option>
              {pairings.map(p => (
                <option key={p.mentee.id} value={p.mentee.id}>
                  {p.mentee.full_name || p.mentee.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Session Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Check-in"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Topics to discuss, goals for the session, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date and Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
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
          {submitting ? 'Scheduling...' : 'Schedule Session'}
        </button>
      </form>
    </div>
  )
}

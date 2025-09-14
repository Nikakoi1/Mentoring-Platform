'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createProgressEntry, getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers, ProgressEntryType, ProgressVisibility } from '@/lib/types/database'

export function LogProgressForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [selectedPairingId, setSelectedPairingId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [entryType, setEntryType] = useState<ProgressEntryType>('reflection')
  const [visibility, setVisibility] = useState<ProgressVisibility>('mentor')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setError('Failed to load your mentor pairings. Please try again later.')
        console.error(error)
      } else if (data) {
        const menteePairings = data.filter(p => p.mentee_id === user.id)
        setPairings(menteePairings)
        if (menteePairings.length === 1) {
          setSelectedPairingId(menteePairings[0].id)
        }
      }
      setLoading(false)
    }
    fetchPairings()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPairingId) {
      setError('Please select a mentor pairing.')
      return
    }
    setSubmitting(true)
    setError('')

    const selectedPairing = pairings.find(p => p.id === selectedPairingId)
    if (!selectedPairing) {
      setError('Invalid pairing selected.')
      setSubmitting(false)
      return
    }

    const progressData = {
      pairing_id: selectedPairingId,
      mentee_id: user.id,
      mentor_id: selectedPairing.mentor_id,
      entry_type: entryType,
      title,
      content,
      visibility,
    }

    const { error: createError } = await createProgressEntry(progressData)

    if (createError) {
      setError(createError.message)
    } else {
      alert('Progress logged successfully!')
      router.push('/dashboard')
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center p-8">Loading your mentor pairings...</div>
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">You must be paired with a mentor to log progress.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Log Your Progress</h1>
        <p className="text-sm text-gray-600">Share an update on your journey.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input type="hidden" value={selectedPairingId} />

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Completed React Tutorial"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Progress Update</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Describe what you've accomplished, any challenges you faced, and what you learned."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entry Type</label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as ProgressEntryType)}
              >
                <option value="reflection">Reflection</option>
                <option value="milestone">Milestone</option>
                <option value="achievement">Achievement</option>
                <option value="feedback">Feedback Request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ProgressVisibility)}
              >
                <option value="mentor">Mentor Only</option>
                <option value="private">Private (Just for me)</option>
              </select>
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
          {submitting ? 'Logging Progress...' : 'Log Progress'}
        </button>
      </form>
    </div>
  )
}

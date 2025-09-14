'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createGoal, getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers, CreateGoalForm as CreateGoalFormType, GoalPriority } from '@/lib/types/database'

export function CreateGoalForm() {
  const { user } = useAuth()
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
        setPairings(data.filter(p => p.mentee_id === user.id));
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

    const goalData: CreateGoalFormType = {
      pairing_id: selectedPairingId,
      title,
      description,
      category,
      target_date: targetDate || undefined,
      priority,
    }

    const { error: createError } = await createGoal(goalData)

    if (createError) {
      setError(createError.message)
    } else {
      alert('Goal created successfully!')
      router.push('/dashboard') // Or a dedicated goals page
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center p-8">Loading your mentor pairings...</div>
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">You must be paired with a mentor to set goals.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Set a New Goal</h1>
        <p className="text-sm text-gray-600">Define a new goal for your mentorship journey.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Mentor</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPairingId}
              onChange={(e) => setSelectedPairingId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a mentor --</option>
              {pairings.map(p => (
                <option key={p.id} value={p.id}>
                  {p.mentor.full_name || p.mentor.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Goal Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master React Hooks"
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
              placeholder="Specific, measurable, achievable, relevant, time-bound objectives."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Technical Skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Date (Optional)</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value as GoalPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
          {submitting ? 'Creating Goal...' : 'Create Goal'}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers } from '@/lib/types/database'
import Link from 'next/link'

export function MenteesList() {
  const { user } = useAuth()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [loading, setLoading] = useState(true)
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
        // Filter for pairings where the current user is the mentor
        setPairings(data.filter(p => p.mentor_id === user.id))
      }
      setLoading(false)
    }
    fetchPairings()
  }, [user])

  if (loading) {
    return <div className="text-center p-8">Loading your mentees...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">You are not currently mentoring anyone.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Your Mentees</h1>
        <div className="space-y-4">
          {pairings.map(pairing => (
            <div key={pairing.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {pairing.mentee.full_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{pairing.mentee.full_name || pairing.mentee.email}</h3>
                  <p className="text-sm text-gray-500">Status: <span className={`font-medium capitalize ${pairing.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{pairing.status}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center">
                <Link href={`/profile/${pairing.mentee.id}`}>
                  <span className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">View Profile</span>
                </Link>
                <Link href={`/messages/${pairing.id}?recipientId=${pairing.mentee.id}`}>
                  <span className="px-4 py-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 cursor-pointer">Message</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

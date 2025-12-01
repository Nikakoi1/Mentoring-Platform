'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { useAuth } from '@/contexts/AuthContext'
import { getUserPairings } from '@/lib/services/database'
import type { PairingWithUsers } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

export function ConversationsList() {
  const { user } = useAuth()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const { t } = useTranslations({
    namespace: 'messages.list',
    defaults: {
      'loading': 'Loading conversations...',
      'error.load': 'Failed to load your conversations. Please try again later.',
      'title': 'Your Conversations',
      'empty': "You don't have any active conversations.",
      'cta.openChat': 'Open Chat'
    }
  })

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user?.id) return
      setLoading(true)
      setErrorKey(null)
      setErrorMessage('')
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setErrorKey('error.load')
        setErrorMessage('')
        console.error(error)
      } else if (data) {
        setPairings(data)
      }
      setLoading(false)
    }
    fetchPairings()
  }, [user?.id])

  const resolvedError = errorKey ? t(errorKey) : errorMessage

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (resolvedError) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{resolvedError}</div>
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        {pairings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pairings.map(pairing => {
              const partner = user?.id === pairing.mentor_id ? pairing.mentee : pairing.mentor;
              const recipientId = partner.id;
              return (
                <Link key={pairing.id} href={`/messages/${pairing.id}?recipientId=${recipientId}`}>
                  <div className="p-4 border rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl">
                        {partner.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{partner.full_name || partner.email}</h3>
                        <p className="text-sm text-gray-500 capitalize">{partner.role}</p>
                      </div>
                    </div>
                    <span className="text-blue-600 hover:underline">{t('cta.openChat')}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

// Force rebuild for single row layout - v3
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import { getAllPairings } from '@/lib/services/database'
import type { PairingWithUsers } from '@/lib/types/database'

export function ExistingPairingsList() {
  const { userProfile } = useAuth()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { t } = useTranslations({
    namespace: 'adminPairingsList',
    defaults: {
      title: 'Existing Mentor-Mentee Pairs',
      loading: 'Loading existing pairs...',
      noPermission: 'You do not have permission to view this information.',
      loadError: 'Failed to load pairings. Please try again later.',
      noPairs: 'No mentor-mentee pairs have been created yet.',
      mentorLabel: 'Mentor:',
      menteeLabel: 'Mentee:',
      coordinatorLabel: 'Coordinator:',
      statusLabel: 'Status:',
      createdLabel: 'Created:',
      activeStatus: 'Active',
      inactiveStatus: 'Inactive',
      pendingStatus: 'Pending'
    }
  })

  useEffect(() => {
    const fetchPairings = async () => {
      if (userProfile?.role !== 'coordinator') {
        setError(t('noPermission'))
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await getAllPairings()
      if (error) {
        setError(t('loadError'))
        console.error(error)
      } else if (data) {
        setPairings(data)
      }
      setLoading(false)
    }
    fetchPairings()
  }, [userProfile, t])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'inactive':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('activeStatus')
      case 'inactive':
        return t('inactiveStatus')
      case 'pending':
        return t('pendingStatus')
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return <div className="text-center p-4">{t('loading')}</div>
  }

  if (error && !loading) {
    return <div className="text-center p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-4 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold">{t('title')}</h2>
      </div>

      {pairings.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          {t('noPairs')}
        </div>
      ) : (
        <div className="space-y-3">
          {pairings.map((pairing) => (
            <div
              key={pairing.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">{t('mentorLabel')}</span>
                  <p className="font-medium">
                    {pairing.mentor?.full_name || pairing.mentor?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">{t('menteeLabel')}</span>
                  <p className="font-medium">
                    {pairing.mentee?.full_name || pairing.mentee?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">{t('statusLabel')}</span>
                  <p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pairing.status)}`}>
                      {getStatusText(pairing.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">{t('createdLabel')}</span>
                  <p className="font-medium">{formatDate(pairing.created_at)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">{t('coordinatorLabel')}</span>
                  <p className="text-sm text-gray-700">
                    {pairing.coordinator?.full_name || pairing.coordinator?.email || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

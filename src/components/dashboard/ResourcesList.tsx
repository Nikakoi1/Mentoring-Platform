'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { useAuth } from '@/contexts/AuthContext'
import { getUserPairings, getPairingResources } from '@/lib/services/database'
import type { PairingWithUsers, Resource } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

interface ResourceWithPairing extends Resource {
  pairing: PairingWithUsers;
}

export function ResourcesList() {
  const { user } = useAuth()
  const [resources, setResources] = useState<ResourceWithPairing[]>([])
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState<string>('')
  const { t } = useTranslations({
    namespace: 'resources.list',
    defaults: {
      'loading': 'Loading resources...',
      'error.load': 'Failed to load resources. Please try again later.',
      'title': 'Shared Resources',
      'cta.upload': 'Upload Resource',
      'empty': 'No resources have been shared in your pairings yet.',
      'label.uploadedBy': 'Uploaded by',
      'label.you': 'You',
      'label.partner': 'Your Partner',
      'cta.download': 'Download'
    }
  })

  useEffect(() => {
    const fetchResources = async () => {
      if (!user) {
        setLoading(false)
        setResources([])
        return
      }
      setLoading(true)
      setErrorKey('')
      try {
        const { data: pairings, error: pairingsError } = await getUserPairings(user.id)
        if (pairingsError) throw pairingsError

        if (!pairings || pairings.length === 0) {
          setLoading(false)
          return
        }

        const allResources: ResourceWithPairing[] = []
        for (const pairing of pairings) {
          const { data: pairingResources, error: resourcesError } = await getPairingResources(pairing.id)
          if (resourcesError) {
            console.warn(`Could not fetch resources for pairing ${pairing.id}:`, resourcesError)
            continue
          }
          if (pairingResources) {
            const resourcesWithPairing = pairingResources.map(res => ({ ...res, pairing }))
            allResources.push(...resourcesWithPairing)
          }
        }

        allResources.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setResources(allResources)

      } catch (err) {
        setErrorKey('error.load')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [user])

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (errorKey) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{t(errorKey)}</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <Link href="/resources/upload">
            <span className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">{t('cta.upload')}</span>
          </Link>
        </div>
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map(resource => (
              <div key={resource.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{resource.title}</h3>
                  <p className="text-sm text-gray-500">{t('label.uploadedBy')}: {resource.uploaded_by === user?.id ? t('label.you') : t('label.partner')}</p>
                  <p className="text-xs text-gray-400">{new Date(resource.created_at).toLocaleDateString()}</p>
                </div>
                <a
                  href={`/api/resources/${resource.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  {t('cta.download')}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

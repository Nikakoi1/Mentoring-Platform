'use client'

import { useState, useEffect } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { getUserPairings, getPairingProgress } from '@/lib/services/database'
import type { ProgressEntry } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

interface ProgressEntryWithMentee extends ProgressEntry {
  menteeName: string;
}

export function ProgressReports() {
  const { user } = useAuth()
  const [progressEntries, setProgressEntries] = useState<ProgressEntryWithMentee[]>([])
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const { t } = useTranslations({
    namespace: 'progress.reports',
    defaults: {
      'loading': 'Loading progress reports...',
      'error.load': 'Failed to load progress reports. Please try again later.',
      'title': "Mentees' Progress Reports",
      'empty': 'No progress has been logged by your mentees yet.',
      'label.from': 'From',
      'entryType.milestone': 'Milestone',
      'entryType.reflection': 'Reflection',
      'entryType.feedback': 'Feedback',
      'entryType.achievement': 'Achievement'
    }
  })

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.id) return
      setLoading(true)
      setErrorKey(null)
      setErrorMessage('')
      try {
        const { data: pairings, error: pairingsError } = await getUserPairings(user.id)
        if (pairingsError) throw pairingsError

        const mentorPairings = pairings?.filter(p => p.mentor_id === user.id) || []
        
        if (mentorPairings.length === 0) {
          setLoading(false)
          return
        }

        const allProgress: ProgressEntryWithMentee[] = []
        for (const pairing of mentorPairings) {
          const { data: entries, error: entriesError } = await getPairingProgress(pairing.id)
          if (entriesError) {
            console.warn(`Could not fetch progress for pairing ${pairing.id}:`, entriesError)
            continue
          }
          if (entries) {
            const entriesWithMenteeName = entries.map(entry => ({
              ...entry,
              menteeName: pairing.mentee.full_name || pairing.mentee.email
            }));
            allProgress.push(...entriesWithMenteeName)
          }
        }

        // Sort entries by date, newest first
        allProgress.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setProgressEntries(allProgress)

      } catch (err) {
        setErrorKey('error.load')
        setErrorMessage('')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user?.id])

  const resolvedError = errorKey ? t(errorKey) : errorMessage

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (resolvedError) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{resolvedError}</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        {progressEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {progressEntries.map(entry => (
              <div key={entry.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{entry.title}</h3>
                    <p className="text-sm text-gray-600">{t('label.from')}: <span className="font-medium">{entry.menteeName}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
                    <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${entry.entry_type === 'milestone' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {t(`entryType.${entry.entry_type}`, entry.entry_type)}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

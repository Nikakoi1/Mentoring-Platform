"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { useAuth } from '@/contexts/AuthContext'
import {
  createClientVisitEvaluation,
  getClientVisitEvaluations,
  getClientVisits,
  getMenteeProgress,
  getPairingResources,
  getUpcomingSessions,
  getUserPairings,
  uploadResource
} from '@/lib/services/database'
import type {
  ClientVisit,
  ClientVisitEvaluation,
  MenteeProgress,
  PairingWithUsers,
  Resource,
  ResourceType,
  Session
} from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'
import { supabase } from '@/lib/supabase/client'

export function MenteeDashboard() {
  const { user, userProfile } = useAuth()
  const [progress, setProgress] = useState<MenteeProgress | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [clientVisits, setClientVisits] = useState<ClientVisit[]>([])
  const [visitEvaluations, setVisitEvaluations] = useState<Record<string, ClientVisitEvaluation[]>>({})
  const [evaluationsLoading, setEvaluationsLoading] = useState(false)
  const [evaluationModal, setEvaluationModal] = useState<{ open: boolean; visit: ClientVisit | null }>({ open: false, visit: null })
  const [evaluationForm, setEvaluationForm] = useState<{ rating: number; comment: string; resource_ids: string[] }>(
    { rating: 5, comment: '', resource_ids: [] }
  )
  const [evaluationSubmitting, setEvaluationSubmitting] = useState(false)
  const [evaluationMessage, setEvaluationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [accessibleResources, setAccessibleResources] = useState<Resource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceDescription, setNewResourceDescription] = useState('')
  const [newResourceType, setNewResourceType] = useState<ResourceType>('document')
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null)
  const [newResourceLink, setNewResourceLink] = useState('')
  const [resourceUploadMessage, setResourceUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resourceUploading, setResourceUploading] = useState(false)
  const resourcesBucket = process.env.NEXT_PUBLIC_SUPABASE_RESOURCES_BUCKET ?? 'resources'
  const [loading, setLoading] = useState(true)
  const { t } = useTranslations({
    namespace: 'dashboard.mentee',
    defaults: {
      'header.title': 'Mentee Dashboard',
      'header.welcome': 'Welcome back',
      'stats.goals.title': 'Goals Progress',
      'stats.goals.detail': 'Goals progress detail',
      'stats.attendance.title': 'Session Attendance',
      'stats.attendance.detail': 'Attendance detail',
      'stats.mentors.title': 'Active Mentors',
      'stats.mentors.subtitle': 'Currently paired with',
      'quickActions.title': 'Quick Actions',
      'quickActions.resources': 'Resources',
      'quickActions.viewClients': 'View Clients',
      'quickActions.scheduleVisit': 'Schedule Visit',
      'mentors.title': 'Your Mentors',
      'mentors.empty': "You're not currently paired with any mentors.",
      'mentors.find': 'Find a Mentor',
      'mentors.message': 'Message',
      'mentors.schedule': 'Schedule',
      'loading.resources': 'Loading resources...',
      'loading.clients': 'Loading evaluations...',
      'sessions.title': 'Upcoming Sessions',
      'sessions.empty': 'No upcoming sessions scheduled.',
      'sessions.join': 'Join',
      'sessions.reschedule': 'Reschedule',
      'visits.title': 'Upcoming Client Visits',
      'visits.empty': 'No client visits scheduled.',
      'visits.manage': 'Manage Clients',
      'visits.reschedule': 'Reschedule',
      'visits.evaluate': 'Evaluate',
      'visits.evaluations.title': 'Evaluation History',
      'visits.evaluations.empty': 'No evaluations yet.',
      'visits.modal.title': 'Evaluate Visit',
      'visits.modal.rating': 'Rate the visit (0 = worst, 10 = best)',
      'visits.modal.comment': 'Comment',
      'visits.modal.commentPlaceholder': 'Share more about how the visit went',
      'visits.modal.resources': 'Attach Existing Resources',
      'visits.modal.resourcesEmpty': 'No shared resources available yet.',
      'visits.modal.resourcesUpload': 'Upload a resource',
      'visits.modal.newResource.title': 'Add New Resource',
      'visits.modal.newResource.name': 'Title',
      'visits.modal.newResource.titlePlaceholder': 'Resource title',
      'visits.modal.newResource.description': 'Description (Optional)',
      'visits.modal.newResource.type': 'Resource Type',
      'visits.modal.newResource.type.document': 'Document',
      'visits.modal.newResource.type.presentation': 'Presentation',
      'visits.modal.newResource.type.image': 'Image',
      'visits.modal.newResource.type.video': 'Video',
      'visits.modal.newResource.type.code': 'Code',
      'visits.modal.newResource.type.link': 'Link',
      'visits.modal.newResource.file': 'File',
      'visits.modal.newResource.filePlaceholder': 'Click to choose a file',
      'visits.modal.newResource.fileHint': 'PDF, PPT, DOC, etc.',
      'visits.modal.newResource.link': 'Link URL',
      'visits.modal.newResource.linkPlaceholder': 'https://',
      'visits.modal.newResource.cta': 'Upload Resource',
      'visits.modal.newResource.uploading': 'Uploading...',
      'visits.modal.newResource.error': 'Failed to upload the resource. Please try again.',
      'visits.modal.newResource.success': 'Resource uploaded successfully!',
      'visits.modal.submit': 'Submit Evaluation',
      'visits.modal.cancel': 'Cancel',
      'visits.modal.success': 'Evaluation saved successfully!',
      'visits.modal.error': 'Failed to save evaluation. Please try again.'
    }
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        const [progressResult, sessionsResult, pairingsResult] = await Promise.all([
          getMenteeProgress(user.id),
          getUpcomingSessions(user.id),
          getUserPairings(user.id)
        ])

        if (progressResult.data) setProgress(progressResult.data)
        if (sessionsResult.data) setUpcomingSessions(sessionsResult.data)
        if (pairingsResult.data) setPairings(pairingsResult.data)

        if (userProfile?.role === 'mentee') {
          const { data: visits } = await getClientVisits(user.id)
          if (visits) {
            const upcoming = visits.filter((visit: ClientVisit) => {
              if (visit.status !== 'scheduled') return false
              return new Date(visit.scheduled_at) >= new Date()
            })
            setClientVisits(upcoming)
          }
        } else {
          setClientVisits([])
        }
      } catch (error) {
        console.error('Error loading mentee dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, userProfile?.role])

  useEffect(() => {
    const loadAccessibleResources = async () => {
      if (!user || userProfile?.role !== 'mentee') {
        setAccessibleResources([])
        return
      }
      if (!pairings.length) {
        setAccessibleResources([])
        return
      }
      setResourcesLoading(true)
      try {
        const allResources: Resource[] = []
        for (const pairing of pairings) {
          const { data, error } = await getPairingResources(pairing.id)
          if (error) {
            console.warn('Failed to load resources for pairing', pairing.id, error)
            continue
          }
          if (data) {
            allResources.push(...data)
          }
        }
        setAccessibleResources(allResources)
      } finally {
        setResourcesLoading(false)
      }
    }

    void loadAccessibleResources()
  }, [pairings, user, userProfile?.role])

  useEffect(() => {
    const loadEvaluations = async () => {
      if (!clientVisits.length) {
        setVisitEvaluations({})
        return
      }

      setEvaluationsLoading(true)
      try {
        const results = await Promise.all(
          clientVisits.map(async (visit: ClientVisit) => {
            const { data, error } = await getClientVisitEvaluations(visit.id)
            if (error) {
              console.error('Failed to load evaluations', error)
              return [visit.id, [] as ClientVisitEvaluation[]] as const
            }
            return [visit.id, data ?? []] as const
          })
        )
        const map = results.reduce<Record<string, ClientVisitEvaluation[]>>((acc, [visitId, evals]) => {
          acc[visitId] = evals
          return acc
        }, {})
        setVisitEvaluations(map)
      } finally {
        setEvaluationsLoading(false)
      }
    }

    if (userProfile?.role === 'mentee') {
      void loadEvaluations()
    }
  }, [clientVisits, userProfile?.role])

  const openEvaluationModal = (visit: ClientVisit) => {
    console.log('Opening evaluation modal for visit:', visit.id)
    // Prevent any accidental navigation by setting a flag
    window.history.replaceState(null, '', '/dashboard')
    setEvaluationModal({ open: true, visit })
    setEvaluationMessage(null)
    setEvaluationForm({ rating: 5, comment: '', resource_ids: [] })
  }

  const closeEvaluationModal = () => {
    console.log('Closing evaluation modal')
    // Ensure we stay on dashboard
    window.history.replaceState(null, '', '/dashboard')
    setEvaluationModal({ open: false, visit: null })
    setEvaluationMessage(null)
    // Reset form state
    setEvaluationForm({ rating: 5, comment: '', resource_ids: [] })
  }

  const toggleResourceSelection = (resourceId: string) => {
    setEvaluationForm((prev) => {
      const exists = prev.resource_ids.includes(resourceId)
      return {
        ...prev,
        resource_ids: exists ? prev.resource_ids.filter((id) => id !== resourceId) : [...prev.resource_ids, resourceId]
      }
    })
  }

  const handleSubmitEvaluation = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!evaluationModal.visit || !user) return
    setEvaluationSubmitting(true)
    setEvaluationMessage(null)
    try {
      const { data, error } = await createClientVisitEvaluation(user.id, evaluationModal.visit.id, {
        rating: evaluationForm.rating,
        comment: evaluationForm.comment.trim() || undefined,
        resource_ids: evaluationForm.resource_ids.length ? evaluationForm.resource_ids : undefined
      })

      if (error) {
        console.error('Failed to create evaluation', error)
        setEvaluationMessage({ type: 'error', text: t('visits.modal.error') })
      } else if (data) {
        setVisitEvaluations((prev) => ({
          ...prev,
          [evaluationModal.visit!.id]: [data, ...(prev[evaluationModal.visit!.id] ?? [])]
        }))
        setEvaluationMessage({ type: 'success', text: t('visits.modal.success') })
        setEvaluationForm({ rating: 5, comment: '', resource_ids: [] })
        setTimeout(() => closeEvaluationModal(), 1000)
      }
    } finally {
      setEvaluationSubmitting(false)
    }
  }

  const visitEvaluationsSorted = useMemo(() => visitEvaluations, [visitEvaluations])
  const resourceMap = useMemo(() => {
    return accessibleResources.reduce<Record<string, Resource>>((acc, resource) => {
      acc[resource.id] = resource
      return acc
    }, {})
  }, [accessibleResources])

  const resetNewResourceForm = () => {
    setNewResourceTitle('')
    setNewResourceDescription('')
    setNewResourceType('document')
    setNewResourceFile(null)
    setNewResourceLink('')
  }

  const handleResourceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setNewResourceFile(event.target.files[0])
    } else {
      setNewResourceFile(null)
    }
  }

  const handleResourceUpload = async () => {
    if (!user) return
    if (!newResourceTitle.trim()) {
      setResourceUploadMessage({ type: 'error', text: t('visits.modal.newResource.error') })
      return
    }
    const targetPairingId = pairings[0]?.id
    if (!targetPairingId) {
      setResourceUploadMessage({ type: 'error', text: t('visits.modal.newResource.error') })
      return
    }

    if (newResourceType === 'link' && !newResourceLink.trim()) {
      setResourceUploadMessage({ type: 'error', text: t('visits.modal.newResource.error') })
      return
    }

    if (newResourceType !== 'link' && !newResourceFile) {
      setResourceUploadMessage({ type: 'error', text: t('visits.modal.newResource.error') })
      return
    }

    setResourceUploading(true)
    setResourceUploadMessage(null)
    try {
      let resourcePayload: Omit<Resource, 'id' | 'created_at' | 'download_count'>

      if (newResourceType === 'link') {
        resourcePayload = {
          uploaded_by: user.id,
          pairing_id: targetPairingId,
          title: newResourceTitle.trim(),
          description: newResourceDescription.trim() || undefined,
          resource_type: 'link',
          external_url: newResourceLink.trim(),
          is_public: false
        }
      } else {
        const file = newResourceFile!
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${targetPairingId}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from(resourcesBucket)
          .upload(filePath, file)
        if (uploadError) {
          throw uploadError
        }

        resourcePayload = {
          uploaded_by: user.id,
          pairing_id: targetPairingId,
          title: newResourceTitle.trim(),
          description: newResourceDescription.trim() || undefined,
          resource_type: newResourceType,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          is_public: false
        }
      }

      const { data, error } = await uploadResource(resourcePayload)
      if (error || !data) {
        throw error ?? new Error('upload failed')
      }

      setAccessibleResources(prev => [data, ...prev])
      setEvaluationForm(prev => ({
        ...prev,
        resource_ids: Array.from(new Set([...prev.resource_ids, data.id]))
      }))
      setResourceUploadMessage({ type: 'success', text: t('visits.modal.newResource.success') })
      resetNewResourceForm()
    } catch (error) {
      console.error('Failed to upload resource', error)
      setResourceUploadMessage({ type: 'error', text: t('visits.modal.newResource.error') })
    } finally {
      setResourceUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('header.title')}</h2>
        <p className="text-gray-600">{t('header.welcome')}, {userProfile?.full_name || user?.email}!</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.goals.title')}</h3>
          <p className="text-3xl font-bold text-blue-600">{progress?.goal_completion_rate || 0}%</p>
          <p className="text-sm text-gray-500">
            {t('stats.goals.detail', `${progress?.completed_goals || 0} of ${progress?.total_goals || 0} goals completed`)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.attendance.title')}</h3>
          <p className="text-3xl font-bold text-green-600">{progress?.session_attendance_rate || 0}%</p>
          <p className="text-sm text-gray-500">
            {t('stats.attendance.detail', `${progress?.completed_sessions || 0} of ${progress?.total_sessions || 0} sessions attended`)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.mentors.title')}</h3>
          <p className="text-3xl font-bold text-purple-600">{pairings.length}</p>
          <p className="text-sm text-gray-500">{t('stats.mentors.subtitle')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/resources" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">{t('quickActions.resources')}</div>
            </div>
          </Link>

          <Link href="/mentee/clients" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">{t('quickActions.viewClients')}</div>
            </div>
          </Link>

          <Link href="/sessions/schedule" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium">{t('quickActions.scheduleVisit')}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Current Mentors */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('mentors.title')}</h3>
        {pairings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairings.map((pairing) => (
              <div key={pairing.id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {pairing.mentor?.full_name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h4 className="font-medium">{pairing.mentor?.full_name || 'Mentor'}</h4>
                    <p className="text-sm text-gray-600">{pairing.mentor?.mentor?.expertise_areas?.join(', ') || 'General Mentoring'}</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Link href="/sessions/schedule">
                    <span className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer">
                      {t('mentors.schedule')}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">{t('mentors.empty')}</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {t('mentors.find')}
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Client Visits */}
      {userProfile?.role === 'mentee' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('visits.title')}</h3>
          {clientVisits.length > 0 ? (
            <div className="space-y-3">
              {clientVisits.map((visit: ClientVisit) => (
                <div key={visit.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{visit.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(visit.scheduled_at).toLocaleDateString()} at{' '}
                        {new Date(visit.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/sessions/schedule?visitId=${visit.id}&clientId=${visit.client_id}`}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        {t('visits.reschedule')}
                      </Link>
                      <button
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => openEvaluationModal(visit)}
                      >
                        {t('visits.evaluate')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">{t('visits.evaluations.title')}</p>
                    {evaluationsLoading ? (
                      <p className="text-sm text-gray-500">{t('loading.clients')}</p>
                    ) : visitEvaluationsSorted[visit.id]?.length ? (
                      <div className="space-y-2">
                        {visitEvaluationsSorted[visit.id].map((evaluation) => (
                          <div key={evaluation.id} className="p-2 bg-white rounded border">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{t('visits.modal.rating')}: {evaluation.rating}/10</span>
                              <span className="text-gray-400 text-xs">
                                {new Date(evaluation.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {evaluation.comment && (
                              <p className="text-sm text-gray-700 mt-1">{evaluation.comment}</p>
                            )}
                            {evaluation.resource_ids && evaluation.resource_ids.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {evaluation.resource_ids.map((resourceId) => {
                                  const resource = resourceMap[resourceId]
                                  if (!resource) return null
                                  return (
                                    <a
                                      key={`${evaluation.id}-${resourceId}`}
                                      href={`/api/resources/${resource.id}/download`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-blue-600 underline"
                                    >
                                      {resource.title}
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{t('visits.evaluations.empty')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('visits.empty')}</p>
          )}
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('sessions.title')}</h3>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{session.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
                    {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                    {t('sessions.reschedule')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t('sessions.empty')}</p>
        )}
      </div>

      {evaluationModal.open && evaluationModal.visit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold">{t('visits.modal.title')}</h3>
              <button onClick={closeEvaluationModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <form className="space-y-4 flex-1 overflow-y-auto pr-2" onSubmit={handleSubmitEvaluation}>
              <div>
                <label className="block text-sm font-medium mb-1">{t('visits.modal.rating')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={evaluationForm.rating}
                    onChange={(e) => setEvaluationForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={evaluationForm.rating}
                    onChange={(e) => setEvaluationForm((prev) => ({ ...prev, rating: Math.min(10, Math.max(0, Number(e.target.value))) }))}
                    className="w-16 border rounded px-2 py-1 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('visits.modal.comment')}</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  value={evaluationForm.comment}
                  onChange={(e) => setEvaluationForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder={t('visits.modal.commentPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">{t('visits.modal.resources')}</label>
                {resourcesLoading ? (
                  <p className="text-sm text-gray-500">{t('loading.resources')}</p>
                ) : accessibleResources.length ? (
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2">
                    {accessibleResources.map((resource) => (
                      <label key={resource.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={evaluationForm.resource_ids.includes(resource.id)}
                          onChange={() => toggleResourceSelection(resource.id)}
                        />
                        <span className="flex-1">
                          <span className="font-medium">{resource.title}</span>
                          {resource.resource_type && (
                            <span className="ml-2 text-xs text-gray-500 uppercase">{resource.resource_type}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {t('visits.modal.resourcesEmpty')}{' '}
                    <Link href="/resources/upload" className="text-blue-600 underline">
                      {t('visits.modal.resourcesUpload')}
                    </Link>
                  </p>
                )}
              </div>
              <div className="space-y-2 border rounded p-3 bg-gray-50">
                <p className="text-sm font-semibold">{t('visits.modal.newResource.title')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('visits.modal.newResource.name')}</label>
                    <input
                      type="text"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder={t('visits.modal.newResource.titlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('visits.modal.newResource.type')}</label>
                    <select
                      value={newResourceType}
                      onChange={(e) => setNewResourceType(e.target.value as ResourceType)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="document">{t('visits.modal.newResource.type.document')}</option>
                      <option value="presentation">{t('visits.modal.newResource.type.presentation')}</option>
                      <option value="image">{t('visits.modal.newResource.type.image')}</option>
                      <option value="video">{t('visits.modal.newResource.type.video')}</option>
                      <option value="code">{t('visits.modal.newResource.type.code')}</option>
                      <option value="link">{t('visits.modal.newResource.type.link')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{t('visits.modal.newResource.description')}</label>
                  <textarea
                    value={newResourceDescription}
                    onChange={(e) => setNewResourceDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>
                {newResourceType === 'link' ? (
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('visits.modal.newResource.link')}</label>
                    <input
                      type="url"
                      value={newResourceLink}
                      onChange={(e) => setNewResourceLink(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder={t('visits.modal.newResource.linkPlaceholder')}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('visits.modal.newResource.file')}</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 text-sm text-gray-600">
                      <span className="mb-1 font-medium">{newResourceFile ? newResourceFile.name : t('visits.modal.newResource.filePlaceholder')}</span>
                      <span className="text-xs text-gray-500">{t('visits.modal.newResource.fileHint')}</span>
                      <input type="file" className="hidden" onChange={handleResourceFileChange} />
                    </label>
                  </div>
                )}
                {resourceUploadMessage && (
                  <div
                    className={`text-xs px-3 py-2 rounded ${
                      resourceUploadMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {resourceUploadMessage.text}
                  </div>
                )}
                <button
                  type="button"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleResourceUpload}
                  disabled={resourceUploading}
                >
                  {resourceUploading ? t('visits.modal.newResource.uploading') : t('visits.modal.newResource.cta')}
                </button>
              </div>
              {evaluationMessage && (
                <div
                  className={`text-sm px-3 py-2 rounded ${
                    evaluationMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {evaluationMessage.text}
                </div>
              )}
            </form>
            <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t">
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={closeEvaluationModal}
                disabled={evaluationSubmitting}
              >
                {t('visits.modal.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={evaluationSubmitting}
                onClick={handleSubmitEvaluation}
              >
                {evaluationSubmitting ? `${t('visits.modal.submit')}...` : t('visits.modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

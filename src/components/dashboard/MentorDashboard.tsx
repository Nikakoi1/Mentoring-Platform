'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { useAuth } from '@/contexts/AuthContext'
import {
  createSessionEvaluation,
  deleteSession,
  getGoalsByPairingIds,
  getMentorStats,
  getPairingResources,
  getSessionEvaluations,
  getUserPairings,
  getUserSessions,
  updateSession,
  uploadResource
} from '@/lib/services/database'
import type {
  Goal,
  MentorStats,
  PairingWithUsers,
  Resource,
  ResourceType,
  Session,
  SessionEvaluation,
  SessionStatus,
  SessionWithUsers,
  User
} from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'
import { supabase } from '@/lib/supabase/client'

export function MentorDashboard() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<MentorStats | null>(null)
  const [sessions, setSessions] = useState<SessionWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [evaluationModal, setEvaluationModal] = useState<{ open: boolean; session: Session | null }>({ open: false, session: null })
  const [evaluationForm, setEvaluationForm] = useState<{ rating: number; comment: string; resource_ids: string[] }>({
    rating: 5,
    comment: '',
    resource_ids: []
  })
  const [evaluationSubmitting, setEvaluationSubmitting] = useState(false)
  const [evaluationMessage, setEvaluationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourceCache, setResourceCache] = useState<Record<string, Resource[]>>({})
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceDescription, setNewResourceDescription] = useState('')
  const [newResourceType, setNewResourceType] = useState<ResourceType>('document')
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null)
  const [newResourceLink, setNewResourceLink] = useState('')
  const [resourceUploading, setResourceUploading] = useState(false)
  const [resourceUploadMessage, setResourceUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const resourcesBucket = process.env.NEXT_PUBLIC_SUPABASE_RESOURCES_BUCKET ?? 'resources'
  const [sessionEvaluations, setSessionEvaluations] = useState<Record<string, SessionEvaluation[]>>({})
  const [evaluationsLoading, setEvaluationsLoading] = useState(false)
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [goalMap, setGoalMap] = useState<Record<string, Goal>>({})
  const [menteeDetails, setMenteeDetails] = useState<Record<string, User>>({})
  const loadResourcesForPairing = useSessionResources(user?.id, resourceCache, setResourceCache, setResourcesLoading)
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'scheduled_at' | 'mentee' | 'status'>('scheduled_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const SESSION_STATUS_OPTIONS: SessionStatus[] = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']
  const showLogProgressAction = false
  const [evaluationSessionStatus, setEvaluationSessionStatus] = useState<SessionStatus>('scheduled')
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const currentSessionResources = useMemo(() => {
    if (!evaluationModal.session) return []
    return resourceCache[evaluationModal.session.pairing_id] ?? []
  }, [evaluationModal.session, resourceCache])

  const resourceMap = useMemo(() => {
    const map: Record<string, Resource> = {}
    Object.values(resourceCache).forEach((resources) => {
      resources.forEach((resource) => {
        map[resource.id] = resource
      })
    })
    return map
  }, [resourceCache])

  const sessionEvaluationsSorted = useMemo(() => {
    return Object.entries(sessionEvaluations).reduce<Record<string, SessionEvaluation[]>>((acc, [sessionId, evaluations]) => {
      acc[sessionId] = [...evaluations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return acc
    }, {})
  }, [sessionEvaluations])

  const menteeLookup = useMemo(() => {
    return pairings.reduce<Record<string, User>>((acc, pairing) => {
      if (pairing.mentee) {
        acc[pairing.mentee_id] = pairing.mentee
      }
      return acc
    }, {})
  }, [pairings])

  const getMenteeDisplay = (session: SessionWithUsers) => {
    // If session has mentee_ids array, display multiple mentees
    if (session.mentee_ids && session.mentee_ids.length > 1) {
      const menteeNames = session.mentee_ids.map(id => 
        menteeLookup[id]?.full_name || menteeLookup[id]?.email || 'Unknown'
      )
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">Group Session</div>
          <div className="text-xs text-gray-600">
            {menteeNames.slice(0, 2).join(', ')}
            {menteeNames.length > 2 && ` +${menteeNames.length - 2} more`}
          </div>
        </div>
      )
    }
    
    // Single mentee display (existing logic)
    return menteeLookup[session.mentee_id]?.full_name || menteeLookup[session.mentee_id]?.email || session.mentee?.full_name || '—'
  }
  const { t } = useTranslations({
    namespace: 'dashboard.mentor',
    defaults: {
      'header.title': 'Mentor Dashboard',
      'header.welcome': 'Welcome back',
      'stats.activeMentees.title': 'Active Mentees',
      'stats.activeMentees.subtitle': 'Currently mentoring',
      'stats.totalSessions.title': 'Total Sessions',
      'stats.totalSessions.subtitle': 'Sessions completed',
      'stats.upcomingSessions.title': 'Upcoming Sessions',
      'stats.upcomingSessions.subtitle': 'Sessions scheduled',
      'quickActions.title': 'Quick Actions',
      'quickActions.schedule': 'Schedule Session',
      'quickActions.viewMentees': 'View Mentees',
      'quickActions.setGoals': 'Set Goals',
      'quickActions.logProgress': 'Log Progress',
      'quickActions.resources': 'Resources',
      'section.upcoming.title': 'All Sessions',
      'section.upcoming.empty': 'No sessions to display.',
      'section.upcoming.join': 'Join',
      'section.upcoming.reschedule': 'Reschedule',
      'section.upcoming.evaluate': 'Evaluate',
      'section.upcoming.delete': 'Delete',
      'section.upcoming.deleteConfirm': 'Are you sure you want to delete this session?',
      'sessions.filters.search': 'Search sessions',
      'sessions.filters.status': 'Filter by status',
      'sessions.table.columns.title': 'Session',
      'sessions.table.columns.mentee': 'Mentee',
      'sessions.table.columns.datetime': 'Date & Time',
      'sessions.table.columns.status': 'Status',
      'sessions.table.columns.goal': 'Associate Goal',
      'sessions.table.columns.actions': 'Actions',
      'sessions.evaluations.title': 'Evaluation History',
      'sessions.evaluations.empty': 'No evaluations yet.',
      'sessions.evaluations.loading': 'Loading evaluations...',
      'sessions.evaluations.resourceFallback': 'Resource attachment',
      'evaluation.modal.title': 'Evaluate Session',
      'evaluation.modal.rating': 'Rate the session (0 = worst, 10 = best)',
      'evaluation.modal.comment': 'Comment',
      'evaluation.modal.resources': 'Attach Existing Resources',
      'evaluation.modal.resourcesEmpty': 'No shared resources available yet.',
      'evaluation.modal.resourcesUpload': 'Upload a resource',
      'evaluation.modal.newResource.title': 'Add New Resource',
      'evaluation.modal.newResource.name': 'Title',
      'evaluation.modal.newResource.description': 'Description (Optional)',
      'evaluation.modal.newResource.type': 'Resource Type',
      'evaluation.modal.newResource.file': 'File',
      'evaluation.modal.newResource.link': 'Link URL',
      'evaluation.modal.newResource.cta': 'Upload Resource',
      'evaluation.modal.newResource.uploading': 'Uploading...',
      'evaluation.modal.newResource.error': 'Failed to upload the resource. Please try again.',
      'evaluation.modal.newResource.success': 'Resource uploaded successfully!',
      'evaluation.modal.statusLabel': 'Session status',
      'evaluation.modal.submit': 'Submit Evaluation',
      'evaluation.modal.cancel': 'Cancel',
      'evaluation.modal.success': 'Evaluation saved successfully!',
      'evaluation.modal.error': 'Failed to save evaluation. Please try again.'
    }
  })

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredSessions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    const filtered = sessions.filter((session) => {
      const statusMatch = statusFilter === 'all' || session.status === statusFilter
      const menteeName = menteeLookup[session.mentee_id]?.full_name || session.mentee?.full_name
      const textPool = [session.title, menteeName, session.goal?.title || goalMap[session.goal_id ?? '']?.title]
      const searchMatch = !search || textPool.some((value) => value?.toLowerCase().includes(search))
      return statusMatch && searchMatch
    })

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0
      if (sortField === 'scheduled_at') {
        comparison = new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      } else if (sortField === 'mentee') {
        const aName = a.mentee?.full_name || ''
        const bName = b.mentee?.full_name || ''
        comparison = aName.localeCompare(bName)
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [sessions, statusFilter, searchTerm, sortField, sortDirection])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        const [statsResult, sessionsResult, pairingsResult] = await Promise.all([
          getMentorStats(user.id),
          getUserSessions(user.id),
          getUserPairings(user.id)
        ])

        if (statsResult.data) setStats(statsResult.data)
        if (sessionsResult.data) setSessions(sessionsResult.data)
        if (pairingsResult.data) {
          setPairings(pairingsResult.data)
          const pairingIds = pairingsResult.data.map((pairing) => pairing.id)
          if (pairingIds.length) {
            const { data: goalsData, error: goalsError } = await getGoalsByPairingIds(pairingIds)
            if (goalsError) {
              console.error('Failed to load goals for mentor dashboard', goalsError)
            }
            if (goalsData) {
              const map = goalsData.reduce<Record<string, Goal>>((acc, goal) => {
                acc[goal.id] = goal
                return acc
              }, {})
              setGoalMap(map)
            }
          } else {
            setGoalMap({})
          }
        } else {
          setPairings([])
          setGoalMap({})
        }
      } catch (error) {
        console.error('Error loading mentor dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  useEffect(() => {
    const loadEvaluations = async () => {
      if (!sessions.length) {
        setSessionEvaluations({})
        return
      }

      setEvaluationsLoading(true)
      try {
        const results = await Promise.all(
          sessions.map(async (session) => {
            const { data, error } = await getSessionEvaluations(session.id)
            if (error) {
              console.error('Failed to load session evaluations', error)
              return [session.id, [] as SessionEvaluation[]] as const
            }
            return [session.id, (data ?? []) as SessionEvaluation[]] as const
          })
        )

        const map = results.reduce<Record<string, SessionEvaluation[]>>((acc, [sessionId, evals]) => {
          acc[sessionId] = evals
          return acc
        }, {})
        setSessionEvaluations(map)
      } finally {
        setEvaluationsLoading(false)
      }
    }

    void loadEvaluations()
  }, [sessions])

  useEffect(() => {
    const uniquePairingIds = Array.from(new Set(sessions.map((session) => session.pairing_id).filter(Boolean)))
    uniquePairingIds.forEach((pairingId) => {
      if (!resourceCache[pairingId]) {
        void loadResourcesForPairing(pairingId)
      }
    })
  }, [sessions, resourceCache, loadResourcesForPairing])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const openEvaluationModal = (session: Session) => {
    console.log('Opening evaluation modal for session:', session.id)
    // Prevent any accidental navigation by setting a flag
    window.history.replaceState(null, '', '/dashboard')
    setEvaluationModal({ open: true, session })
    setEvaluationMessage(null)
    setEvaluationForm({ rating: 5, comment: '', resource_ids: [] })
    setEvaluationSessionStatus(session.status as SessionStatus)
    setNewResourceTitle('')
    setNewResourceDescription('')
    setNewResourceType('document')
    setNewResourceLink('')
    setNewResourceFile(null)
    setResourceUploadMessage(null)
  }

  const closeEvaluationModal = () => {
    console.log('Closing evaluation modal')
    // Ensure we stay on dashboard
    window.history.replaceState(null, '', '/dashboard')
    setEvaluationModal({ open: false, session: null })
    setEvaluationMessage(null)
    // Reset form state
    setEvaluationForm({ rating: 5, comment: '', resource_ids: [] })
    setEvaluationSessionStatus('scheduled')
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm(t('section.upcoming.deleteConfirm'))) {
      return
    }
    
    setDeletingSessionId(sessionId)
    try {
      const { error } = await deleteSession(sessionId)
      if (error) {
        console.error('Failed to delete session:', error)
        return
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (error) {
      console.error('Error deleting session:', error)
    } finally {
      setDeletingSessionId(null)
    }
  }

  const toggleResourceSelection = (resourceId: string) => {
    setEvaluationForm((prev) => {
      const exists = prev.resource_ids.includes(resourceId)
      return {
        ...prev,
        resource_ids: exists
          ? prev.resource_ids.filter((id) => id !== resourceId)
          : [...prev.resource_ids, resourceId]
      }
    })
  }

  const handleResourceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setNewResourceFile(event.target.files[0])
    } else {
      setNewResourceFile(null)
    }
  }

  const handleResourceUpload = async () => {
    if (!user || !evaluationModal.session) return
    const pairingId = evaluationModal.session.pairing_id
    if (!newResourceTitle.trim()) {
      setResourceUploadMessage({ type: 'error', text: t('evaluation.modal.newResource.error') })
      return
    }

    if (newResourceType === 'link' && !newResourceLink.trim()) {
      setResourceUploadMessage({ type: 'error', text: t('evaluation.modal.newResource.error') })
      return
    }

    if (newResourceType !== 'link' && !newResourceFile) {
      setResourceUploadMessage({ type: 'error', text: t('evaluation.modal.newResource.error') })
      return
    }

    setResourceUploading(true)
    setResourceUploadMessage(null)
    try {
      let resourcePayload: Omit<Resource, 'id' | 'created_at' | 'download_count'>

      if (newResourceType === 'link') {
        resourcePayload = {
          uploaded_by: user.id,
          pairing_id: pairingId,
          title: newResourceTitle.trim(),
          description: newResourceDescription.trim() || undefined,
          resource_type: 'link',
          external_url: newResourceLink.trim(),
          is_public: false
        }
      } else {
        const file = newResourceFile!
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${pairingId}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from(resourcesBucket)
          .upload(filePath, file)
        if (uploadError) {
          throw uploadError
        }

        resourcePayload = {
          uploaded_by: user.id,
          pairing_id: pairingId,
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
        throw error ?? new Error('Failed to upload resource')
      }

      setResourceCache((prev) => ({
        ...prev,
        [pairingId]: [data, ...(prev[pairingId] ?? [])]
      }))
      setEvaluationForm((prev) => ({
        ...prev,
        resource_ids: Array.from(new Set([...prev.resource_ids, data.id]))
      }))
      setResourceUploadMessage({ type: 'success', text: t('evaluation.modal.newResource.success') })
      setNewResourceTitle('')
      setNewResourceDescription('')
      setNewResourceType('document')
      setNewResourceFile(null)
      setNewResourceLink('')
    } catch (error) {
      console.error('Failed to upload resource', error)
      setResourceUploadMessage({ type: 'error', text: t('evaluation.modal.newResource.error') })
    } finally {
      setResourceUploading(false)
    }
  }

  const handleSubmitEvaluation = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!evaluationModal.session || !user) return

    setEvaluationSubmitting(true)
    setEvaluationMessage(null)

    let session = evaluationModal.session

    if (evaluationSessionStatus && evaluationSessionStatus !== session.status) {
      const { data: updatedSession, error: statusError } = await updateSession(session.id, { status: evaluationSessionStatus })
      if (statusError) {
        console.error('Failed to update session status', statusError)
        setEvaluationMessage({ type: 'error', text: t('evaluation.modal.error') })
        setEvaluationSubmitting(false)
        return
      }

      const nextSession = updatedSession ?? { ...session, status: evaluationSessionStatus }
      session = nextSession
      setSessions((prev) => prev.map((item) => (item.id === session.id ? { ...item, ...nextSession } : item)))
      setEvaluationModal((prev) => ({ ...prev, session: nextSession }))
    }

    const payload = {
      session_id: session.id,
      pairing_id: session.pairing_id,
      mentor_id: session.mentor_id || user.id,
      mentee_id: session.mentee_id,
      rating: evaluationForm.rating,
      comment: evaluationForm.comment.trim() || undefined,
      resource_ids: evaluationForm.resource_ids.length ? evaluationForm.resource_ids : undefined
    }

    const { error } = await createSessionEvaluation(payload)
    if (error) {
      console.error('Failed to create session evaluation', error)
      setEvaluationMessage({ type: 'error', text: t('evaluation.modal.error') })
    } else {
      console.log('Evaluation submitted successfully')
      setEvaluationMessage({ type: 'success', text: t('evaluation.modal.success') })
      setSessionEvaluations((prev) => {
        const existing = prev[session.id] ?? []
        return {
          ...prev,
          [session.id]: [
            {
              id: crypto.randomUUID(),
              session_id: session.id,
              pairing_id: session.pairing_id,
              mentor_id: payload.mentor_id,
              mentee_id: payload.mentee_id,
              rating: payload.rating,
              comment: payload.comment,
              resource_ids: payload.resource_ids,
              created_at: new Date().toISOString()
            },
            ...existing
          ]
        }
      })
      setTimeout(() => {
        console.log('Auto-closing modal after successful submission')
        closeEvaluationModal()
      }, 1200)
    }

    setEvaluationSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('header.title')}</h2>
        <p className="text-gray-600">{t('header.welcome')}, {userProfile?.full_name || user?.email}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.activeMentees.title')}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.active_mentees || 0}</p>
          <p className="text-sm text-gray-500">{t('stats.activeMentees.subtitle')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.totalSessions.title')}</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.total_sessions || 0}</p>
          <p className="text-sm text-gray-500">{t('stats.totalSessions.subtitle')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('stats.upcomingSessions.title')}</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.upcoming_sessions || 0}</p>
          <p className="text-sm text-gray-500">{t('stats.upcomingSessions.subtitle')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/sessions/schedule" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium">{t('quickActions.schedule')}</div>
            </div>
          </Link>
          
          <Link href="/mentor/mentees" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">{t('quickActions.viewMentees')}</div>
            </div>
          </Link>
          
          <Link href="/goals" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">{t('quickActions.setGoals')}</div>
            </div>
          </Link>

          {showLogProgressAction && (
            <Link href="/progress/log" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors block">
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium">{t('quickActions.logProgress')}</div>
              </div>
            </Link>
          )}

          <Link href="/resources" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors block">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">{t('quickActions.resources')}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('section.upcoming.title')}</h3>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('sessions.filters.search')}
              className="w-full md:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SessionStatus)}
            >
              <option value="all">{t('sessions.filters.status')}</option>
              {SESSION_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">
            {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-2">
                    <button className="flex items-center gap-1" onClick={() => handleSort('scheduled_at')}>
                      {t('sessions.table.columns.title')}
                      <SortIndicator active={sortField === 'scheduled_at'} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="px-4 py-2">
                    <button className="flex items-center gap-1" onClick={() => handleSort('mentee')}>
                      {t('sessions.table.columns.mentee')}
                      <SortIndicator active={sortField === 'mentee'} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="px-4 py-2">{t('sessions.table.columns.datetime')}</th>
                  <th className="px-4 py-2">
                    <button className="flex items-center gap-1" onClick={() => handleSort('status')}>
                      {t('sessions.table.columns.status')}
                      <SortIndicator active={sortField === 'status'} direction={sortDirection} />
                    </button>
                  </th>
                  <th className="px-4 py-2">{t('sessions.table.columns.goal')}</th>
                  <th className="px-4 py-2 text-right">{t('sessions.table.columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map((session) => (
                  <Fragment key={session.id}>
                    <tr className="text-gray-800">
                      <td className="px-4 py-3">
                        <div className="font-medium">{session.title}</div>
                        {session.description && <p className="text-xs text-gray-500">{session.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {getMenteeDisplay(session)}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(session.scheduled_at).toLocaleDateString()} ·{' '}
                        {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 capitalize">{session.status.replace('-', ' ')}</td>
                      <td className="px-4 py-3">{(session.goal_id && goalMap[session.goal_id]?.title) || session.goal?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Link
                            href={`/sessions/schedule?menteeId=${session.mentee_id}`}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
                          >
                            {t('section.upcoming.reschedule')}
                          </Link>
                          <button
                            onClick={() => openEvaluationModal(session)}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            {t('section.upcoming.evaluate')}
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={deletingSessionId === session.id}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingSessionId === session.id ? '...' : t('section.upcoming.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-4 py-3">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{t('sessions.evaluations.title')}</p>
                          {evaluationsLoading ? (
                            <p className="text-sm text-gray-500">{t('sessions.evaluations.loading')}</p>
                          ) : sessionEvaluationsSorted[session.id]?.length ? (
                            <div className="space-y-2">
                              {sessionEvaluationsSorted[session.id].map((evaluation) => (
                                <div key={evaluation.id} className="p-3 bg-white rounded border text-sm space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {t('evaluation.modal.rating')}: {evaluation.rating}/10
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      {new Date(evaluation.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {evaluation.comment && (
                                    <p className="text-gray-700">{evaluation.comment}</p>
                                  )}
                                  {evaluation.resource_ids && evaluation.resource_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {evaluation.resource_ids.map((resourceId) => {
                                        const resource = resourceMap[resourceId]
                                        return resource ? (
                                          <a
                                            key={`${evaluation.id}-${resourceId}`}
                                            href={`/api/resources/${resource.id}/download`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 underline"
                                          >
                                            {resource.title}
                                          </a>
                                        ) : (
                                          <span key={`${evaluation.id}-${resourceId}`} className="text-xs text-gray-500">
                                            {t('sessions.evaluations.resourceFallback')}
                                          </span>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">{t('sessions.evaluations.empty')}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">{t('section.upcoming.empty')}</p>
        )}
      </div>

      {evaluationModal.open && evaluationModal.session && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold">{t('evaluation.modal.title')}</h3>
              <button onClick={closeEvaluationModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <form className="space-y-4 flex-1 overflow-y-auto pr-2" onSubmit={handleSubmitEvaluation}>
              <div>
                <label className="block text-sm font-medium mb-1">{t('evaluation.modal.rating')}</label>
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
                    onChange={(e) =>
                      setEvaluationForm((prev) => ({
                        ...prev,
                        rating: Math.min(10, Math.max(0, Number(e.target.value)))
                      }))
                    }
                    className="w-16 border rounded px-2 py-1 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('evaluation.modal.comment')}</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  value={evaluationForm.comment}
                  onChange={(e) => setEvaluationForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder={t('evaluation.modal.comment')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('evaluation.modal.statusLabel')}</label>
                <select
                  className="w-full border rounded px-3 py-2 capitalize"
                  value={evaluationSessionStatus}
                  onChange={(e) => setEvaluationSessionStatus(e.target.value as SessionStatus)}
                >
                  {SESSION_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">{t('evaluation.modal.resources')}</label>
                {resourcesLoading ? (
                  <p className="text-sm text-gray-500">{t('loading.resources', 'Loading resources...')}</p>
                ) : currentSessionResources.length ? (
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2">
                    {currentSessionResources.map((resource) => (
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
                    {t('evaluation.modal.resourcesEmpty')}{' '}
                    <Link href="/resources/upload" className="text-blue-600 underline">
                      {t('evaluation.modal.resourcesUpload')}
                    </Link>
                  </p>
                )}
              </div>
              <div className="space-y-2 border rounded p-3 bg-gray-50">
                <p className="text-sm font-semibold">{t('evaluation.modal.newResource.title')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('evaluation.modal.newResource.name')}</label>
                    <input
                      type="text"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder={t('evaluation.modal.newResource.name')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('evaluation.modal.newResource.type')}</label>
                    <select
                      value={newResourceType}
                      onChange={(e) => setNewResourceType(e.target.value as ResourceType)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="document">Document</option>
                      <option value="presentation">Presentation</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="code">Code</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{t('evaluation.modal.newResource.description')}</label>
                  <textarea
                    value={newResourceDescription}
                    onChange={(e) => setNewResourceDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>
                {newResourceType === 'link' ? (
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('evaluation.modal.newResource.link')}</label>
                    <input
                      type="url"
                      value={newResourceLink}
                      onChange={(e) => setNewResourceLink(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="https://"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium mb-1">{t('evaluation.modal.newResource.file')}</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 text-sm text-gray-600">
                      <span className="mb-1 font-medium">{newResourceFile ? newResourceFile.name : 'Click to choose a file'}</span>
                      <span className="text-xs text-gray-500">PDF, PPT, DOC, etc.</span>
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
                  {resourceUploading ? t('evaluation.modal.newResource.uploading') : t('evaluation.modal.newResource.cta')}
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
                {t('evaluation.modal.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={evaluationSubmitting}
                onClick={handleSubmitEvaluation}
              >
                {evaluationSubmitting ? `${t('evaluation.modal.submit')}...` : t('evaluation.modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SortIndicator({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) {
    return <span className="text-gray-300 text-xs">↕</span>
  }
  return <span className="text-xs">{direction === 'asc' ? '▲' : '▼'}</span>
}

function useSessionResources(
  userId: string | undefined,
  cache: Record<string, Resource[]>,
  setCache: React.Dispatch<React.SetStateAction<Record<string, Resource[]>>>,
  setLoading: (value: boolean) => void
) {
  const loadResources = useCallback(
    async (pairingId: string) => {
      if (!userId) return []
      if (cache[pairingId]) {
        return cache[pairingId]
      }
      setLoading(true)
      const { data, error } = await getPairingResources(pairingId)
      setLoading(false)
      if (error || !data) {
        console.error('Failed to load resources for pairing', pairingId, error)
        setCache((prev) => ({ ...prev, [pairingId]: [] }))
        return []
      }
      setCache((prev) => ({ ...prev, [pairingId]: data }))
      return data
    },
    [cache, setCache, setLoading, userId]
  )

  return loadResources
}

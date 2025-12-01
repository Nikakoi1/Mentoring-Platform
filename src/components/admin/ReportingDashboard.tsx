'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import { 
  getDetailedMentorAnalytics, 
  getMenteeSessionDetails, 
  getAllMentors 
} from '@/lib/services/database'
import { ChevronDown, ChevronRight, Download, Calendar, Users } from 'lucide-react'

// Types for the enhanced analytics
interface MentorAnalytics {
  mentor_id: string
  mentor_name: string
  mentor_email: string
  total_mentees: number
  active_mentees: number
  total_sessions: number
  completed_sessions: number
  planned_sessions: number
  average_evaluation: number
  total_goals: number
  achieved_goals: number
  mentees_details: MenteeDetail[]
}

interface MenteeDetail {
  mentee_id: string
  mentee_name: string
  mentee_email: string
  status: string
  total_sessions: number
  completed_sessions: number
  planned_sessions: number
  average_evaluation: number
  total_goals: number
  achieved_goals: number
}

interface SessionDetail {
  session_id: string
  title: string
  scheduled_time: string
  status: string
  evaluation_rating: number
  evaluation_comment: string
  goals_worked_on: string
  resources_shared: any[]
}

interface MentorOption {
  id: string
  full_name: string
  email: string
}

// Type for the database function return
interface MentorOptionFromDB {
  id: string
  full_name?: string
  email: string
}

export function ReportingDashboard() {
  const { userProfile } = useAuth()
  const { t } = useTranslations({ 
    namespace: 'admin.reports', 
    defaults: {
      'header.title': 'Platform Analytics',
      'loading': 'Loading reports...',
      'error.permission': 'You do not have permission to view this page.',
      'error.dataLoad': 'Failed to load analytics data.',
      'filters.period': 'Reporting Period',
      'filters.startDate': 'Start Date',
      'filters.endDate': 'End Date',
      'filters.mentors': 'Select Mentors',
      'filters.searchMentors': 'Search mentors...',
      'filters.selectedMentors': 'Selected mentors',
      'filters.allMentors': 'All Mentors',
      'filters.apply': 'Use Filters',
      'filters.clear': 'Clear Filters',
      'export.excel': 'Export to Excel',
      'metrics.totalUsers': 'Total Users',
      'metrics.activePairings': 'Active Pairings',
      'metrics.sessionsThisMonth': 'Sessions This Month',
      'detailed.title': 'Detailed Analytics',
      'mentor.summary': 'Mentor Summary',
      'mentor.mentees': 'Mentees',
      'mentor.sessions': 'Sessions',
      'mentor.evaluation': 'Avg Evaluation',
      'mentor.goals': 'Goals',
      'mentee.summary': 'Mentee Summary',
      'mentee.sessions': 'Sessions',
      'mentee.evaluations': 'Evaluations',
      'session.details': 'Session Details',
      'session.title': 'Title',
      'session.datetime': 'Date & Time',
      'session.status': 'Status',
      'session.rating': 'Rating',
      'session.comment': 'Comment',
      'session.goals': 'Goals Worked On',
      'session.resources': 'Resources Shared',
      'status.completed': 'Completed',
      'status.planned': 'Planned',
      'status.cancelled': 'Cancelled',
      'status.active': 'Active',
      'status.inactive': 'Inactive',
    }
  })

  const [analytics, setAnalytics] = useState<MentorAnalytics[]>([])
  const [allMentors, setAllMentors] = useState<MentorOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedMentors, setExpandedMentors] = useState<Set<string>>(new Set())
  const [expandedMentees, setExpandedMentees] = useState<Set<string>>(new Set())
  const [menteeSessions, setMenteeSessions] = useState<Record<string, SessionDetail[]>>({})
  
  const initialStartDate = useMemo(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return firstDay.toISOString().split('T')[0]
  }, [])
  const initialEndDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Filter states
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [selectedMentors, setSelectedMentors] = useState<string[]>([])
  const [mentorSearch, setMentorSearch] = useState('')
  const [isMentorDropdownOpen, setMentorDropdownOpen] = useState(false)
  const mentorDropdownRef = useRef<HTMLDivElement>(null)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    mentors: [] as string[]
  })

  const filteredMentors = useMemo(() => {
    if (!mentorSearch.trim()) return allMentors
    const query = mentorSearch.toLowerCase()
    return allMentors.filter((mentor) =>
      mentor.full_name.toLowerCase().includes(query) || mentor.email.toLowerCase().includes(query)
    )
  }, [allMentors, mentorSearch])

  const mentorNameLookup = useMemo(() => {
    const lookup: Record<string, MentorOption> = {}
    allMentors.forEach((mentor) => {
      lookup[mentor.id] = mentor
    })
    return lookup
  }, [allMentors])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentorDropdownRef.current && !mentorDropdownRef.current.contains(event.target as Node)) {
        setMentorDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (userProfile?.role !== 'coordinator') {
        setError(t('error.permission'))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch all mentors for the filter
        console.log('Fetching mentors...')
        const { data: mentorsData, error: mentorsError } = await getAllMentors()
        if (mentorsError) {
          console.error('Mentors fetch error:', mentorsError)
          throw new Error(`Failed to fetch mentors: ${mentorsError.message}`)
        }
        
        // Transform the data to ensure full_name is always a string
        const transformedMentors: MentorOption[] = (mentorsData || []).map(mentor => ({
          id: mentor.id,
          full_name: mentor.full_name || 'Unknown Mentor',
          email: mentor.email
        }))
        
        setAllMentors(transformedMentors)
        console.log('Mentors loaded:', transformedMentors.length)

        // Fetch analytics data
        console.log('Fetching analytics with params:', { startDate, endDate, selectedMentors })
        const { data: analyticsData, error: analyticsError } = await getDetailedMentorAnalytics(
          appliedFilters.startDate,
          appliedFilters.endDate,
          appliedFilters.mentors.length > 0 ? appliedFilters.mentors : undefined
        )
        if (analyticsError) {
          console.error('Analytics fetch error:', analyticsError)
          throw new Error(`Failed to fetch analytics: ${analyticsError.message}`)
        }
        
        console.log('Analytics loaded:', analyticsData?.length || 0, 'mentors')
        setAnalytics(analyticsData || [])
        
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        const errorMessage = err instanceof Error ? err.message : t('error.dataLoad')
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userProfile, appliedFilters, t])

  const toggleMentor = (mentorId: string) => {
    const newExpanded = new Set(expandedMentors)
    if (newExpanded.has(mentorId)) {
      newExpanded.delete(mentorId)
    } else {
      newExpanded.add(mentorId)
    }
    setExpandedMentors(newExpanded)
  }

  const toggleMentee = async (menteeId: string) => {
    const newExpanded = new Set(expandedMentees)
    if (newExpanded.has(menteeId)) {
      newExpanded.delete(menteeId)
      setExpandedMentees(newExpanded)
    } else {
      newExpanded.add(menteeId)
      setExpandedMentees(newExpanded)
      
      // Fetch session details if not already loaded
      if (!menteeSessions[menteeId]) {
        try {
          const { data: sessionsData } = await getMenteeSessionDetails(menteeId, startDate, endDate)
          setMenteeSessions(prev => ({
            ...prev,
            [menteeId]: sessionsData || []
          }))
        } catch (err) {
          console.error('Failed to fetch session details:', err)
        }
      }
    }
  }

  const clearFilters = () => {
    setStartDate(initialStartDate)
    setEndDate(initialEndDate)
    setSelectedMentors([])
    setAppliedFilters({
      startDate: initialStartDate,
      endDate: initialEndDate,
      mentors: []
    })
  }

  const applyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      mentors: selectedMentors
    })
    setMentorDropdownOpen(false)
  }

  const exportToExcel = () => {
    if (analytics.length === 0) {
      console.warn('No analytics data available to export')
      return
    }

    const workbook = XLSX.utils.book_new()

    // Sheet 1: Mentor summary
    const mentorSummary = analytics.map((mentor) => ({
      'Mentor Name': mentor.mentor_name,
      'Mentor Email': mentor.mentor_email,
      'Total Mentees': mentor.total_mentees,
      'Active Mentees': mentor.active_mentees,
      'Total Sessions': mentor.total_sessions,
      'Completed Sessions': mentor.completed_sessions,
      'Planned Sessions': mentor.planned_sessions,
      'Average Evaluation': mentor.average_evaluation ?? 'N/A',
      'Total Goals': mentor.total_goals,
      'Achieved Goals': mentor.achieved_goals
    }))

    const mentorSheet = XLSX.utils.json_to_sheet(mentorSummary)
    XLSX.utils.book_append_sheet(workbook, mentorSheet, 'Mentor Summary')

    // Sheet 2: Mentee breakdown
    const menteeRows = analytics.flatMap((mentor) =>
      (mentor.mentees_details || []).map((mentee) => ({
        'Mentor Name': mentor.mentor_name,
        'Mentee Name': mentee.mentee_name,
        'Mentee Email': mentee.mentee_email,
        Status: mentee.status,
        'Total Sessions': mentee.total_sessions,
        'Completed Sessions': mentee.completed_sessions,
        'Planned Sessions': mentee.planned_sessions,
        'Average Evaluation': mentee.average_evaluation ?? 'N/A',
        'Total Goals': mentee.total_goals,
        'Achieved Goals': mentee.achieved_goals
      }))
    )

    if (menteeRows.length > 0) {
      const menteeSheet = XLSX.utils.json_to_sheet(menteeRows)
      XLSX.utils.book_append_sheet(workbook, menteeSheet, 'Mentee Details')
    }

    // Sheet 3: Applied filters metadata
    const filtersSheet = XLSX.utils.json_to_sheet([
      {
        'Start Date': appliedFilters.startDate,
        'End Date': appliedFilters.endDate,
        'Mentor Filters': appliedFilters.mentors
          .map((id) => mentorNameLookup[id]?.full_name || id)
          .join(', ') || 'All mentors'
      }
    ])
    XLSX.utils.book_append_sheet(workbook, filtersSheet, 'Filters')

    const fileName = `mentor-analytics-${appliedFilters.startDate}-to-${appliedFilters.endDate}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('header.title')}</h1>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('export.excel')}
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('filters.period')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filters.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filters.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div ref={mentorDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('filters.mentors')}
              </label>
              <input
                type="text"
                value={mentorSearch}
                onFocus={() => setMentorDropdownOpen(true)}
                onChange={(e) => {
                  setMentorSearch(e.target.value)
                  if (!isMentorDropdownOpen) setMentorDropdownOpen(true)
                }}
                placeholder={t('filters.searchMentors')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isMentorDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredMentors.length === 0 ? (
                    <p className="text-sm text-gray-500 px-3 py-2">{t('filters.searchMentors')}</p>
                  ) : (
                    filteredMentors.map((mentor) => (
                      <label
                        key={mentor.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedMentors.includes(mentor.id)}
                            onChange={(e) => {
                              setSelectedMentors((prev) =>
                                e.target.checked ? [...prev, mentor.id] : prev.filter((id) => id !== mentor.id)
                              )
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{mentor.full_name}</p>
                            <p className="text-xs text-gray-500">{mentor.email}</p>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
              {selectedMentors.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 w-full">
                    {t('filters.selectedMentors')}
                  </p>
                  {selectedMentors.map((mentorId) => (
                    <span
                      key={mentorId}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {mentorNameLookup[mentorId]?.full_name || 'Unknown'}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('filters.apply')}
              </button>
              <button
                onClick={() => setSelectedMentors([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                {t('filters.clear')}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">{t('metrics.totalUsers')}</h3>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.reduce((sum, m) => sum + m.total_mentees, 0)}
            </p>
            <p className="text-sm text-blue-600 mt-2">Total mentees across all mentors</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">{t('metrics.activePairings')}</h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.reduce((sum, m) => sum + m.active_mentees, 0)}
            </p>
            <p className="text-sm text-green-600 mt-2">Active mentor-mentee pairs</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-700">{t('metrics.sessionsThisMonth')}</h3>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.reduce((sum, m) => sum + m.total_sessions, 0)}
            </p>
            <p className="text-sm text-purple-600 mt-2">Total sessions conducted</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-700">Average Rating</h3>
            <p className="text-3xl font-bold text-orange-600">
              {(analytics.reduce((sum, m) => sum + (m.average_evaluation || 0), 0) / analytics.length || 0).toFixed(1)}
            </p>
            <p className="text-sm text-orange-600 mt-2">Average session evaluation</p>
          </div>
        </div>

        {/* Detailed Analytics - Accordion Style */}
        <div>
          <h2 className="text-xl font-bold mb-4">{t('detailed.title')}</h2>
          <div className="space-y-4">
            {analytics.map((mentor) => (
              <div key={mentor.mentor_id} className="border border-gray-200 rounded-lg">
                {/* Mentor Header */}
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleMentor(mentor.mentor_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedMentors.has(mentor.mentor_id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{mentor.mentor_name}</h3>
                        <p className="text-sm text-gray-600">{mentor.mentor_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{mentor.total_mentees}</p>
                        <p className="text-gray-600">{t('mentor.mentees')}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{mentor.total_sessions}</p>
                        <p className="text-gray-600">{t('mentor.sessions')}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-purple-600">{mentor.average_evaluation || 'N/A'}</p>
                        <p className="text-gray-600">{t('mentor.evaluation')}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-orange-600">{mentor.achieved_goals}/{mentor.total_goals}</p>
                        <p className="text-gray-600">{t('mentor.goals')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mentees Details */}
                {expandedMentors.has(mentor.mentor_id) && (
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('mentee.summary')}
                    </h4>
                    <div className="space-y-2">
                      {mentor.mentees_details?.map((mentee) => (
                        <div key={mentee.mentee_id} className="border border-gray-100 rounded-lg">
                          {/* Mentee Header */}
                          <div
                            className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleMentee(mentee.mentee_id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {expandedMentees.has(mentee.mentee_id) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                                <div>
                                  <p className="font-medium">{mentee.mentee_name}</p>
                                  <p className="text-sm text-gray-600">{mentee.mentee_email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                  <p className="font-semibold text-blue-600">{mentee.total_sessions}</p>
                                  <p className="text-gray-600">{t('mentee.sessions')}</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold text-purple-600">{mentee.average_evaluation || 'N/A'}</p>
                                  <p className="text-gray-600">{t('mentee.evaluations')}</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold text-orange-600">{mentee.achieved_goals}/{mentee.total_goals}</p>
                                  <p className="text-gray-600">{t('mentor.goals')}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Session Details */}
                          {expandedMentees.has(mentee.mentee_id) && (
                            <div className="p-3 border-t border-gray-100">
                              <h5 className="font-medium mb-2">{t('session.details')}</h5>
                              {menteeSessions[mentee.mentee_id] ? (
                                <div className="space-y-2">
                                  {menteeSessions[mentee.mentee_id].map((session) => (
                                    <div key={session.session_id} className="bg-white p-3 border border-gray-100 rounded">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                          <p className="font-medium text-gray-700">{t('session.title')}</p>
                                          <p>{session.title}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-700">{t('session.datetime')}</p>
                                          <p>{new Date(session.scheduled_time).toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-700">{t('session.status')}</p>
                                          <p>{t(`status.${session.status}`)}</p>
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-700">{t('session.rating')}</p>
                                          <p>{session.evaluation_rating || 'N/A'}</p>
                                        </div>
                                      </div>
                                      {session.evaluation_comment && (
                                        <div className="mt-2 text-sm">
                                          <p className="font-medium text-gray-700">{t('session.comment')}</p>
                                          <p>{session.evaluation_comment}</p>
                                        </div>
                                      )}
                                      {session.goals_worked_on && (
                                        <div className="mt-2 text-sm">
                                          <p className="font-medium text-gray-700">{t('session.goals')}</p>
                                          <p>{session.goals_worked_on}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  {t('loading')}...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

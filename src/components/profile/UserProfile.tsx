'use client'

import { useState, useEffect, useMemo } from 'react'

import { getUserProfile, getUserSessions, getUserPairings, getMenteeProgress, getMentorStats } from '@/lib/services/database'
import type { UserWithRole, SessionWithUsers, PairingWithUsers, MenteeProgress, MentorStats, DatabaseFunction } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState('')
  const [sessions, setSessions] = useState<SessionWithUsers[]>([])
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [menteeProgress, setMenteeProgress] = useState<MenteeProgress | null>(null)
  const [mentorStats, setMentorStats] = useState<MentorStats | null>(null)
  const { t } = useTranslations({
    namespace: 'profile.view',
    defaults: {
      'error.load': 'Failed to load user profile.',
      'error.notFound': 'Profile not found.',
      'loading': 'Loading profile...',
      'role.default': 'User',
      'contact.title': 'Contact Information',
      'contact.phone': 'Phone:',
      'contact.location': 'Location:',
      'contact.region': 'Region:',
      'contact.timezone': 'Timezone:',
      'contact.notProvided': 'Not provided',
      'mentor.title': 'Mentor Details',
      'mentor.bio': 'Bio',
      'mentor.skills': 'Skills',
      'mentor.expertise': 'Areas of Expertise',
      'mentor.experience': 'Years of Experience:',
      'mentor.linkedin': 'LinkedIn:',
      'mentor.noBio': 'No bio provided.',
      'mentor.notSpecified': 'Not specified',
      'mentor.linkedin.viewProfile': 'View Profile',
      'mentee.title': 'Mentee Details',
      'mentee.careerGoals': 'Career Goals',
      'mentee.learningObjectives': 'Learning Objectives',
      'mentee.experienceLevel': 'Experience Level:',
      'mentee.experienceYears': 'Years of Experience:',
      'mentee.notSpecified': 'Not specified',
      'mentee.level.beginner': 'Beginner',
      'mentee.level.intermediate': 'Intermediate',
      'mentee.level.advanced': 'Advanced',
      'stats.sectionTitle': 'Engagement Overview',
      'stats.mentee.goals': 'Goals Completed',
      'stats.mentee.sessions': 'Sessions Attended',
      'stats.mentee.attendance': 'Attendance Rate',
      'stats.mentor.activeMentees': 'Active Mentees',
      'stats.mentor.totalSessions': 'Total Sessions',
      'stats.mentor.upcomingSessions': 'Upcoming Sessions',
      'sessions.title': 'Session History',
      'sessions.empty': 'No sessions recorded yet.',
      'sessions.table.session': 'Session',
      'sessions.table.with': 'With',
      'sessions.table.date': 'Date',
      'sessions.table.status': 'Status',
      'sessions.table.duration': 'Duration',
      'sessions.table.rating': 'Rating',
      'sessions.table.unknown': 'Unknown participant',
      'sessions.table.notRated': 'Not rated',
      'pairings.title': 'Pairings',
      'pairings.subtitle': 'Active mentorship relationships',
      'pairings.empty': 'No pairings found for this user.',
      'pairings.counterpart': 'Counterpart',
      'pairings.status': 'Status',
      'pairings.since': 'Since',
      'pairings.until': 'Until',
      'pairings.notes': 'Notes',
      'pairings.notes.none': 'No notes provided.'
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const { data, error } = await getUserProfile(userId)
        if (error) {
          setErrorKey('error.load')
          setProfile(null)
          console.error(error)
          setLoading(false)
          return
        }

        if (!data) {
          setErrorKey('error.notFound')
          setProfile(null)
          setLoading(false)
          return
        }

        setProfile(data)
        setErrorKey('')

        const menteeProgressPromise: Promise<DatabaseFunction<MenteeProgress>> =
          data.role === 'mentee'
            ? getMenteeProgress(userId)
            : Promise.resolve({ data: null, error: null })

        const mentorStatsPromise: Promise<DatabaseFunction<MentorStats>> =
          data.role === 'mentor'
            ? getMentorStats(userId)
            : Promise.resolve({ data: null, error: null })

        const [sessionsResult, pairingsResult, menteeProgressResult, mentorStatsResult] = await Promise.all([
          getUserSessions(userId),
          getUserPairings(userId),
          menteeProgressPromise,
          mentorStatsPromise
        ])

        if (sessionsResult.error) {
          console.error('Failed to load sessions for profile view', sessionsResult.error)
        } else if (sessionsResult.data) {
          setSessions(sessionsResult.data)
        }

        if (pairingsResult.error) {
          console.error('Failed to load pairings for profile view', pairingsResult.error)
        } else if (pairingsResult.data) {
          setPairings(pairingsResult.data)
        }

        setMenteeProgress(menteeProgressResult.data ?? null)
        if (menteeProgressResult.error) {
          console.error('Failed to load mentee progress', menteeProgressResult.error)
        }

        setMentorStats(mentorStatsResult.data ?? null)
        if (mentorStatsResult.error) {
          console.error('Failed to load mentor stats', mentorStatsResult.error)
        }
      } catch (error) {
        setErrorKey('error.load')
        setProfile(null)
        console.error('Unexpected error loading profile', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  const sortedSessions = useMemo(() => (
    [...sessions].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
  ), [sessions])

  const sortedPairings = useMemo(() => (
    [...pairings].sort((a, b) => {
      const aDate = a.start_date ? new Date(a.start_date).getTime() : 0
      const bDate = b.start_date ? new Date(b.start_date).getTime() : 0
      return bDate - aDate
    })
  ), [pairings])

  const formatDateTime = (value?: string | null) => {
    if (!value) return t('contact.notProvided')
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  }

  const formatDateOnly = (value?: string | null) => {
    if (!value) return t('contact.notProvided')
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
  }

  const sessionCounterpart = (session: SessionWithUsers) => {
    if (profile?.role === 'mentor') {
      return session.mentee?.full_name || t('sessions.table.unknown')
    }
    if (profile?.role === 'mentee') {
      return session.mentor?.full_name || t('sessions.table.unknown')
    }
    const mentorName = session.mentor?.full_name || t('sessions.table.unknown')
    const menteeName = session.mentee?.full_name || t('sessions.table.unknown')
    return `${mentorName} / ${menteeName}`
  }

  const pairingCounterpart = (pairing: PairingWithUsers) => {
    if (profile?.role === 'mentor') {
      return pairing.mentee?.full_name || t('sessions.table.unknown')
    }
    if (profile?.role === 'mentee') {
      return pairing.mentor?.full_name || t('sessions.table.unknown')
    }
    return `${pairing.mentor?.full_name || t('sessions.table.unknown')} / ${pairing.mentee?.full_name || t('sessions.table.unknown')}`
  }

  const StatCard = ({
    label,
    value,
    sublabel,
    accentClass = 'text-blue-600'
  }: {
    label: string
    value: string
    sublabel?: string
    accentClass?: string
  }) => (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accentClass}`}>{value}</p>
      {sublabel && <p className="text-sm text-gray-500 mt-1">{sublabel}</p>}
    </div>
  )

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (errorKey || !profile) {
    return (
      <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">
        {t(errorKey || 'error.notFound')}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-gray-600">{profile.email}</p>
            <span className="mt-2 inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full capitalize">
              {t(`role.${profile.role}`, profile.role ?? t('role.default'))}
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">{t('contact.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><strong>{t('contact.phone')}</strong> {profile.phone || t('contact.notProvided')}</p>
            <p><strong>{t('contact.location')}</strong> {profile.location || t('contact.notProvided')}</p>
            <p><strong>{t('contact.region')}</strong> {profile.region || t('contact.notProvided')}</p>
            <p><strong>{t('contact.timezone')}</strong> {profile.timezone || t('contact.notProvided')}</p>
          </div>
        </div>
      </div>

      {profile.role === 'mentor' && profile.mentor && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t('mentor.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{t('mentor.bio')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.mentor.bio || t('mentor.noBio')}</p>
            </div>
            <div>
              <h3 className="font-semibold">{t('mentor.skills')}</h3>
              <p className="text-gray-700">{profile.mentor.skills?.join(', ') || t('mentor.notSpecified')}</p>
            </div>
            <div>
              <h3 className="font-semibold">{t('mentor.expertise')}</h3>
              <p className="text-gray-700">{profile.mentor.expertise_areas?.join(', ') || t('mentor.notSpecified')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>{t('mentor.experience')}</strong> {profile.mentor.years_experience ?? t('mentor.notSpecified')}</p>
              {profile.mentor.linkedin_url && (
                <p><strong>{t('mentor.linkedin')}</strong> <a href={profile.mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('mentor.linkedin.viewProfile')}</a></p>
              )}
            </div>
          </div>
        </div>
      )}

      {profile.role === 'mentor' && mentorStats && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{t('stats.sectionTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label={t('stats.mentor.activeMentees')}
              value={String(mentorStats.active_mentees)}
              sublabel={t('pairings.title')}
              accentClass="text-purple-600"
            />
            <StatCard
              label={t('stats.mentor.totalSessions')}
              value={String(mentorStats.total_sessions)}
              sublabel={t('sessions.title')}
              accentClass="text-blue-600"
            />
            <StatCard
              label={t('stats.mentor.upcomingSessions')}
              value={String(mentorStats.upcoming_sessions)}
              sublabel={t('sessions.table.status')}
              accentClass="text-green-600"
            />
          </div>
        </div>
      )}

      {profile.role === 'mentee' && menteeProgress && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{t('stats.sectionTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label={t('stats.mentee.goals')}
              value={`${menteeProgress.completed_goals}/${menteeProgress.total_goals}`}
              sublabel={`${menteeProgress.goal_completion_rate || 0}%`}
              accentClass="text-indigo-600"
            />
            <StatCard
              label={t('stats.mentee.sessions')}
              value={`${menteeProgress.completed_sessions}/${menteeProgress.total_sessions}`}
              sublabel={t('sessions.title')}
              accentClass="text-blue-600"
            />
            <StatCard
              label={t('stats.mentee.attendance')}
              value={`${menteeProgress.session_attendance_rate || 0}%`}
              accentClass="text-emerald-600"
            />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="text-xl font-semibold">{t('sessions.title')}</h2>
            <p className="text-gray-500 text-sm">{t('sessions.table.status')}</p>
          </div>
          <span className="text-sm text-gray-500">{sortedSessions.length} {t('sessions.title').toLowerCase()}</span>
        </div>
        {sortedSessions.length === 0 ? (
          <p className="text-gray-500">{t('sessions.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-gray-500 font-semibold">{t('sessions.table.session')}</th>
                  <th className="py-2 px-3 text-gray-500 font-semibold">{t('sessions.table.with')}</th>
                  <th className="py-2 px-3 text-gray-500 font-semibold">{t('sessions.table.date')}</th>
                  <th className="py-2 px-3 text-gray-500 font-semibold">{t('sessions.table.status')}</th>
                  <th className="py-2 px-3 text-gray-500 font-semibold">{t('sessions.table.duration')}</th>
                  <th className="py-2 px-3 text-gray-500 font-semibold">{t('sessions.table.rating')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((session) => (
                  <tr key={session.id} className="border-t border-gray-100">
                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-900">{session.title}</p>
                      <p className="text-xs text-gray-500">{session.session_type || session.mode}</p>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{sessionCounterpart(session)}</td>
                    <td className="py-3 px-3 text-gray-700">{formatDateTime(session.scheduled_at)}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">{session.status}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{session.duration_minutes ? `${session.duration_minutes} min` : '—'}</td>
                    <td className="py-3 px-3 text-gray-700">{session.rating ? session.rating.toFixed(1) : t('sessions.table.notRated')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="text-xl font-semibold">{t('pairings.title')}</h2>
            <p className="text-gray-500 text-sm">{t('pairings.subtitle')}</p>
          </div>
          <span className="text-sm text-gray-500">{sortedPairings.length}</span>
        </div>
        {sortedPairings.length === 0 ? (
          <p className="text-gray-500">{t('pairings.empty')}</p>
        ) : (
          <div className="space-y-4">
            {sortedPairings.map((pairing) => (
              <div key={pairing.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{t('pairings.counterpart')}</p>
                    <p className="text-lg font-semibold text-gray-900">{pairingCounterpart(pairing)}</p>
                  </div>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 capitalize">{pairing.status}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
                  <p><strong>{t('pairings.since')}</strong> {formatDateOnly(pairing.start_date)}</p>
                  <p><strong>{t('pairings.until')}</strong> {pairing.end_date ? formatDateOnly(pairing.end_date) : '—'}</p>
                  <p><strong>{t('sessions.table.status')}</strong> {pairing.status}</p>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>{t('pairings.notes')}</strong> {pairing.notes || t('pairings.notes.none')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile.role === 'mentee' && profile.mentee && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t('mentee.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{t('mentee.careerGoals')}</h3>
              <p className="text-gray-700">{profile.mentee.career_goals?.join(', ') || t('mentee.notSpecified')}</p>
            </div>
            <div>
              <h3 className="font-semibold">{t('mentee.learningObjectives')}</h3>
              <p className="text-gray-700">{profile.mentee.learning_objectives?.join(', ') || t('mentee.notSpecified')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>{t('mentee.experienceLevel')}</strong> <span className="capitalize">{profile.mentee.current_level ? t(`mentee.level.${profile.mentee.current_level}`, profile.mentee.current_level) : t('mentee.notSpecified')}</span></p>
              <p><strong>{t('mentee.experienceYears')}</strong> {profile.mentee.years_experience ?? t('mentee.notSpecified')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

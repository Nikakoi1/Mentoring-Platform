// Database service functions for Mentoring Platform
import { supabase } from '@/lib/supabase/client'
import type {
  User,
  Mentor,
  Mentee,
  Pairing,
  Session,
  Goal,
  Resource,
  ProgressEntry,
  Notification,
  Message,
  UserWithRole,
  PairingWithUsers,
  SessionWithUsers,
  MenteeProgress,
  MentorStats,
  CreateSessionForm,
  CreateGoalForm,
  DatabaseFunction
} from '@/lib/types/database'

// User functions
export const getUserProfile = async (userId: string): Promise<DatabaseFunction<UserWithRole>> => {
  try {
    // First get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) return { data: null, error: userError }

    // Then get role-specific data based on user role
    let mentor = null
    let mentee = null

    if (user.role === 'mentor') {
      const { data: mentorData } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', userId)
        .single()
      mentor = mentorData
    }

    if (user.role === 'mentee') {
      const { data: menteeData } = await supabase
        .from('mentees')
        .select('*')
        .eq('id', userId)
        .single()
      mentee = menteeData
    }

    const userWithRole = {
      ...user,
      mentor,
      mentee
    }

    return { data: userWithRole, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<DatabaseFunction<User>> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Admin/Coordinator functions
export const getAllUsers = async (): Promise<DatabaseFunction<User[]>> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export const getPlatformAnalytics = async (): Promise<DatabaseFunction<any>> => {
  const { data, error } = await supabase.rpc('get_platform_analytics')
  return { data, error }
}

// Mentor functions
export const getMentorProfile = async (mentorId: string): Promise<DatabaseFunction<Mentor>> => {
  const { data, error } = await supabase
    .from('mentors')
    .select('*')
    .eq('id', mentorId)
    .single()

  return { data, error }
}

export const updateMentorProfile = async (mentorId: string, updates: Partial<Mentor>): Promise<DatabaseFunction<Mentor>> => {
  const { data, error } = await supabase
    .from('mentors')
    .update(updates)
    .eq('id', mentorId)
    .select()
    .single()

  return { data, error }
}

export const getMentorStats = async (mentorId: string): Promise<DatabaseFunction<MentorStats>> => {
  const { data, error } = await supabase
    .rpc('get_mentor_stats', { p_mentor_id: mentorId })

  return { data, error }
}

// Mentee functions
export const getMenteeProfile = async (menteeId: string): Promise<DatabaseFunction<Mentee>> => {
  const { data, error } = await supabase
    .from('mentees')
    .select('*')
    .eq('id', menteeId)
    .single()

  return { data, error }
}

export const updateMenteeProfile = async (menteeId: string, updates: Partial<Mentee>): Promise<DatabaseFunction<Mentee>> => {
  const { data, error } = await supabase
    .from('mentees')
    .update(updates)
    .eq('id', menteeId)
    .select()
    .single()

  return { data, error }
}

export const getMenteeProgress = async (menteeId: string): Promise<DatabaseFunction<MenteeProgress>> => {
  const { data, error } = await supabase
    .rpc('calculate_mentee_progress', { p_mentee_id: menteeId })

  return { data, error }
}

// Pairing functions
export const getUserPairings = async (userId: string): Promise<DatabaseFunction<PairingWithUsers[]>> => {
  const { data, error } = await supabase.rpc('get_user_pairings_with_details', { p_user_id: userId })
  
  // The RPC function returns a single JSONB object which is an array of pairings.
  // We can cast it directly to the expected type.
  return { data: data as PairingWithUsers[], error }
}

export const createPairing = async (pairing: Omit<Pairing, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseFunction<Pairing>> => {
  const { data, error } = await supabase
    .from('pairings')
    .insert(pairing)
    .select()
    .single()

  return { data, error }
}

export const updatePairing = async (pairingId: string, updates: Partial<Pairing>): Promise<DatabaseFunction<Pairing>> => {
  const { data, error } = await supabase
    .from('pairings')
    .update(updates)
    .eq('id', pairingId)
    .select()
    .single()

  return { data, error }
}

// Session functions
export const getUserSessions = async (userId: string): Promise<DatabaseFunction<SessionWithUsers[]>> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      mentor:mentor_id(*),
      mentee:mentee_id(*),
      pairing:pairing_id(*)
    `)
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .order('scheduled_at', { ascending: true })

  return { data, error }
}

export const getUpcomingSessions = async (userId: string): Promise<DatabaseFunction<Session[]>> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  return { data, error }
}

export const createSession = async (session: CreateSessionForm): Promise<DatabaseFunction<Session>> => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      ...session,
      duration_minutes: session.duration_minutes || 60,
      session_type: session.session_type || 'regular',
      mode: session.mode || 'virtual'
    })
    .select()
    .single()

  return { data, error }
}

export const updateSession = async (sessionId: string, updates: Partial<Session>): Promise<DatabaseFunction<Session>> => {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  return { data, error }
}

// Goal functions
export const getPairingGoals = async (pairingId: string): Promise<DatabaseFunction<Goal[]>> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('pairing_id', pairingId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createGoal = async (goal: CreateGoalForm): Promise<DatabaseFunction<Goal>> => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      ...goal,
      priority: goal.priority || 'medium'
    })
    .select()
    .single()

  return { data, error }
}

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<DatabaseFunction<Goal>> => {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()

  return { data, error }
}

// Resource functions
export const getPairingResources = async (pairingId: string): Promise<DatabaseFunction<Resource[]>> => {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('pairing_id', pairingId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const uploadResource = async (resource: Omit<Resource, 'id' | 'created_at' | 'download_count'>): Promise<DatabaseFunction<Resource>> => {
  const { data, error } = await supabase
    .from('resources')
    .insert(resource)
    .select()
    .single()

  return { data, error }
}

// Progress functions
export const getPairingProgress = async (pairingId: string): Promise<DatabaseFunction<ProgressEntry[]>> => {
  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('pairing_id', pairingId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createProgressEntry = async (entry: Omit<ProgressEntry, 'id' | 'created_at'>): Promise<DatabaseFunction<ProgressEntry>> => {
  const { data, error } = await supabase
    .from('progress_entries')
    .insert(entry)
    .select()
    .single()

  return { data, error }
}

// Notification functions
export const getUserNotifications = async (userId: string): Promise<DatabaseFunction<Notification[]>> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return { data, error }
}

export const markNotificationAsRead = async (notificationId: string): Promise<DatabaseFunction<Notification>> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single()

  return { data, error }
}

// Message functions
export const getPairingMessages = async (pairingId: string): Promise<DatabaseFunction<Message[]>> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('pairing_id', pairingId)
    .order('created_at', { ascending: true })

  return { data, error }
}

export const sendMessage = async (message: Omit<Message, 'id' | 'created_at' | 'read_at'>): Promise<DatabaseFunction<Message>> => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()

  return { data, error }
}

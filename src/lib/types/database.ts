// Database Types for Mentoring Platform
// Generated from Supabase schema

export type UserRole = 'coordinator' | 'mentor' | 'mentee'
export type PairingStatus = 'active' | 'completed' | 'paused' | 'pending'
export type SessionStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
export type SessionType = 'regular' | 'assessment' | 'goal-setting' | 'review'
export type SessionMode = 'virtual' | 'in-person' | 'phone'
export type AssessmentType = 'baseline' | 'progress' | 'final'
export type AssessmentStatus = 'draft' | 'active' | 'completed'
export type GoalStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold'
export type GoalPriority = 'low' | 'medium' | 'high'
export type ResourceType = 'document' | 'video' | 'link' | 'image' | 'presentation' | 'code'
export type ProgressEntryType = 'milestone' | 'reflection' | 'feedback' | 'achievement'
export type ProgressVisibility = 'private' | 'mentor' | 'public'
export type NotificationType = 'session_reminder' | 'new_message' | 'goal_update' | 'assessment_due' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high'
export type MessageType = 'direct' | 'session_note' | 'system'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

// Database Tables
export interface User {
  id: string
  email: string
  full_name?: string
  role: UserRole
  profile?: Record<string, any>
  avatar_url?: string
  phone?: string
  location?: string
  timezone?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Mentor {
  id: string
  region?: string
  bio?: string
  skills?: string[]
  expertise_areas?: string[]
  years_experience?: number
  max_mentees: number
  availability?: Record<string, any>
  linkedin_url?: string
  github_url?: string
  website_url?: string
  active: boolean
  created_at: string
}

export interface Mentee {
  id: string
  federation?: string
  years_experience: number
  career_goals?: string[]
  learning_objectives?: string[]
  baseline_assessment_id?: string
  current_level?: ExperienceLevel
  preferred_mentor_skills?: string[]
  active: boolean
  created_at: string
}

export interface Pairing {
  id: string
  mentor_id: string
  mentee_id: string
  coordinator_id?: string
  status: PairingStatus
  start_date?: string
  end_date?: string
  goals?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  pairing_id: string
  mentor_id: string
  mentee_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  session_type?: SessionType
  mode: SessionMode
  location?: string
  meeting_link?: string
  meeting_password?: string
  topics?: string[]
  agenda?: string
  notes?: string
  mentor_feedback?: string
  mentee_feedback?: string
  rating?: number
  status: SessionStatus
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  mentee_id: string
  mentor_id?: string
  assessment_type: AssessmentType
  title: string
  questions: Record<string, any>
  responses?: Record<string, any>
  score?: number
  max_score?: number
  feedback?: string
  completed_at?: string
  status: AssessmentStatus
  created_at: string
}

export interface Goal {
  id: string
  pairing_id: string
  mentee_id: string
  title: string
  description?: string
  category?: string
  target_date?: string
  priority: GoalPriority
  status: GoalStatus
  progress_percentage: number
  milestones?: any[]
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  uploaded_by: string
  pairing_id?: string
  session_id?: string
  title: string
  description?: string
  resource_type: ResourceType
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  external_url?: string
  tags?: string[]
  is_public: boolean
  download_count: number
  created_at: string
}

export interface ProgressEntry {
  id: string
  pairing_id: string
  mentee_id: string
  mentor_id: string
  session_id?: string
  goal_id?: string
  entry_type: ProgressEntryType
  title: string
  content?: string
  metrics?: Record<string, any>
  attachments?: string[]
  visibility: ProgressVisibility
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: NotificationType
  related_id?: string
  related_type?: string
  read_at?: string
  action_url?: string
  priority: NotificationPriority
  created_at: string
}

export interface Message {
  id: string
  pairing_id: string
  sender_id: string
  recipient_id: string
  subject?: string
  content: string
  message_type: MessageType
  attachments?: string[]
  read_at?: string
  replied_to?: string
  created_at: string
}

// Extended types with relations
export interface UserWithRole extends User {
  mentor?: Mentor
  mentee?: Mentee
}

export interface PairingWithUsers extends Pairing {
  mentor: User & { mentor: Mentor }
  mentee: User & { mentee: Mentee }
  coordinator?: User
}

export interface SessionWithUsers extends Session {
  mentor: User
  mentee: User
  pairing: Pairing
}

export interface GoalWithProgress extends Goal {
  progress_entries: ProgressEntry[]
}

// API Response types
export interface MenteeProgress {
  total_goals: number
  completed_goals: number
  goal_completion_rate: number
  total_sessions: number
  completed_sessions: number
  session_attendance_rate: number
}

export interface MentorStats {
  active_mentees: number
  total_sessions: number
  upcoming_sessions: number
}

// Form types
export interface CreateUserForm {
  email: string
  full_name: string
  role: UserRole
  phone?: string
  location?: string
}

export interface CreateMentorForm extends CreateUserForm {
  bio?: string
  skills?: string[]
  expertise_areas?: string[]
  years_experience?: number
  linkedin_url?: string
  github_url?: string
  website_url?: string
}

export interface CreateMenteeForm extends CreateUserForm {
  federation?: string
  years_experience?: number
  career_goals?: string[]
  learning_objectives?: string[]
  current_level?: ExperienceLevel
}

export interface CreateSessionForm {
  pairing_id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes?: number
  session_type?: SessionType
  mode?: SessionMode
  location?: string
  meeting_link?: string
  topics?: string[]
  agenda?: string
}

export interface CreateGoalForm {
  pairing_id: string
  title: string
  description?: string
  category?: string
  target_date?: string
  priority?: GoalPriority
}

// Database function return types
export type DatabaseFunction<T = any> = {
  data: T | null
  error: Error | null
}

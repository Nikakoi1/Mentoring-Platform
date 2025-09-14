-- Complete Mentoring Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK(role IN ('coordinator','mentor','mentee')) NOT NULL,
  profile JSONB DEFAULT '{}',
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  timezone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mentors table
CREATE TABLE public.mentors (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  region TEXT,
  bio TEXT,
  skills TEXT[],
  expertise_areas TEXT[],
  years_experience INTEGER,
  max_mentees INTEGER DEFAULT 3,
  availability JSONB DEFAULT '{}', -- Store weekly availability
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mentees table
CREATE TABLE public.mentees (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  federation TEXT,
  years_experience INTEGER DEFAULT 0,
  career_goals TEXT[],
  learning_objectives TEXT[],
  baseline_assessment_id UUID,
  current_level TEXT CHECK(current_level IN ('beginner','intermediate','advanced')),
  preferred_mentor_skills TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pairings table (mentor-mentee relationships)
CREATE TABLE public.pairings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES public.mentees(id) ON DELETE CASCADE,
  coordinator_id UUID REFERENCES public.users(id),
  status TEXT CHECK(status IN ('active','completed','paused','pending')) DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  goals TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_id)
);

-- 5. Sessions table (meetings and scheduling)
CREATE TABLE public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.mentors(id),
  mentee_id UUID REFERENCES public.mentees(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  session_type TEXT CHECK(session_type IN ('regular','assessment','goal-setting','review')),
  mode TEXT CHECK(mode IN ('virtual','in-person','phone')) DEFAULT 'virtual',
  location TEXT,
  meeting_link TEXT,
  meeting_password TEXT,
  topics TEXT[],
  agenda TEXT,
  notes TEXT,
  mentor_feedback TEXT,
  mentee_feedback TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  status TEXT CHECK(status IN ('scheduled','confirmed','in-progress','completed','cancelled','no-show')) DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assessments table
CREATE TABLE public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentee_id UUID REFERENCES public.mentees(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.mentors(id),
  assessment_type TEXT CHECK(assessment_type IN ('baseline','progress','final')) NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Store questions and answers
  responses JSONB DEFAULT '{}',
  score INTEGER,
  max_score INTEGER,
  feedback TEXT,
  completed_at TIMESTAMPTZ,
  status TEXT CHECK(status IN ('draft','active','completed')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Goals table
CREATE TABLE public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES public.mentees(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_date DATE,
  priority TEXT CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('not-started','in-progress','completed','on-hold')) DEFAULT 'not-started',
  progress_percentage INTEGER DEFAULT 0 CHECK(progress_percentage >= 0 AND progress_percentage <= 100),
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Resources table (file uploads, links, materials)
CREATE TABLE public.resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  uploaded_by UUID REFERENCES public.users(id),
  pairing_id UUID REFERENCES public.pairings(id),
  session_id UUID REFERENCES public.sessions(id),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK(resource_type IN ('document','video','link','image','presentation','code')) NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  external_url TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Progress tracking table
CREATE TABLE public.progress_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  mentee_id UUID REFERENCES public.mentees(id),
  mentor_id UUID REFERENCES public.mentors(id),
  session_id UUID REFERENCES public.sessions(id),
  goal_id UUID REFERENCES public.goals(id),
  entry_type TEXT CHECK(entry_type IN ('milestone','reflection','feedback','achievement')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metrics JSONB DEFAULT '{}', -- Store quantitative progress data
  attachments TEXT[],
  visibility TEXT CHECK(visibility IN ('private','mentor','public')) DEFAULT 'mentor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK(notification_type IN ('session_reminder','new_message','goal_update','assessment_due','system')) NOT NULL,
  related_id UUID, -- Can reference sessions, goals, etc.
  related_type TEXT, -- Type of related entity
  read_at TIMESTAMPTZ,
  action_url TEXT,
  priority TEXT CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Messages table (communication between mentor/mentee)
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id),
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT CHECK(message_type IN ('direct','session_note','system')) DEFAULT 'direct',
  attachments TEXT[],
  read_at TIMESTAMPTZ,
  replied_to UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(active);
CREATE INDEX idx_pairings_mentor ON public.pairings(mentor_id);
CREATE INDEX idx_pairings_mentee ON public.pairings(mentee_id);
CREATE INDEX idx_pairings_status ON public.pairings(status);
CREATE INDEX idx_sessions_pairing ON public.sessions(pairing_id);
CREATE INDEX idx_sessions_scheduled_at ON public.sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON public.sessions(status);
CREATE INDEX idx_goals_pairing ON public.goals(pairing_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_resources_pairing ON public.resources(pairing_id);
CREATE INDEX idx_progress_pairing ON public.progress_entries(pairing_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read_at);
CREATE INDEX idx_messages_pairing ON public.messages(pairing_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

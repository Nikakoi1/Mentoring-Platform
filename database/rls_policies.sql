-- Row Level Security Policies for Mentoring Platform
-- This script is now idempotent and can be run multiple times.

-- Clear existing policies before creating new ones

-- Users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Coordinators can view all users" ON public.users;
DROP POLICY IF EXISTS "Coordinators can manage all users" ON public.users;

-- Mentors table
DROP POLICY IF EXISTS "Mentors can view their own profile" ON public.mentors;
DROP POLICY IF EXISTS "Users can view active mentors" ON public.mentors;
DROP POLICY IF EXISTS "Coordinators can manage mentors" ON public.mentors;

-- Mentees table
DROP POLICY IF EXISTS "Mentees can view their own profile" ON public.mentees;
DROP POLICY IF EXISTS "Mentors can view their mentees" ON public.mentees;
DROP POLICY IF EXISTS "Coordinators can manage mentees" ON public.mentees;

-- Clients table
DROP POLICY IF EXISTS "Mentees can manage their clients" ON public.clients;

-- Client visits table
DROP POLICY IF EXISTS "Mentees can manage their client visits" ON public.client_visits;

-- Pairings table
DROP POLICY IF EXISTS "Users can view their own pairings" ON public.pairings;
DROP POLICY IF EXISTS "Coordinators can manage pairings" ON public.pairings;
DROP POLICY IF EXISTS "Mentors can update their pairings" ON public.pairings;

-- Sessions table
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Mentors can manage their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Mentees can view and update their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Mentees can update session feedback" ON public.sessions;
DROP POLICY IF EXISTS "Coordinators can view all sessions" ON public.sessions;

-- Assessments table
DROP POLICY IF EXISTS "Mentees can view their assessments" ON public.assessments;
DROP POLICY IF EXISTS "Mentees can update their assessment responses" ON public.assessments;
DROP POLICY IF EXISTS "Mentors can manage their mentees' assessments" ON public.assessments;

-- Goals table
DROP POLICY IF EXISTS "Users can view their pairing goals" ON public.goals;
DROP POLICY IF EXISTS "Mentors can manage goals" ON public.goals;
DROP POLICY IF EXISTS "Mentees can update goal progress" ON public.goals;

-- Resources table
DROP POLICY IF EXISTS "Users can view pairing resources" ON public.resources;
DROP POLICY IF EXISTS "Users can upload resources" ON public.resources;
DROP POLICY IF EXISTS "Users can manage their own resources" ON public.resources;

-- Progress entries policies
DROP POLICY IF EXISTS "Users can view pairing progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Mentees can create progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Users can update their own progress entries" ON public.progress_entries;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Messages policies
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their pairings" ON public.messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON public.messages;

-- System settings policies
DROP POLICY IF EXISTS "Authenticated users can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Coordinators can manage system settings" ON public.system_settings;

-- Translations policies
DROP POLICY IF EXISTS "Authenticated users can view translations" ON public.translations;
DROP POLICY IF EXISTS "Coordinators can manage translations" ON public.translations;

-- Recreate policies

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Coordinators can view all users" ON public.users
  FOR SELECT USING (
    public.get_my_role() = 'coordinator'
  );

CREATE POLICY "Coordinators can manage all users" ON public.users
  FOR UPDATE USING (
    public.get_my_role() = 'coordinator'
  );

-- Mentors table policies
CREATE POLICY "Mentors can view their own profile" ON public.mentors
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view active mentors" ON public.mentors
  FOR SELECT USING (active = true);

CREATE POLICY "Coordinators can manage mentors" ON public.mentors
  FOR ALL USING (
    public.get_my_role() = 'coordinator'
  );

-- Mentees table policies
CREATE POLICY "Mentees can view their own profile" ON public.mentees
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Mentors can view their mentees" ON public.mentees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pairings p
      JOIN public.mentors m ON m.id = p.mentor_id
      WHERE p.mentee_id = mentees.id 
      AND m.id = auth.uid()
      AND p.status = 'active'
    )
  );

CREATE POLICY "Coordinators can manage mentees" ON public.mentees
  FOR ALL USING (
    public.get_my_role() = 'coordinator'
  );

-- Clients table policies
CREATE POLICY "Mentees can manage their clients" ON public.clients
  FOR ALL USING (
    mentee_id = auth.uid()
  );

-- Client visits table policies
CREATE POLICY "Mentees can manage their client visits" ON public.client_visits
  FOR ALL USING (
    mentee_id = auth.uid()
  );

-- Pairings table policies
CREATE POLICY "Users can view their own pairings" ON public.pairings
  FOR SELECT USING (
    mentor_id = auth.uid() OR 
    mentee_id = auth.uid() OR
    coordinator_id = auth.uid()
  );

CREATE POLICY "Coordinators can manage pairings" ON public.pairings
  FOR ALL USING (
    public.get_my_role() = 'coordinator'
  );

CREATE POLICY "Mentors can update their pairings" ON public.pairings
  FOR UPDATE USING (mentor_id = auth.uid());

-- Sessions table policies
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (
    mentor_id = auth.uid() OR mentee_id = auth.uid()
  );

CREATE POLICY "Mentors can manage their sessions" ON public.sessions
  FOR ALL USING (mentor_id = auth.uid());

CREATE POLICY "Mentees can view and update their sessions" ON public.sessions
  FOR SELECT USING (mentee_id = auth.uid());

CREATE POLICY "Mentees can update session feedback" ON public.sessions
  FOR UPDATE USING (
    mentee_id = auth.uid() AND 
    status IN ('completed', 'cancelled')
  );

CREATE POLICY "Coordinators can view all sessions" ON public.sessions
  FOR SELECT USING (
    public.get_my_role() = 'coordinator'
  );

-- Assessments table policies
CREATE POLICY "Mentees can view their assessments" ON public.assessments
  FOR SELECT USING (mentee_id = auth.uid());

CREATE POLICY "Mentees can update their assessment responses" ON public.assessments
  FOR UPDATE USING (
    mentee_id = auth.uid() AND 
    status = 'active'
  );

CREATE POLICY "Mentors can manage their mentees' assessments" ON public.assessments
  FOR ALL USING (
    mentor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.pairings p
      WHERE p.mentee_id = assessments.mentee_id 
      AND p.mentor_id = auth.uid()
      AND p.status = 'active'
    )
  );

-- Goals table policies
CREATE POLICY "Users can view their pairing goals" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pairings p
      WHERE p.id = goals.pairing_id 
      AND (p.mentor_id = auth.uid() OR p.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Mentors can manage goals" ON public.goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pairings p
      WHERE p.id = goals.pairing_id 
      AND p.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentees can update goal progress" ON public.goals
  FOR UPDATE USING (
    mentee_id = auth.uid()
  );

-- Resources table policies
CREATE POLICY "Users can view pairing resources" ON public.resources
  FOR SELECT USING (
    is_public = true OR
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.pairings p
      WHERE p.id = resources.pairing_id 
      AND (p.mentor_id = auth.uid() OR p.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload resources" ON public.resources
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can manage their own resources" ON public.resources
  FOR ALL USING (uploaded_by = auth.uid());

-- Progress entries policies
CREATE POLICY "Users can view pairing progress" ON public.progress_entries
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'mentor' AND EXISTS (
      SELECT 1 FROM public.pairings p
      WHERE p.id = progress_entries.pairing_id 
      AND (p.mentor_id = auth.uid() OR p.mentee_id = auth.uid())
    )) OR
    (visibility = 'private' AND mentee_id = auth.uid())
  );

CREATE POLICY "Mentees can create progress entries" ON public.progress_entries
  FOR INSERT WITH CHECK (mentee_id = auth.uid());

CREATE POLICY "Users can update their own progress entries" ON public.progress_entries
  FOR UPDATE USING (
    mentee_id = auth.uid() OR mentor_id = auth.uid()
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages in their pairings" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.pairings p
      WHERE p.id = messages.pairing_id 
      AND (p.mentor_id = auth.uid() OR p.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their sent messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- System settings policies
CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
  FOR SELECT USING (
    auth.role() = 'authenticated' OR auth.role() = 'service_role'
  );

CREATE POLICY "Coordinators can manage system settings" ON public.system_settings
  FOR ALL USING (
    public.get_my_role() = 'coordinator' OR auth.role() = 'service_role'
  );

-- Translations policies
CREATE POLICY "Authenticated users can view translations" ON public.translations
  FOR SELECT USING (
    auth.role() = 'authenticated' OR auth.role() = 'service_role'
  );

CREATE POLICY "Coordinators can manage translations" ON public.translations
  FOR ALL USING (
    public.get_my_role() = 'coordinator' OR auth.role() = 'service_role'
  );

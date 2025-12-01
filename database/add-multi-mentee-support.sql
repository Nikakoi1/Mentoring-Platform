-- Migration: Add support for multiple mentees per session
-- This adds mentee_ids array field while keeping mentee_id for backward compatibility

-- Add mentee_ids array field to sessions table
ALTER TABLE public.sessions 
ADD COLUMN mentee_ids UUID[] DEFAULT NULL;

-- Create index for the new field for better performance
CREATE INDEX idx_sessions_mentee_ids ON public.sessions USING GIN(mentee_ids);

-- Add comment to document the new field
COMMENT ON COLUMN public.sessions.mentee_ids IS 'Array of mentee IDs for group sessions (null for single mentee sessions)';

-- Update RLS policies to include the new field
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (
    mentor_id = auth.uid() OR 
    mentee_id = auth.uid() OR
    auth.uid() = ANY(mentee_ids)
  );

DROP POLICY IF EXISTS "Mentors can manage their sessions" ON public.sessions;
CREATE POLICY "Mentors can manage their sessions" ON public.sessions
  FOR ALL USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Mentees can view and update their sessions" ON public.sessions;
CREATE POLICY "Mentees can view and update their sessions" ON public.sessions
  FOR SELECT USING (
    mentee_id = auth.uid() OR 
    auth.uid() = ANY(mentee_ids)
  );

DROP POLICY IF EXISTS "Mentees can update session feedback" ON public.sessions;
CREATE POLICY "Mentees can update session feedback" ON public.sessions
  FOR UPDATE USING (
    (mentee_id = auth.uid() OR auth.uid() = ANY(mentee_ids)) AND 
    status IN ('completed', 'cancelled')
  );

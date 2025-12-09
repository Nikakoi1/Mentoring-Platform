-- Enable Row Level Security on client_visits table
-- This fixes the security warning where anyone with anonymous key could access data

-- First, drop existing policy to replace with comprehensive policies
DROP POLICY IF EXISTS "Mentees can manage their client visits" ON public.client_visits;

-- Add composite index for optimal mentor query performance
CREATE INDEX IF NOT EXISTS idx_pairings_mentor_mentee_status ON public.pairings(mentor_id, mentee_id, status);

-- Enable RLS on the table
ALTER TABLE public.client_visits ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for proper role-based access

-- 1. Coordinators can view all client visits (READ-ONLY)
CREATE POLICY "Coordinators can view all client visits" ON public.client_visits
  FOR SELECT USING (
    public.get_my_role() = 'coordinator'
  );

-- 2. Mentees can view their own client visits
CREATE POLICY "Mentees can view their client visits" ON public.client_visits
  FOR SELECT USING (
    mentee_id = auth.uid()
  );

-- 3. Mentees can insert their own client visits
CREATE POLICY "Mentees can insert their client visits" ON public.client_visits
  FOR INSERT WITH CHECK (
    mentee_id = auth.uid()
  );

-- 4. Mentees can update their own client visits
CREATE POLICY "Mentees can update their client visits" ON public.client_visits
  FOR UPDATE USING (
    mentee_id = auth.uid()
  );

-- 5. Mentees can delete their own client visits
CREATE POLICY "Mentees can delete their client visits" ON public.client_visits
  FOR DELETE USING (
    mentee_id = auth.uid()
  );

-- 6. Mentors can view client visits for their assigned mentees ( READ-ONLY)
CREATE POLICY "Mentors can view their mentees client visits" ON public.client_visits
  FOR SELECT USING (
    public.get_my_role() = 'mentor' AND 
    EXISTS (
      SELECT 1 FROM public.pairings 
      WHERE pairings.mentor_id = auth.uid() 
        AND pairings.mentee_id = client_visits.mentee_id 
        AND pairings.status = 'active'
    )
  );

-- Verification query (run this to confirm RLS is enabled):
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'client_visits' AND schemaname = 'public';

-- Verification query (run this to confirm policies are active):
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'client_visits' AND schemaname = 'public';

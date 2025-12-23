-- User Cleanup Script - Bypass RLS
-- This script handles Row Level Security issues

-- Option 1: Use TRUNCATE (bypasses RLS completely)
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.resources CASCADE;
TRUNCATE TABLE public.translations CASCADE;
TRUNCATE TABLE public.progress_entries CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.client_visit_evaluations CASCADE;
TRUNCATE TABLE public.client_visits CASCADE;
TRUNCATE TABLE public.assessments CASCADE;
TRUNCATE TABLE public.goals CASCADE;
TRUNCATE TABLE public.sessions CASCADE;
TRUNCATE TABLE public.clients CASCADE;
TRUNCATE TABLE public.pairings CASCADE;

-- Check users before deletion
SELECT 'Users before deletion: ' || COUNT(*) FROM public.users;

-- Create backup of users before deletion
CREATE TABLE IF NOT EXISTS public.users_backup_truncate AS 
SELECT * FROM public.users;

-- Delete all users except target
DELETE FROM public.users 
WHERE email != 'nikoloz.koiava@iliauni.edu.ge';

-- Verify results
SELECT COUNT(*) as remaining_users FROM public.users;
SELECT * FROM public.users;

-- Alternative Option 2: If TRUNCATE doesn't work, disable RLS temporarily
-- Uncomment these lines and comment out TRUNCATE above:

-- ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.resources DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.translations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.progress_entries DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.client_visit_evaluations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.client_visits DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.assessments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pairings DISABLE ROW LEVEL SECURITY;

-- Then run DELETE statements instead of TRUNCATE
-- Remember to re-enable RLS after cleanup if you use this option

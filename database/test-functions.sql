-- Test the new functions to identify the issue
-- Run this in Supabase SQL Editor

-- Test 1: Check if functions exist
SELECT 'Checking if functions exist...' as status;

SELECT 
  proname as function_name,
  pronargs as param_count,
  proargtypes as param_types
FROM pg_proc 
WHERE proname IN ('get_detailed_mentor_analytics', 'get_mentee_session_details')
ORDER BY proname;

-- Test 2: Try calling the mentor analytics function with minimal params
SELECT 'Testing get_detailed_mentor_analytics with no params...' as status;

SELECT * FROM public.get_detailed_mentor_analytics();

-- Test 3: Try calling with date params
SELECT 'Testing with date params...' as status;

SELECT * FROM public.get_detailed_mentor_analytics(
  start_date => DATE_TRUNC('month', CURRENT_DATE)::date,
  end_date => CURRENT_DATE::date
);

-- Test 4: Check if we have any data to work with
SELECT 'Checking data availability...' as status;

SELECT 
  'mentors' as table_name,
  COUNT(*) as count
FROM public.mentors

UNION ALL

SELECT 
  'mentees' as table_name,
  COUNT(*) as count
FROM public.mentees

UNION ALL

SELECT 
  'pairings' as table_name,
  COUNT(*) as count
FROM public.pairings

UNION ALL

SELECT 
  'sessions' as table_name,
  COUNT(*) as count
FROM public.sessions;

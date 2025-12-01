-- Quick Verification Script for Admin Reports Implementation
-- Run this to verify all components are working correctly

-- =====================================================
-- 1. Verify Functions Exist
-- =====================================================

SELECT '=== CHECKING FUNCTIONS ===' as status;

SELECT 
  proname as function_name,
  pronargs as parameter_count
FROM pg_proc 
WHERE proname IN ('get_detailed_mentor_analytics', 'get_mentee_session_details')
ORDER BY proname;

-- =====================================================
-- 2. Test Analytics Function
-- =====================================================

SELECT '=== TESTING MENTOR ANALYTICS FUNCTION ===' as status;

-- Test with current month (no parameters)
SELECT * FROM public.get_detailed_mentor_analytics();

-- =====================================================
-- 3. Test Session Details Function (if you have mentee data)
-- =====================================================

SELECT '=== TESTING SESSION DETAILS FUNCTION ===' as status;

-- Get first mentee ID for testing (if exists)
DO $$
DECLARE
  test_mentee_id UUID;
BEGIN
  SELECT id INTO test_mentee_id FROM public.mentees LIMIT 1;
  
  IF test_mentee_id IS NOT NULL THEN
    RAISE NOTICE 'Testing session details for mentee: %', test_mentee_id;
    PERFORM public.get_mentee_session_details(test_mentee_id);
    RAISE NOTICE 'Session details function works!';
  ELSE
    RAISE NOTICE 'No mentees found to test session details function';
  END IF;
END $$;

-- =====================================================
-- 4. Verify Translations
-- =====================================================

SELECT '=== CHECKING TRANSLATIONS ===' as status;

-- Count admin.reports translations by locale
SELECT 
  locale,
  COUNT(*) as translation_count
FROM public.translations 
WHERE namespace = 'admin.reports'
GROUP BY locale
ORDER BY locale;

-- Sample some translations
SELECT 
  translation_key,
  locale,
  LEFT(value, 30) as sample_value
FROM public.translations 
WHERE namespace = 'admin.reports'
ORDER BY locale, translation_key
LIMIT 10;

-- =====================================================
-- 5. Check Data Availability
-- =====================================================

SELECT '=== CHECKING DATA AVAILABILITY ===' as status;

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

SELECT '=== VERIFICATION COMPLETE ===' as status;

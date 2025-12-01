-- Backup Script for Admin Reports Enhancement
-- Run this BEFORE updating functions and translations
-- This will backup current data that might be affected

-- =====================================================
-- 1. BACKUP CURRENT TRANSLATIONS
-- =====================================================

-- Backup existing admin.reports translations (if any)
CREATE TABLE IF NOT EXISTS backup_admin_reports_translations AS
SELECT * FROM public.translations 
WHERE namespace = 'admin.reports';

-- Backup all existing translations for safety
CREATE TABLE IF NOT EXISTS backup_all_translations AS
SELECT * FROM public.translations;

-- Show what we're backing up
SELECT 'Backing up admin.reports translations:' as info;
SELECT COUNT(*) as count FROM public.translations WHERE namespace = 'admin.reports';

SELECT 'Backing up all translations:' as info;
SELECT COUNT(*) as count FROM public.translations;

-- =====================================================
-- 2. BACKUP RELEVANT TABLES FOR ANALYTICS
-- =====================================================

-- Backup key tables that the new functions will query
CREATE TABLE IF NOT EXISTS backup_users AS
SELECT * FROM public.users;

CREATE TABLE IF NOT EXISTS backup_mentors AS
SELECT * FROM public.mentors;

CREATE TABLE IF NOT EXISTS backup_mentees AS
SELECT * FROM public.mentees;

CREATE TABLE IF NOT EXISTS backup_mentor_pairings AS
SELECT * FROM public.mentor_pairings;

CREATE TABLE IF NOT EXISTS backup_sessions AS
SELECT * FROM public.sessions;

CREATE TABLE IF NOT EXISTS backup_session_evaluations AS
SELECT * FROM public.session_evaluations;

CREATE TABLE IF NOT EXISTS backup_goals AS
SELECT * FROM public.goals;

CREATE TABLE IF NOT EXISTS backup_session_goals AS
SELECT * FROM public.session_goals;

CREATE TABLE IF NOT EXISTS backup_resources AS
SELECT * FROM public.resources;

CREATE TABLE IF NOT EXISTS backup_session_resources AS
SELECT * FROM public.session_resources;

-- =====================================================
-- 3. BACKUP EXISTING FUNCTIONS (if any)
-- =====================================================

-- Check if the functions we're about to create already exist
SELECT 'Checking for existing functions:' as info;

-- Check for get_detailed_mentor_analytics
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'get_detailed_mentor_analytics';

-- Check for get_mentee_session_details  
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'get_mentee_session_details';

-- =====================================================
-- 4. CREATE BACKUP SUMMARY
-- =====================================================

SELECT 'Backup completed successfully!' as status;
SELECT 
  'backup_admin_reports_translations' as table_name,
  COUNT(*) as row_count
FROM backup_admin_reports_translations

UNION ALL

SELECT 
  'backup_all_translations' as table_name,
  COUNT(*) as row_count  
FROM backup_all_translations

UNION ALL

SELECT 
  'backup_users' as table_name,
  COUNT(*) as row_count
FROM backup_users

UNION ALL

SELECT 
  'backup_mentors' as table_name,
  COUNT(*) as row_count
FROM backup_mentors

UNION ALL

SELECT 
  'backup_mentees' as table_name,
  COUNT(*) as row_count
FROM backup_mentees

UNION ALL

SELECT 
  'backup_mentor_pairings' as table_name,
  COUNT(*) as row_count
FROM backup_mentor_pairings

UNION ALL

SELECT 
  'backup_sessions' as table_name,
  COUNT(*) as row_count
FROM backup_sessions

UNION ALL

SELECT 
  'backup_session_evaluations' as table_name,
  COUNT(*) as row_count
FROM backup_session_evaluations

UNION ALL

SELECT 
  'backup_goals' as table_name,
  COUNT(*) as row_count
FROM backup_goals;

-- =====================================================
-- 5. RESTORE INSTRUCTIONS (for future reference)
-- =====================================================

-- To restore translations if needed:
-- DELETE FROM public.translations WHERE namespace = 'admin.reports';
-- INSERT INTO public.translations SELECT * FROM backup_admin_reports_translations;

-- To restore any table if needed:
-- DROP TABLE public.table_name;
-- CREATE TABLE public.table_name AS SELECT * FROM backup_table_name;

-- To drop functions if needed:
-- DROP FUNCTION IF EXISTS public.get_detailed_mentor_analytics;
-- DROP FUNCTION IF EXISTS public.get_mentee_session_details;

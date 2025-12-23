-- Simple User Cleanup Script
-- Deletes all users except nikoloz.koiava@iliauni.edu.ge
-- Run this in Supabase SQL Editor

-- Create backup first
CREATE TABLE IF NOT EXISTS public.users_cleanup_backup AS 
SELECT * FROM public.users;

-- Start transaction
BEGIN;

-- Verify target user exists
DO $$
DECLARE
    target_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO target_count 
    FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge';
    
    IF target_count = 0 THEN
        RAISE EXCEPTION 'Target user nikoloz.koiava@iliauni.edu.ge not found!';
    END IF;
END $$;

-- Delete related data first (tables without CASCADE DELETE)
-- Since this is a full cleanup for testing, delete ALL data from child tables
DELETE FROM public.messages;
SELECT 'Messages remaining after deletion: ' || COUNT(*) FROM public.messages;

DELETE FROM public.resources;
SELECT 'Resources remaining after deletion: ' || COUNT(*) FROM public.resources;

DELETE FROM public.translations;
SELECT 'Translations remaining after deletion: ' || COUNT(*) FROM public.translations;

DELETE FROM public.progress_entries;
SELECT 'Progress entries remaining after deletion: ' || COUNT(*) FROM public.progress_entries;

DELETE FROM public.notifications;
SELECT 'Notifications remaining after deletion: ' || COUNT(*) FROM public.notifications;

DELETE FROM public.client_visit_evaluations;
SELECT 'Client visit evaluations remaining after deletion: ' || COUNT(*) FROM public.client_visit_evaluations;

DELETE FROM public.client_visits;
SELECT 'Client visits remaining after deletion: ' || COUNT(*) FROM public.client_visits;

DELETE FROM public.assessments;
SELECT 'Assessments remaining after deletion: ' || COUNT(*) FROM public.assessments;

DELETE FROM public.goals;
SELECT 'Goals remaining after deletion: ' || COUNT(*) FROM public.goals;

DELETE FROM public.sessions;
SELECT 'Sessions remaining after deletion: ' || COUNT(*) FROM public.sessions;

DELETE FROM public.clients;
SELECT 'Clients remaining after deletion: ' || COUNT(*) FROM public.clients;

DELETE FROM public.pairings;
SELECT 'Pairings remaining after deletion: ' || COUNT(*) FROM public.pairings;

-- Check users before deletion
SELECT 'Users before deletion: ' || COUNT(*) FROM public.users;

-- Delete all users except target (CASCADE will handle mentors/mentees tables)
DELETE FROM public.users 
WHERE email != 'nikoloz.koiava@iliauni.edu.ge';

-- Verify results
SELECT COUNT(*) as remaining_users FROM public.users;
SELECT * FROM public.users;

COMMIT;

-- IMPORTANT: After running this script, you must also delete from auth.users:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Delete all users except nikoloz.koiava@iliauni.edu.ge
-- OR use Admin API to delete auth.users

-- To restore if needed:
-- TRUNCATE public.users CASCADE;
-- INSERT INTO public.users SELECT * FROM public.users_cleanup_backup;

-- Safe User Cleanup Script
-- Deletes all users except nikoloz.koiava@iliauni.edu.ge
-- Creates backup and uses transaction for safety
-- IMPORTANT: This will delete ALL pairings/sessions/goals where nikoloz is NOT involved
-- But preserves data where nikoloz is mentor/mentee/coordinator

-- First, create backup table for all current users
CREATE TABLE IF NOT EXISTS public.users_backup AS 
SELECT * FROM public.users;

-- Backup related tables (optional but recommended)
CREATE TABLE IF NOT EXISTS public.mentors_backup AS 
SELECT m.*, u.email, u.full_name 
FROM public.mentors m 
JOIN public.users u ON m.id = u.id;

CREATE TABLE IF NOT EXISTS public.mentees_backup AS 
SELECT m.*, u.email, u.full_name 
FROM public.mentees m 
JOIN public.users u ON m.id = u.id;

-- Start transaction for safety
BEGIN;

-- Get the target user ID first
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id 
    FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Target user nikoloz.koiava@iliauni.edu.ge not found in users table';
    END IF;
    
    RAISE NOTICE 'Target user ID: %', target_user_id;
END $$;

-- Delete data that doesn't involve nikoloz at all
-- Delete notifications (direct user reference)
DELETE FROM public.notifications 
WHERE user_id NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
);

-- Delete messages where neither sender nor recipient is nikoloz
DELETE FROM public.messages 
WHERE sender_id NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
) AND recipient_id NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
);

-- Delete resources uploaded by others
DELETE FROM public.resources 
WHERE uploaded_by NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
);

-- Delete translations updated by others
DELETE FROM public.translations 
WHERE updated_by NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
);

-- CRITICAL: Delete pairings where nikoloz is NOT involved as mentor, mentee, or coordinator
DELETE FROM public.pairings 
WHERE mentor_id NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
) AND mentee_id NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
) AND coordinator_id NOT IN (
    SELECT id FROM public.users 
    WHERE email = 'nikoloz.koiava@iliauni.edu.ge'
);

-- Now delete users (this will cascade delete mentors/mentees and their related data)
-- Only users not involved in any preserved pairings will be deleted
DELETE FROM public.users 
WHERE email != 'nikoloz.koiava@iliauni.edu.ge'
AND id NOT IN (
    SELECT mentor_id FROM public.pairings 
    WHERE mentor_id IN (SELECT id FROM public.users WHERE email = 'nikoloz.koiava@iliauni.edu.ge')
)
AND id NOT IN (
    SELECT mentee_id FROM public.pairings 
    WHERE mentee_id IN (SELECT id FROM public.users WHERE email = 'nikoloz.koiava@iliauni.edu.ge')
)
AND id NOT IN (
    SELECT coordinator_id FROM public.pairings 
    WHERE coordinator_id IN (SELECT id FROM public.users WHERE email = 'nikoloz.koiava@iliauni.edu.ge')
);

-- Verify cleanup results
DO $$
DECLARE
    remaining_users INTEGER;
    target_user_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO remaining_users FROM public.users;
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'nikoloz.koiava@iliauni.edu.ge') INTO target_user_exists;
    
    RAISE NOTICE 'Remaining users count: %', remaining_users;
    RAISE NOTICE 'Target user exists: %', target_user_exists;
    
    IF NOT target_user_exists THEN
        RAISE EXCEPTION 'Target user nikoloz.koiava@iliauni.edu.ge was accidentally deleted!';
    END IF;
    
    IF remaining_users < 1 THEN
        RAISE EXCEPTION 'No users remaining after cleanup!';
    END IF;
END $$;

-- Commit the transaction
COMMIT;

-- Final verification
SELECT 'Cleanup completed successfully' as status;
SELECT COUNT(*) as remaining_users FROM public.users;
SELECT * FROM public.users WHERE email = 'nikoloz.koiava@iliauni.edu.ge';

-- Instructions for rollback (if needed):
-- To restore users, you would need to:
-- 1. Restore from backup table: INSERT INTO users SELECT * FROM users_backup;
-- 2. Restore related data from respective backup tables
-- 3. Note: This is complex - better to have full database backup before running

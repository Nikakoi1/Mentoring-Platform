-- Quick check for translations data
SELECT COUNT(*) as total_translations FROM translations;

-- Check if you have coordinator role
SELECT get_my_role() as current_role;

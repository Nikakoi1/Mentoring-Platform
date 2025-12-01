-- Check existing translations
-- Run this in Supabase SQL Editor to see what you have

-- 1. Count translations by locale
SELECT 
    locale, 
    COUNT(*) as total_count,
    COUNT(DISTINCT namespace) as namespace_count
FROM translations 
GROUP BY locale 
ORDER BY locale;

-- 2. Show first 10 translations for each locale
SELECT 
    locale,
    namespace,
    translation_key,
    value,
    auto_generated
FROM translations 
ORDER BY locale, namespace, translation_key 
LIMIT 20;

-- 3. Check specific namespaces that are commonly used
SELECT 
    locale,
    namespace,
    COUNT(*) as count
FROM translations 
WHERE namespace IN ('dashboard.mentor', 'dashboard.mentee', 'common')
GROUP BY locale, namespace 
ORDER BY locale, namespace;

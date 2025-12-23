-- Diagnostic script to understand the user cleanup issue
-- Run this first to see what's happening

-- Check nikoloz's user ID
SELECT id, email, role FROM public.users WHERE email = 'nikoloz.koiava@iliauni.edu.ge';

-- Check the problematic user ID from the error
SELECT id, email, role FROM public.users WHERE id = '5fcb7e93-1715-49f1-b8d9-644247f05a59';

-- Check all messages that reference the problematic user
SELECT m.id, m.sender_id, s.email as sender_email, m.recipient_id, r.email as recipient_email, m.subject
FROM public.messages m
LEFT JOIN public.users s ON m.sender_id = s.id
LEFT JOIN public.users r ON m.recipient_id = r.id
WHERE m.sender_id = '5fcb7e93-1715-49f1-b8d9-644247f05a59' 
   OR m.recipient_id = '5fcb7e93-1715-49f1-b8d9-644247f05a59';

-- Check all users and their message counts
SELECT u.id, u.email, u.role, 
       COUNT(DISTINCT m.id) as sent_messages,
       COUNT(DISTINCT m2.id) as received_messages
FROM public.users u
LEFT JOIN public.messages m ON u.id = m.sender_id
LEFT JOIN public.messages m2 ON u.id = m2.recipient_id
GROUP BY u.id, u.email, u.role
ORDER BY u.email;

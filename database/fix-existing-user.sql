-- Fix the existing broken user profile
-- This creates the missing user profile for UUID f287cb38-c9be-454f-988c-bf00d7189aee

-- First, check if the user exists in auth.users
SELECT id, email, raw_user_meta_data FROM auth.users WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee';

-- Create the missing user profile in public.users (without region to avoid column issues)
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Test User'),
  COALESCE(raw_user_meta_data->>'role', 'mentee')
FROM auth.users 
WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee'
AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee');

-- Create the role-specific profile
INSERT INTO public.mentees (id)
SELECT id FROM auth.users 
WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee'
AND raw_user_meta_data->>'role' = 'mentee'
AND NOT EXISTS (SELECT 1 FROM public.mentees WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee');

-- If it's a mentor, create mentor profile instead
INSERT INTO public.mentors (id)
SELECT id FROM auth.users 
WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee'
AND raw_user_meta_data->>'role' = 'mentor'
AND NOT EXISTS (SELECT 1 FROM public.mentors WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee');

-- Verify the fix worked
SELECT u.id, u.email, u.full_name, u.role, m.id as mentor_id, me.id as mentee_id
FROM public.users u
LEFT JOIN public.mentors m ON u.id = m.id
LEFT JOIN public.mentees me ON u.id = me.id
WHERE u.id = 'f287cb38-c9be-454f-988c-bf00d7189aee';

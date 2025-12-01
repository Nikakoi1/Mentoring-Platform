-- Create minimal test data for admin reports
-- Run this only if you have no existing data

-- Create test users
INSERT INTO public.users (id, email, full_name, role, active) VALUES
('00000000-0000-0000-0000-000000000001', 'mentor@test.com', 'Test Mentor', 'mentor', true),
('00000000-0000-0000-0000-000000000002', 'mentee@test.com', 'Test Mentee', 'mentee', true)
ON CONFLICT (id) DO NOTHING;

-- Create mentor and mentee profiles
INSERT INTO public.mentors (id, bio, active) VALUES
('00000000-0000-0000-0000-000000000001', 'Test mentor bio', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mentees (id, active) VALUES
('00000000-0000-0000-0000-000000000002', true)
ON CONFLICT (id) DO NOTHING;

-- Create pairing
INSERT INTO public.pairings (mentor_id, mentee_id, status, start_date) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'active', CURRENT_DATE)
ON CONFLICT (mentor_id, mentee_id) DO NOTHING;

-- Create test session
INSERT INTO public.sessions (pairing_id, mentor_id, mentee_id, title, scheduled_at, status, rating) VALUES
(
  (SELECT id FROM public.pairings WHERE mentor_id = '00000000-0000-0000-0000-000000000001' AND mentee_id = '00000000-0000-0000-0000-000000000002'),
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Test Session',
  CURRENT_TIMESTAMP,
  'completed',
  5
);

SELECT 'Test data created successfully!' as result;

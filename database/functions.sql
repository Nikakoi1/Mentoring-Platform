-- Database Functions and Triggers for Mentoring Platform

-- Function to get the current user's role from the users table
-- This is used in RLS policies to avoid recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mentee')
  );
  
  -- Create role-specific profile
  IF (NEW.raw_user_meta_data->>'role' = 'mentor') THEN
    INSERT INTO public.mentors (id) VALUES (NEW.id);
  ELSIF (NEW.raw_user_meta_data->>'role' = 'mentee') THEN
    INSERT INTO public.mentees (id) VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pairings_updated_at ON public.pairings;
CREATE TRIGGER update_pairings_updated_at BEFORE UPDATE ON public.pairings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, notification_type, 
    related_id, related_type, priority
  )
  VALUES (
    p_user_id, p_title, p_message, p_type,
    p_related_id, p_related_type, p_priority
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send session reminders
CREATE OR REPLACE FUNCTION public.send_session_reminders()
RETURNS INTEGER AS $$
DECLARE
  session_record RECORD;
  reminder_count INTEGER := 0;
BEGIN
  -- Send reminders for sessions starting in 24 hours
  FOR session_record IN
    SELECT s.*, u_mentor.full_name as mentor_name, u_mentee.full_name as mentee_name
    FROM public.sessions s
    JOIN public.users u_mentor ON u_mentor.id = s.mentor_id
    JOIN public.users u_mentee ON u_mentee.id = s.mentee_id
    WHERE s.scheduled_at BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    AND s.status = 'scheduled'
    AND s.reminder_sent = false
  LOOP
    -- Notify mentor
    PERFORM public.create_notification(
      session_record.mentor_id,
      'Session Reminder',
      'You have a mentoring session with ' || session_record.mentee_name || ' tomorrow at ' || 
      to_char(session_record.scheduled_at, 'HH24:MI'),
      'session_reminder',
      session_record.id,
      'session'
    );
    
    -- Notify mentee
    PERFORM public.create_notification(
      session_record.mentee_id,
      'Session Reminder',
      'You have a mentoring session with ' || session_record.mentor_name || ' tomorrow at ' || 
      to_char(session_record.scheduled_at, 'HH24:MI'),
      'session_reminder',
      session_record.id,
      'session'
    );
    
    -- Mark reminder as sent
    UPDATE public.sessions 
    SET reminder_sent = true 
    WHERE id = session_record.id;
    
    reminder_count := reminder_count + 1;
  END LOOP;
  
  RETURN reminder_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate mentee progress
CREATE OR REPLACE FUNCTION public.calculate_mentee_progress(p_mentee_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_goals INTEGER;
  completed_goals INTEGER;
  total_sessions INTEGER;
  completed_sessions INTEGER;
  progress_data JSONB;
BEGIN
  -- Count goals
  SELECT COUNT(*) INTO total_goals
  FROM public.goals g
  JOIN public.pairings p ON p.id = g.pairing_id
  WHERE p.mentee_id = p_mentee_id AND p.status = 'active';
  
  SELECT COUNT(*) INTO completed_goals
  FROM public.goals g
  JOIN public.pairings p ON p.id = g.pairing_id
  WHERE p.mentee_id = p_mentee_id AND p.status = 'active' AND g.status = 'completed';
  
  -- Count sessions
  SELECT COUNT(*) INTO total_sessions
  FROM public.sessions s
  WHERE s.mentee_id = p_mentee_id AND s.status IN ('completed', 'scheduled');
  
  SELECT COUNT(*) INTO completed_sessions
  FROM public.sessions s
  WHERE s.mentee_id = p_mentee_id AND s.status = 'completed';
  
  -- Build progress data
  progress_data := jsonb_build_object(
    'total_goals', total_goals,
    'completed_goals', completed_goals,
    'goal_completion_rate', CASE WHEN total_goals > 0 THEN (completed_goals::FLOAT / total_goals * 100)::INTEGER ELSE 0 END,
    'total_sessions', total_sessions,
    'completed_sessions', completed_sessions,
    'session_attendance_rate', CASE WHEN total_sessions > 0 THEN (completed_sessions::FLOAT / total_sessions * 100)::INTEGER ELSE 0 END
  );
  
  RETURN progress_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get mentor dashboard stats
CREATE OR REPLACE FUNCTION public.get_mentor_stats(p_mentor_id UUID)
RETURNS JSONB AS $$
DECLARE
  active_mentees INTEGER;
  total_sessions INTEGER;
  upcoming_sessions INTEGER;
  stats_data JSONB;
BEGIN
  -- Count active mentees
  SELECT COUNT(*) INTO active_mentees
  FROM public.pairings
  WHERE mentor_id = p_mentor_id AND status = 'active';
  
  -- Count total sessions
  SELECT COUNT(*) INTO total_sessions
  FROM public.sessions
  WHERE mentor_id = p_mentor_id AND status = 'completed';
  
  -- Count upcoming sessions
  SELECT COUNT(*) INTO upcoming_sessions
  FROM public.sessions
  WHERE mentor_id = p_mentor_id 
  AND status = 'scheduled' 
  AND scheduled_at > NOW();
  
  stats_data := jsonb_build_object(
    'active_mentees', active_mentees,
    'total_sessions', total_sessions,
    'upcoming_sessions', upcoming_sessions
  );
  
  RETURN stats_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform-wide analytics for coordinator dashboard
CREATE OR REPLACE FUNCTION public.get_platform_analytics()
RETURNS JSONB AS $$
DECLARE
  analytics_data JSONB;
  total_users_count INTEGER;
  total_mentors_count INTEGER;
  total_mentees_count INTEGER;
  active_pairings_count INTEGER;
  sessions_this_month_count INTEGER;
  avg_session_rating NUMERIC;
BEGIN
  -- User counts
  SELECT COUNT(*) INTO total_users_count FROM public.users;
  SELECT COUNT(*) INTO total_mentors_count FROM public.users WHERE role = 'mentor';
  SELECT COUNT(*) INTO total_mentees_count FROM public.users WHERE role = 'mentee';

  -- Active pairings
  SELECT COUNT(*) INTO active_pairings_count FROM public.pairings WHERE status = 'active';

  -- Sessions this month
  SELECT COUNT(*) INTO sessions_this_month_count
  FROM public.sessions
  WHERE status = 'completed' AND scheduled_at >= date_trunc('month', NOW());

  -- Average session rating
  SELECT AVG(rating) INTO avg_session_rating FROM public.sessions WHERE rating IS NOT NULL;

  -- Build JSON object
  analytics_data := jsonb_build_object(
    'totalUsers', total_users_count,
    'totalMentors', total_mentors_count,
    'totalMentees', total_mentees_count,
    'activePairings', active_pairings_count,
    'sessionsThisMonth', sessions_this_month_count,
    'averageSessionRating', COALESCE(avg_session_rating, 0)
  );

  RETURN analytics_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user pairings with full user details
CREATE OR REPLACE FUNCTION public.get_user_pairings_with_details(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT jsonb_agg(jsonb_build_object(
      'id', p.id,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'mentor_id', p.mentor_id,
      'mentee_id', p.mentee_id,
      'coordinator_id', p.coordinator_id,
      'status', p.status,
      'start_date', p.start_date,
      'end_date', p.end_date,
      'mentor', (SELECT jsonb_build_object('id', u_m.id, 'full_name', u_m.full_name, 'email', u_m.email) FROM public.users u_m WHERE u_m.id = p.mentor_id),
      'mentee', (SELECT jsonb_build_object('id', u_e.id, 'full_name', u_e.full_name, 'email', u_e.email) FROM public.users u_e WHERE u_e.id = p.mentee_id)
    ))
    FROM public.pairings p
    WHERE (p.mentor_id = p_user_id OR p.mentee_id = p_user_id) AND p.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

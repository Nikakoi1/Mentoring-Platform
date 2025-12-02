-- Update the registration function to include region support
-- (Region column already exists, so we just need to update the function)

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with region support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with region
  INSERT INTO public.users (id, email, full_name, role, region)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mentee'),
    NULLIF(NEW.raw_user_meta_data->>'region', '')
  );
  
  -- Create role-specific profile
  IF (NEW.raw_user_meta_data->>'role' = 'mentor') THEN
    INSERT INTO public.mentors (id) VALUES (NEW.id);
  ELSIF (NEW.raw_user_meta_data->>'role' = 'mentee') THEN
    INSERT INTO public.mentees (id) VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
EXCEPTION 
  WHEN unique_violation THEN
    -- User or profile already exists, this is OK
    RETURN NEW;
  WHEN check_violation THEN
    -- Check constraint violation, fail registration
    RAISE EXCEPTION 'Invalid user data during registration: %', SQLERRM;
  WHEN OTHERS THEN
    -- For any other error, fail the registration
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the existing broken user to include region
UPDATE public.users 
SET region = (SELECT raw_user_meta_data->>'region' FROM auth.users WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee')
WHERE id = 'f287cb38-c9be-454f-988c-bf00d7189aee';

-- Verify the region column exists and the user was updated
SELECT u.id, u.email, u.full_name, u.role, u.region, m.id as mentor_id, me.id as mentee_id
FROM public.users u
LEFT JOIN public.mentors m ON u.id = m.id
LEFT JOIN public.mentees me ON u.id = me.id
WHERE u.id = 'f287cb38-c9be-454f-988c-bf00d7189aee';

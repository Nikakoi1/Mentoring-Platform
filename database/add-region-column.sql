-- Add the missing region column to the users table
ALTER TABLE public.users ADD COLUMN region TEXT;

-- Update the registration function to include region
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

-- Verify the region column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'region';

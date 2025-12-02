-- Fix the handle_new_user function with proper error handling
-- Only handle expected errors, fail on real problems
-- Updated to match actual database schema (no region column)

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with specific error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table - only handle duplicate user errors
  -- Note: region column doesn't exist in actual schema
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mentee')
  );
  
  -- Create role-specific profile - only handle duplicate profile errors
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
    -- Check constraint violation (like invalid role), fail registration
    RAISE EXCEPTION 'Invalid user data during registration: %', SQLERRM;
  WHEN OTHERS THEN
    -- For any other error, fail the registration so we know about real problems
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration by creating user profile and role-specific records. Updated to match actual schema (no region column). Only handles expected duplicate errors, fails on real problems.';

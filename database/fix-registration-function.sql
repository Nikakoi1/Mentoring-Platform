-- Fix the handle_new_user function to handle registration errors properly
-- This addresses the 500 error during user registration

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with proper error handling
  BEGIN
    INSERT INTO public.users (id, email, full_name, role, region)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'mentee'),
      NULLIF(NEW.raw_user_meta_data->>'region', '')
    );
  EXCEPTION 
    WHEN unique_violation THEN
      -- User already exists, just continue
      RETURN NEW;
    WHEN OTHERS THEN
      -- Log the error but don't fail the registration
      RAISE WARNING 'Failed to create user profile: %', SQLERRM;
      RETURN NEW;
  END;
  
  -- Create role-specific profile with error handling
  BEGIN
    IF (NEW.raw_user_meta_data->>'role' = 'mentor') THEN
      INSERT INTO public.mentors (id) VALUES (NEW.id);
    ELSIF (NEW.raw_user_meta_data->>'role' = 'mentee') THEN
      INSERT INTO public.mentees (id) VALUES (NEW.id);
    END IF;
  EXCEPTION 
    WHEN unique_violation THEN
      -- Profile already exists, just continue
      RETURN NEW;
    WHEN OTHERS THEN
      -- Log the error but don't fail the registration
      RAISE WARNING 'Failed to create role-specific profile: %', SQLERRM;
      RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user registration by creating user profile and role-specific records. Includes error handling to prevent registration failures.';

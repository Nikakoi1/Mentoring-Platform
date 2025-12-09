-- FINAL CONSOLIDATED MIGRATION
-- This consolidates all user schema updates into one idempotent migration
-- Run this instead of multiple separate migrations

-- Add region column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'region'
    ) THEN
        ALTER TABLE public.users ADD COLUMN region TEXT;
    END IF;
END $$;

-- Add locale column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'locale'
    ) THEN
        ALTER TABLE public.users ADD COLUMN locale TEXT DEFAULT 'en';
        -- Add constraint to ensure only supported locales
        ALTER TABLE public.users ADD CONSTRAINT valid_locale 
          CHECK (locale IN ('en', 'ka'));
    END IF;
END $$;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create final improved function with region and locale support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with region and locale
  INSERT INTO public.users (id, email, full_name, role, region, locale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mentee'),
    NULLIF(NEW.raw_user_meta_data->>'region', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'locale', ''), 'en')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    region = EXCLUDED.region,
    locale = EXCLUDED.locale;
  
  -- Create role-specific profile
  IF (NEW.raw_user_meta_data->>'role' = 'mentor') THEN
    INSERT INTO public.mentors (id) VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  ELSIF (NEW.raw_user_meta_data->>'role' = 'mentee') THEN
    INSERT INTO public.mentees (id) VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
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

-- Update existing users to have default values if not set
UPDATE public.users 
SET region = NULLIF((SELECT raw_user_meta_data->>'region' FROM auth.users WHERE auth.users.id = public.users.id), '') 
WHERE region IS NULL AND EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = public.users.id AND raw_user_meta_data->>'region' IS NOT NULL);

UPDATE public.users 
SET locale = COALESCE(NULLIF((SELECT raw_user_meta_data->>'locale' FROM auth.users WHERE auth.users.id = public.users.id), ''), 'en') 
WHERE locale IS NULL;

-- Verify the final schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' 
AND column_name IN ('region', 'locale')
ORDER BY column_name;

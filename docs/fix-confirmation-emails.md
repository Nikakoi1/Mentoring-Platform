# Fix Email Confirmation Issues

## Issue 1: Email Confirmation Links Pointing to Localhost

### Solution: Update Supabase Site URL

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following fields:
   - **Site URL**: `https://your-vercel-app.vercel.app`
   - **Redirect URLs**: Add `https://your-vercel-app.vercel.app/auth/callback`
   - **Additional Redirect URLs**: Add your local development URL for testing

### Environment Variables

Create a `.env.local` file in your project root:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
SITE_URL=https://your-vercel-app.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Issue 2: Georgian Email Translation

### Current Limitation
Supabase Auth doesn't support email template localization natively. You have two options:

### Option A: Custom Email Templates (Paid Plan)
1. Upgrade to Supabase Pro plan
2. Create custom email templates with locale detection
3. Use user metadata to determine language preference

### Option B: Client-Side Solution (Free)
1. Keep emails in English
2. Show localized confirmation message on the website after email verification
3. Add language switcher to the confirmation page

### Implementation for Option B

The registration forms already include Georgian translations for the success message. The email confirmation will work in English, but the user experience will be localized on the website.

## Issue 3: Profile Data Not Saving

### Debugging Added
I've added console logging to the UserProfileForm component. To debug:

1. Open browser developer tools
2. Go to the profile edit page
3. Try to save changes
4. Check the console for logs:
   - "UserProfileForm: Starting save process"
   - "UserProfileForm: User ID: [id]"
   - "UserProfileForm: Updates to apply: [data]"
   - "UserProfileForm: Calling updateUserProfile..."
   - "UserProfileForm: updateUserProfile result: [error/data]"

### Common Issues and Solutions

#### RLS Policy Issues
If you see permission errors, run this SQL in Supabase SQL Editor:

```sql
-- Check if RLS policies exist for users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Recreate policies if needed
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

#### Authentication Issues
If the user is not properly authenticated, the `auth.uid()` will be null. Ensure:
1. User is logged in
2. Session is active
3. No auth errors in console

#### Database Schema Issues
Check if the users table has the correct columns:

```sql
-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

## Issue 4: Location Field → Region Field ✅

### Completed Changes
1. ✅ Removed `location` field from TypeScript interfaces
2. ✅ Updated UserProfile component to show only region
3. ✅ Database already has `region` column
4. ✅ Registration forms use region field

### Verification
The region field is now properly used throughout the application instead of location.

## Testing Checklist

1. **Email Confirmation**: 
   - [ ] Update Supabase site URL
   - [ ] Test email confirmation flow
   - [ ] Verify redirect goes to Vercel app

2. **Profile Save**:
   - [ ] Try editing profile with browser console open
   - [ ] Check for debug logs
   - [ ] Verify data saves successfully

3. **Region Field**:
   - [ ] Confirm region appears in registration
   - [ ] Confirm region appears in profile view/edit
   - [ ] Confirm no location references remain

4. **Localization**:
   - [ ] Test registration in both English and Georgian
   - [ ] Verify success messages are localized

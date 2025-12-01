# Role‑Based Registration and Routing

## Overview
The mentoring platform now supports dedicated registration pages for mentors and mentees, with automatic role‑based routing after sign‑in. Users land on a unified `/dashboard` that renders role‑specific UI.

## Features

### 1. Dedicated Registration Pages
- **Mentor registration**: `/register/mentor`
  - Pre‑selects `role: 'mentor'`
  - Mentor‑specific messaging and branding (blue theme)
  - Requires `full_name`, `email`, `password`, and `region`
- **Mentee registration**: `/register/mentee`
  - Pre‑selects `role: 'mentee'`
  - Mentee‑specific messaging and branding (green theme)
  - Requires `full_name`, `email`, `password`, and `region`
- **General registration**: `/register` (unchanged)
  - Allows role selection via dropdown
  - Supports `mentor`, `mentee`, and `coordinator` roles

### 2. Role‑Based Sign‑In Routing
- All users sign in at `/login`
- After successful authentication, the app fetches the user profile and redirects to `/dashboard`
- The `/dashboard` page detects the user’s role and renders the appropriate dashboard component:
  - `mentor` → `MentorDashboard` component
  - `mentee` → `MenteeDashboard` component
  - `coordinator` → `CoordinatorDashboard` component

### 3. Dashboard Landing Page
- `/dashboard` serves as the unified landing page for all authenticated users
- Displays a top navigation bar with:
  - Platform branding
  - Welcome message with user’s full name
  - Role badge
  - Edit Profile link
  - Sign Out button
- Renders role‑specific content below the navigation

### 4. Internationalization
- English and Georgian translations for all registration forms
- Error messages for duplicate email registration are localized:
  - EN: “This email is already registered. Please sign in instead.”
  - KA: “ეს ელ.ფოსტა უკვე რეგისტრირებულია. გთხოვთ, შეხვიდეთ სისტემაში.”

## File Structure

```
src/app/
├── register/
│   ├── page.tsx                 # General registration (unchanged)
│   ├── mentor/
│   │   └── page.tsx             # Mentor registration page
│   └── mentee/
│       └── page.tsx             # Mentee registration page
├── login/
│   └── page.tsx                 # Sign‑in page with role‑based redirect
├── dashboard/
│   └── page.tsx                 # Unified dashboard with role‑specific UI
├── mentor/
│   └── page.tsx                 # Auto‑redirects to /mentor/mentees
└── mentee/
    └── page.tsx                 # Auto‑redirects to /mentee/clients

src/components/auth/
├── RegisterForm.tsx             # General registration form
├── MentorRegisterForm.tsx       # Mentor‑specific form
└── MenteeRegisterForm.tsx       # Mentee‑specific form
```

## Implementation Details

### Registration Flow
1. User visits `/register/mentor` or `/register/mentee`
2. Form pre‑selects the appropriate role and hides the role selector
3. User fills in required fields
4. On submission, `supabase.auth.signUp()` is called with:
   ```js
   {
     email,
     password,
     options: {
       data: {
         full_name: fullName,
         role: 'mentor' | 'mentee',
         region
       }
     }
   }
   ```
5. Success shows localized alert and redirects to `/login`
6. Duplicate email errors are caught and displayed with localized messages

### Authentication Flow
1. User signs in at `/login`
2. After Supabase auth, `getUserProfile(userId)` fetches the profile
3. Regardless of role, user is redirected to `/dashboard`
4. `/dashboard` renders:
   - `MentorDashboard` for `role: 'mentor'`
   - `MenteeDashboard` for `role: 'mentee'`
   - `CoordinatorDashboard` for `role: 'coordinator'`

### Error Handling
- Duplicate email registration shows user‑friendly localized messages
- Missing profile during login falls back to `/dashboard`
- Unrecognized roles show a generic welcome message with support contact info

## Usage

### Shareable Registration Links
- Invite mentors: `https://your-app.vercel.app/register/mentor`
- Invite mentees: `https://your-app.vercel.app/register/mentee`

### Navigation Updates
- Homepage now shows two registration CTAs:
  - “Register as Mentor” (blue)
  - “Register as Mentee” (green)
- Original “Register” link remains for general access

## Translation Keys

### Registration Forms (namespace: `auth.register`)
```js
// English
'title', 'subtitle', 'labels.fullName', 'labels.email', 'labels.password', 'labels.region',
'cta.loading', 'cta.submit', 'footer.prompt', 'footer.link', 'success',
'errors.emailExists'

// Georgian (ka.*)
'ka.title', 'ka.subtitle', 'ka.labels.fullName', 'ka.labels.email', 'ka.labels.password', 'ka.labels.region',
'ka.cta.loading', 'ka.cta.submit', 'ka.footer.prompt', 'ka.footer.link', 'ka.success',
'ka.errors.emailExists'
```

### Homepage Navigation (namespace: `home`)
```js
'nav.registerMentor', 'nav.registerMentee',
'ka.nav.registerMentor', 'ka.nav.registerMentee'
```

## Deployment Notes
- Ensure Supabase environment variables are configured in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- No additional environment variables required
- All new routes are statically generated except API routes

## Future Enhancements
- Add email verification flow before allowing role selection
- Implement role‑specific onboarding tours
- Add analytics to track registration source (mentor vs mentee links)
- Support more roles (e.g., `admin`, `moderator`) with dedicated registration flows

# URL Structure Documentation

## 🌐 Mentoring Platform URLs

**Base URL:** `https://mentoring-platform-37al.vercel.app`

---

## 🔓 **Public Access Pages** (No Authentication Required)

| URL | Description | Theme/Features |
|-----|-------------|----------------|
| `/` | Homepage/Landing page | Platform overview, registration CTAs |
| `/login` | Sign in page | Email/password authentication |
| `/register` | General registration | Role selection dropdown (mentor/mentee/coordinator) |
| `/register/mentor` | Mentor registration | Blue-themed, pre-selected mentor role |
| `/register/mentee` | Mentee registration | Green-themed, pre-selected mentee role |

---

## 🏠 **Authenticated User Pages** (All Roles)

| URL | Description | Access Level |
|-----|-------------|--------------|
| `/dashboard` | Role-specific dashboard | 🔒 All authenticated users |
| `/profile/edit` | Edit user profile | 🔒 All authenticated users |
| `/profile/[userId]` | View user profile | 🔒 All authenticated users |
| `/goals` | Goals management | 🔒 All authenticated users |
| `/goals/create` | Create new goal | 🔒 All authenticated users |
| `/messages` | Messaging center | 🔒 All authenticated users |
| `/messages/[pairingId]` | Specific conversation | 🔒 All authenticated users |
| `/resources` | Resource library | 🔒 All authenticated users |
| `/resources/upload` | Upload resources | 🔒 All authenticated users |
| `/sessions/schedule` | Schedule sessions | 🔒 All authenticated users |
| `/progress/log` | Log progress | 🔒 All authenticated users |

---

## � **Dedicated Registration URLs:**

| URL | Description | Features |
|-----|-------------|----------|
| `/mentor` | Smart dual-purpose URL | New users → Mentor registration, Authenticated mentors → Dashboard |
| `/mentee` | Smart dual-purpose URL | New users → Mentee registration, Authenticated mentees → Dashboard |

### 🔄 **Smart URL Behavior:**

#### **For `/mentor`:**
- **New users** → Redirects to `/register/mentor` (blue-themed registration)
- **After registration** → Login with `?from=mentor` parameter
- **Sign up link** → Goes back to `/register/mentor` (maintains context)
- **Logged-in mentors** → Redirects to `/mentor/mentees` (mentor dashboard)
- **Wrong role users** → Redirected to `/dashboard`

#### **For `/mentee`:**
- **New users** → Redirects to `/register/mentee` (green-themed registration)
- **After registration** → Login with `?from=mentee` parameter
- **Sign up link** → Goes back to `/register/mentee` (maintains context)
- **Logged-in mentees** → Redirects to `/mentee/clients` (mentee dashboard)
- **Wrong role users** → Redirected to `/dashboard`

### 🎯 **Distribution URLs:**
```
https://mentoring-platform-37al.vercel.app/mentor
https://mentoring-platform-37al.vercel.app/mentee
```

---

## �🎓 **Mentor Only Pages** (Requires `mentor` role)

| URL | Description | Redirect if Wrong Role |
|-----|-------------|------------------------|
| `/mentor` | Mentor hub → redirects to mentees | → `/dashboard` |
| `/mentor/mentees` | View assigned mentees | → `/dashboard` |
| `/mentor/progress` | Track mentee progress | → `/dashboard` |

### Mentor Authentication Flow:
1. Unauthenticated → `/login`
2. Authenticated but not mentor → `/dashboard`
3. Authenticated mentor → Access granted

---

## 🎯 **Mentee Only Pages** (Requires `mentee` role)

| URL | Description | Redirect if Wrong Role |
|-----|-------------|------------------------|
| `/mentee` | Mentee hub → redirects to clients | → `/dashboard` |
| `/mentee/clients` | View assigned mentors | → `/dashboard` |

### Mentee Authentication Flow:
1. Unauthenticated → `/login`
2. Authenticated but not mentee → `/dashboard`
3. Authenticated mentee → Access granted

---

## 🛡️ **Coordinator Only Pages** (Requires `coordinator` role)

| URL | Description | Redirect if Wrong Role |
|-----|-------------|------------------------|
| `/admin` | Admin navigation panel | → `/dashboard` |
| `/admin/users` | User management | → `/dashboard` |
| `/admin/reports` | Analytics and reports | → `/dashboard` |
| `/admin/settings` | Platform settings | → `/dashboard` |
| `/admin/translations` | Manage translations | → `/dashboard` |
| `/admin/pairings` | Mentor-mentee matching | → `/dashboard` |
| `/admin/pairings/create` | Create new pairing | → `/dashboard` |

### Coordinator Authentication Flow:
1. Unauthenticated → `/login`
2. Authenticated but not coordinator → `/dashboard`
3. Authenticated coordinator → Access granted

---

## 🔧 **API Endpoints**

| URL | Method | Description | Authentication |
|-----|--------|-------------|----------------|
| `/api/resources/[id]/download` | GET | Download files | 🔒 Required |
| `/auth/callback` | POST | Authentication callback | 🔒 Required |

---

## 🔄 **Redirect Logic**

### Authentication Redirects:
- **Unauthenticated users** → Redirected to `/login`
- **Wrong role access** → Redirected to `/dashboard`
- **Successful login** → Redirected to `/dashboard`

### Dashboard Role Rendering:
```javascript
switch (userProfile.role) {
  case 'mentor': return <MentorDashboard />
  case 'mentee': return <MenteeDashboard />
  case 'coordinator': return <CoordinatorDashboard />
  default: return <ErrorPage />
}
```

---

## 🎨 **Visual Design by Role**

### Mentor Pages:
- **Primary Color:** Blue theme
- **Registration:** `/register/mentor` (blue branding)
- **Dashboard:** Mentor-specific interface

### Mentee Pages:
- **Primary Color:** Green theme
- **Registration:** `/register/mentee` (green branding)
- **Dashboard:** Mentee-specific interface

### Coordinator Pages:
- **Primary Color:** Gray/Professional theme
- **Admin Panel:** Clean, administrative interface
- **Dashboard:** Coordinator-specific analytics

---

## 📱 **Responsive Design**

All pages are fully responsive:
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## 🔒 **Security Features**

### Authentication Protection:
- ✅ All protected pages redirect unauthenticated users
- ✅ Role-based access control
- ✅ Immediate redirect (no delays)
- ✅ Supabase JWT authentication

### Route Protection:
```javascript
// Example protection pattern
if (!loading && !user) {
  router.push('/login')
  return
}

if (userProfile?.role !== 'requiredRole') {
  router.push('/dashboard')
  return
}
```

---

## 🚀 **Deployment Notes**

### Environment Variables Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Build Status:
- ✅ All routes statically generated (except API)
- ✅ Optimized bundle sizes
- ✅ Fast page loads

---

## 📞 **Support URLs for Testing**

### Quick Test Links:
- **Mentor Registration:** `https://mentoring-platform-37al.vercel.app/register/mentor`
- **Mentee Registration:** `https://mentoring-platform-37al.vercel.app/register/mentee`
- **Admin Access:** `https://mentoring-platform-37al.vercel.app/admin`
- **Dashboard:** `https://mentoring-platform-37al.vercel.app/dashboard`

### Error Handling:
- **404 Errors:** Handled by Next.js `_not-found` page
- **Unauthorized:** Graceful redirects to appropriate pages
- **Role Mismatch:** User redirected to dashboard with appropriate UI

---

## 📈 **Analytics Tracking (Future)**

Recommended tracking events:
- Page visits by role
- Registration source (mentor vs mentee links)
- Feature usage by user type
- Authentication flow completion rates

---

*Last Updated: December 1, 2025*
*Version: 1.0.0*

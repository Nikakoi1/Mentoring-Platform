# Resources Storage Flow

## Environment variables
Add the following keys to `.env.local` (already committed locally):

```
NEXT_PUBLIC_SUPABASE_RESOURCES_BUCKET=resources
SUPABASE_RESOURCES_BUCKET=resources
SUPABASE_SIGNED_URL_EXPIRY_SECONDS=3600
SUPABASE_SERVICE_ROLE_KEY=<service-role secret>
```

- `NEXT_PUBLIC_SUPABASE_RESOURCES_BUCKET` is read by client components (e.g., `UploadResourceForm`) when writing to Storage.
- `SUPABASE_SERVICE_ROLE_KEY` is only used server-side to generate signed URLs in API routes.

## Upload flow
File: `src/components/forms/UploadResourceForm.tsx`

1. `resourcesBucket = process.env.NEXT_PUBLIC_SUPABASE_RESOURCES_BUCKET ?? 'resources'` chooses the private bucket.
2. Uploads use `supabase.storage.from(resourcesBucket).upload(filePath, file)`.
3. We persist metadata (title, description, `resource_type`, etc.) plus:
   - `file_path` (Storage object path)
   - `file_name`, `file_size`, `mime_type`
4. No public URLs are created anymore—the API route handles download access.

## Download flow
File: `src/app/api/resources/[id]/download/route.ts`

1. Uses `createRouteHandlerClient` to identify the current user via cookies.
2. Fetches the resource record with related pairing info.
3. Ensures the requester is either the uploader, the mentor, or the mentee in that pairing.
4. Calls `supabaseAdmin.storage.from(bucket).createSignedUrl(file_path, expiry)` using the service-role key.
5. Redirects the browser to the signed URL so the file downloads directly from Supabase Storage.

Frontend components should link to `/api/resources/{resourceId}/download` instead of `resource.file_url`.

### Auth cookie propagation (Nov 2025 update)

During local QA we saw mentees getting `{ "error": "Unauthorized" }` when calling the download API despite having an active pairing. Root cause: the API route never received Supabase session cookies because we were missing the standard Next.js helper wiring. The remediation involved three changes:

1. **Middleware bootstrap** – `middleware.ts` now instantiates `createMiddlewareClient` for every request so server components can read cookies.
2. **Client -> server sync** – `AuthContext` posts auth state changes to `/auth/callback` whenever Supabase fires `onAuthStateChange`.
3. **Auth callback route** – `src/app/auth/callback/route.ts` saves (or clears) the session via `createRouteHandlerClient` so route handlers like the download endpoint get a populated `user`.

Test matrix (manual):

- Mentor uploads -> mentor downloads ✅
- Mentor uploads -> mentee downloads (same pairing) ✅
- Mentee uploads -> mentor downloads ✅
- Non-paired user download attempt → `403 Forbidden` ✅

## Supabase admin client
File: `src/lib/supabase/admin.ts`

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

Used only on the server to sign URLs or perform privileged operations.

## Remaining tasks
- Update UI download buttons (e.g., `ResourcesList`) to call `/api/resources/[id]/download`. ✅
- Add Storage policies allowing only pairing participants to access objects within the `resources` bucket.

### Storage RLS policies (run in Supabase SQL editor)

```sql
-- Replace `public.resources` references if your schema differs
-- 1. Read access (mentor/mentee + uploader)
create policy "resources readable by pairing participants" on storage.objects
for select using (
  bucket_id = 'resources'
  and exists (
    select 1
    from public.resources r
    join public.pairings p on p.id = r.pairing_id
    where r.file_path = storage.filename(objects.bucket_id, objects.name)
      and (
        auth.uid() = r.uploaded_by or
        auth.uid() = p.mentor_id or
        auth.uid() = p.mentee_id
      )
  )
);

-- 2. Write access (uploader only)
create policy "resources writable by uploader" on storage.objects
for insert with check (
  bucket_id = 'resources'
  and auth.uid() = (new.metadata->>'uploaded_by')::uuid
);

-- 3. Optional: allow deleting own uploads
create policy "resources deletable by uploader" on storage.objects
for delete using (
  bucket_id = 'resources'
  and exists (
    select 1 from public.resources r
    where r.file_path = storage.filename(objects.bucket_id, objects.name)
      and r.uploaded_by = auth.uid()
  )
);
```

> Notes:
> - Ensure every insert into `public.resources` keeps `file_path` in sync with the Storage object path.
> - The `metadata` JSON used in the insert policy can be set from the client or via edge functions; alternatively, insert via server-side code where you can enforce the uploader ID.

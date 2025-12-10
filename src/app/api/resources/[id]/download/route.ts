import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

const RESOURCES_BUCKET = process.env.SUPABASE_RESOURCES_BUCKET ?? 'resources'
const SIGNED_URL_EXPIRY_SECONDS = Number(process.env.SUPABASE_SIGNED_URL_EXPIRY_SECONDS ?? '3600')

type PairingSummary = { mentor_id: string | null; mentee_id: string | null }

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: resource, error: resourceError } = await supabase
    .from('resources')
    .select(
      `id, file_path, file_name, uploaded_by, pairing:pairing_id(mentor_id, mentee_id)`
    )
    .eq('id', id)
    .maybeSingle()

  if (resourceError) {
    return NextResponse.json({ error: resourceError.message }, { status: 500 })
  }

  const relation = resource?.pairing as PairingSummary | PairingSummary[] | null | undefined
  const pairing = Array.isArray(relation) ? relation[0] : relation

  if (!resource?.file_path || !pairing) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  const canAccess =
    resource.uploaded_by === user.id ||
    pairing.mentor_id === user.id ||
    pairing.mentee_id === user.id

  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Import supabaseAdmin only when needed to avoid build-time env var requirements
  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from(RESOURCES_BUCKET)
    .createSignedUrl(resource.file_path, SIGNED_URL_EXPIRY_SECONDS)

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: signedError?.message ?? 'Unable to generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}

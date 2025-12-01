import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Database } from '@/lib/types/database'

const RESOURCES_BUCKET = process.env.SUPABASE_RESOURCES_BUCKET ?? 'resources'
const SIGNED_URL_EXPIRY_SECONDS = Number(process.env.SUPABASE_SIGNED_URL_EXPIRY_SECONDS ?? '3600')

type PairingSummary = { mentor_id: string; mentee_id: string }

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

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
    .eq('id', params.id)
    .maybeSingle()

  if (resourceError) {
    return NextResponse.json({ error: resourceError.message }, { status: 500 })
  }

  const pairing = resource?.pairing as PairingSummary | null

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

  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from(RESOURCES_BUCKET)
    .createSignedUrl(resource.file_path, SIGNED_URL_EXPIRY_SECONDS)

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: signedError?.message ?? 'Unable to generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}

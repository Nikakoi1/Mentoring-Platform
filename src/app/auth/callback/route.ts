import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { event, session } = await request.json()

    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    } else if (session) {
      await supabase.auth.setSession(session)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to handle auth callback', error)
    return NextResponse.json({ error: 'Auth callback failed' }, { status: 400 })
  }
}

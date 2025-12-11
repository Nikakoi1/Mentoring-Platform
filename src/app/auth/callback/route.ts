import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    let event: string | null = null
    let session: any = null

    // Try to parse as JSON first
    try {
      const body = await request.json()
      event = body.event
      session = body.session
    } catch {
      // If JSON fails, try to parse as form data
      try {
        const formData = await request.formData()
        event = formData.get('event') as string
        const sessionData = formData.get('session') as string
        if (sessionData) {
          session = JSON.parse(sessionData)
        }
      } catch {
        // If both fail, return success to avoid breaking auth flow
        return NextResponse.json({ success: true })
      }
    }

    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    } else if (session) {
      await supabase.auth.setSession(session)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth callback error:', error)
    // Return success instead of 400 to avoid breaking auth flow
    return NextResponse.json({ success: true })
  }
}

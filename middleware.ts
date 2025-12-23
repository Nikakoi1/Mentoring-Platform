import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    await supabase.auth.getSession()
  } catch (error) {
    console.error('Supabase middleware auth error', error)
    // Clear cookies on refresh token errors to prevent infinite loops
    const message = (error as Error)?.message ?? ''
    if (message.includes('Invalid Refresh Token') || message.includes('refresh_token_not_found')) {
      // Clear all auth cookies
      res.cookies.getAll().forEach(cookie => {
        if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
          res.cookies.delete(cookie.name)
        }
      })
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const roleFromUrl = searchParams.get('role')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Role synchronization logic
      if (roleFromUrl) {
        await supabase.auth.updateUser({
          data: { role: roleFromUrl }
        })
      }

      // REDIRECT LOGIC FIX:
      // In local dev, 'origin' will be http://localhost:3000.
      // We check for x-forwarded-host only if we aren't on localhost.
      const forwardedHost = request.headers.get('x-forwarded-host')
      
      // If we are on localhost, just stay on localhost.
      if (origin.includes('localhost')) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // If we are in production and have a forwarded host, use it.
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }

      // Fallback to origin
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
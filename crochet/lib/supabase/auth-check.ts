import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the current session in admin API routes.
 * Returns the user on success, or a 401 NextResponse on failure.
 *
 * Usage in API routes:
 *   const { user, response } = await requireAdminAuth()
 *   if (response) return response
 */
export async function requireAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, response: null }
}

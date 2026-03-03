import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the service role key.
 * This bypasses Row Level Security — ONLY use in server-side API routes.
 * NEVER import this in client components or expose to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

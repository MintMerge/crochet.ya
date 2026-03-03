import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/supabase/auth-check'
import type { SiteSettings } from '@/types'

// GET /api/admin/settings
export async function GET() {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('site_settings').select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Convert rows to a flat object
  const settings = (data ?? []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {})

  return NextResponse.json({ settings })
}

// PUT /api/admin/settings
export async function PUT(request: NextRequest) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const schema = z.object({
    shop_name: z.string(),
    shop_tagline: z.string(),
    contact_phone: z.string(),
    contact_email: z.string(),
    instagram_handle: z.string(),
    announcement_banner: z.string(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 })
  }

  const supabase = createAdminClient()
  const rows = Object.entries(parsed.data).map(([key, value]) => ({ key, value }))

  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ settings: parsed.data as SiteSettings })
}

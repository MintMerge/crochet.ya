import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/supabase/auth-check'

const categorySchema = z.object({
  slug: z.string(),
  name: z.string().min(1, 'Name required'),
  description: z.string(),
  image: z.string(),
  emoji: z.string(),
  sort_order: z.number(),
})

// GET /api/admin/categories
export async function GET() {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data })
}

// PUT /api/admin/categories — upsert all categories
export async function PUT(request: NextRequest) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const schema = z.object({ categories: z.array(categorySchema) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.errors }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .upsert(parsed.data.categories, { onConflict: 'slug' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data })
}

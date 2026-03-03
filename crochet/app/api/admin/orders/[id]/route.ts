import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth } from '@/lib/supabase/auth-check'
import type { AdminOrder } from '@/types'

function mapRow(row: Record<string, unknown>): AdminOrder {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    email: row.email as string | undefined,
    address: row.address as string,
    city: row.city as string,
    pincode: row.pincode as string,
    notes: row.notes as string | undefined,
    items: row.items as AdminOrder['items'],
    totalAmount: row.total_amount as number,
    status: row.status as AdminOrder['status'],
    orderDate: row.order_date as string,
    updatedAt: row.updated_at as string,
  }
}

const ORDER_STATUSES = ['pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled'] as const

// GET /api/admin/orders/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()

  if (error) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ order: mapRow(data) })
}

// PATCH /api/admin/orders/[id] — update status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const schema = z.object({ status: z.enum(ORDER_STATUSES) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status', details: parsed.error.errors }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order: mapRow(data) })
}

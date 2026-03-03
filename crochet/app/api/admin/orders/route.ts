import { NextRequest, NextResponse } from 'next/server'
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

// GET /api/admin/orders — list orders with filters
export async function GET(request: NextRequest) {
  const { response: authError } = await requireAdminAuth()
  if (authError) return authError

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const q = searchParams.get('q')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = 20

  const supabase = createAdminClient()
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('order_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (q) {
    query = query.or(`customer_name.ilike.%${q}%,phone.ilike.%${q}%,id.ilike.%${q}%`)
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    orders: (data ?? []).map(mapRow),
    total: count ?? 0,
    page,
    pageSize,
  })
}

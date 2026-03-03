import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { orderFormSchema } from '@/lib/validations/order'
import { sendTelegramMessage } from '@/lib/external/telegram'
import { formatOrderForTelegram, generateOrderId } from '@/lib/format'
import { createAdminClient } from '@/lib/supabase/admin'

const orderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable(),
        quantity: z.number().positive(),
        price: z.number().positive(),
        name: z.string(),
        image: z.string(),
        variantName: z.string().nullable(),
      })
    )
    .min(1, 'Cart cannot be empty'),
  customer: orderFormSchema,
  totalAmount: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = orderRequestSchema.parse(body)

    const orderId = generateOrderId()

    // Persist order to Supabase (best-effort — don't block on failure)
    try {
      const supabase = createAdminClient()
      const { error: dbError } = await supabase.from('orders').insert({
        id: orderId,
        customer_name: validated.customer.customerName,
        phone: validated.customer.phone,
        email: validated.customer.email ?? null,
        address: validated.customer.address,
        city: validated.customer.city,
        pincode: validated.customer.pincode,
        notes: validated.customer.notes ?? null,
        items: validated.items,
        total_amount: validated.totalAmount,
        status: 'pending',
        order_date: new Date().toISOString(),
      })
      if (dbError) console.error('Order DB insert failed:', dbError)
    } catch (err) {
      console.error('Order DB error:', err)
    }

    const message = formatOrderForTelegram(
      {
        items: validated.items,
        customer: validated.customer,
        totalAmount: validated.totalAmount,
        orderDate: new Date().toISOString(),
      },
      orderId
    )

    const chatId = process.env.TELEGRAM_CHAT_ID
    if (!chatId) {
      console.error('TELEGRAM_CHAT_ID not configured')
      return NextResponse.json(
        { error: 'Order notification service not configured' },
        { status: 500 }
      )
    }

    const sent = await sendTelegramMessage(chatId, message)

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send order notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid order data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Order API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

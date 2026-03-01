import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { orderFormSchema } from '@/lib/validations/order'
import { sendTelegramMessage } from '@/lib/external/telegram'
import { formatOrderForTelegram, generateOrderId } from '@/lib/format'

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

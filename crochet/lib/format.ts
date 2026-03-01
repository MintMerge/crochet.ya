import type { Order } from '@/types'

export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `Rs. ${amount.toLocaleString('en-IN')}`
  }
  return `$${amount.toFixed(2)}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '...'
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CY-${timestamp}-${random}`
}

export function formatOrderForTelegram(order: Order, orderId: string): string {
  const itemLines = order.items
    .map((item) => {
      const variant = item.variantName ? ` (${item.variantName})` : ''
      return `- ${item.name}${variant} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`
    })
    .join('\n')

  const orderDate = new Date(order.orderDate).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return `🧶 <b>NEW ORDER — Crochet Ya</b>

📋 Order: <b>${orderId}</b>

👤 Name: ${order.customer.customerName}
📞 Phone: ${order.customer.phone}
${order.customer.email ? `📧 Email: ${order.customer.email}\n` : ''}📍 Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}

🛒 <b>Order Items:</b>
${itemLines}

💰 <b>Total: Rs. ${order.totalAmount.toLocaleString('en-IN')}</b>
${order.customer.notes ? `\n📝 Notes: ${order.customer.notes}` : ''}
🕐 Ordered at: ${orderDate}`
}

import type { CartItem } from './cart'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface AdminOrder {
  id: string
  customerName: string
  phone: string
  email?: string
  address: string
  city: string
  pincode: string
  notes?: string
  items: CartItem[]
  totalAmount: number
  status: OrderStatus
  orderDate: string
  updatedAt: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalProducts: number
  newOrdersToday: number
}

export interface SiteSettings {
  shop_name: string
  shop_tagline: string
  contact_phone: string
  contact_email: string
  instagram_handle: string
  announcement_banner: string
}

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

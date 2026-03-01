export interface CartItem {
  productId: string
  variantId: string | null
  quantity: number
  price: number
  name: string
  image: string
  variantName: string | null
}

export interface OrderFormData {
  customerName: string
  phone: string
  email?: string
  address: string
  city: string
  pincode: string
  notes?: string
}

export interface Order {
  items: CartItem[]
  customer: OrderFormData
  totalAmount: number
  orderDate: string
}

import { z } from 'zod'

export const orderFormSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(10, 'Please enter your full address'),
  city: z
    .string()
    .min(2, 'City is required'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  notes: z
    .string()
    .max(500, 'Notes must be under 500 characters')
    .optional()
    .or(z.literal('')),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

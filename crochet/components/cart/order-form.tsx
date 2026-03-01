'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { orderFormSchema, type OrderFormValues } from '@/lib/validations/order'

interface OrderFormProps {
  onSubmit: (data: OrderFormValues) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

export function OrderForm({ onSubmit, isSubmitting, error }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      pincode: '',
      notes: '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border-2 border-border bg-card p-6 shadow-hard-sm space-y-5"
    >
      <h3 className="font-heading text-lg font-bold">Delivery Details</h3>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="customerName" className="text-xs font-semibold uppercase tracking-wide">
          Full Name *
        </Label>
        <Input
          id="customerName"
          placeholder="Your full name"
          {...register('customerName')}
          className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary"
        />
        {errors.customerName && (
          <p className="text-xs text-destructive">{errors.customerName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide">
          Phone Number *
        </Label>
        <Input
          id="phone"
          placeholder="10-digit mobile number"
          {...register('phone')}
          className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary"
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide">
          Email (optional)
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wide">
          Delivery Address *
        </Label>
        <Textarea
          id="address"
          placeholder="House no, street, area, landmark"
          {...register('address')}
          className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary resize-none"
          rows={3}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address.message}</p>
        )}
      </div>

      {/* City + Pincode */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wide">
            City *
          </Label>
          <Input
            id="city"
            placeholder="City"
            {...register('city')}
            className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary"
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pincode" className="text-xs font-semibold uppercase tracking-wide">
            Pincode *
          </Label>
          <Input
            id="pincode"
            placeholder="6-digit pincode"
            {...register('pincode')}
            className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary"
          />
          {errors.pincode && (
            <p className="text-xs text-destructive">{errors.pincode.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide">
          Special Notes (optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or customization notes"
          {...register('notes')}
          className="border-2 rounded-lg focus:shadow-hard-sm focus:border-primary resize-none"
          rows={2}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="playful"
        size="lg"
        className="w-full gap-2 text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" strokeWidth={2.5} />
            Place Order
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your order will be sent to us via Telegram. We&apos;ll contact you to
        confirm the order and arrange payment.
      </p>
    </form>
  )
}

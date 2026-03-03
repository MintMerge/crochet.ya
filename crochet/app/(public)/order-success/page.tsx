'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <PageContainer className="py-20">
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-8"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-quaternary/20 border-2 border-quaternary">
            <CheckCircle className="h-12 w-12 text-quaternary" strokeWidth={2} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Order Placed!
          </h1>

          {orderId && (
            <div className="inline-block rounded-full bg-muted border-2 border-border px-4 py-2 mb-6">
              <span className="text-sm text-muted-foreground">Order ID: </span>
              <span className="font-mono font-semibold">{orderId}</span>
            </div>
          )}

          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            We&apos;ve received your order and notified the maker! They&apos;ll
            reach out to you shortly to confirm the details and arrange payment.
          </p>

          <div className="rounded-2xl bg-muted/50 border-2 border-border p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-primary mt-0.5" strokeWidth={2.5} />
              <div>
                <h3 className="font-heading font-semibold mb-1">
                  What happens next?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>1. We review your order details</li>
                  <li>2. We contact you via phone to confirm</li>
                  <li>3. Payment is arranged directly</li>
                  <li>4. Your handmade goodies are on their way!</li>
                </ul>
              </div>
            </div>
          </div>

          <Button asChild variant="playful" size="lg" className="gap-2">
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </PageContainer>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-secondary/20">
      {/* Decorative shapes */}
      <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-tertiary/20 blur-sm" />
      <div className="absolute bottom-20 left-10 h-24 w-24 rounded-full bg-primary/15 blur-sm" />
      <div className="absolute top-1/2 right-1/4 h-16 w-16 rounded-full bg-quaternary/20 blur-sm" />
      <div className="absolute bottom-10 right-1/3 h-20 w-20 rotate-45 rounded-lg bg-tertiary/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">🧶</span>
              <span className="text-sm font-medium text-primary uppercase tracking-widest">
                Handcrafted with love
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Every Stitch{' '}
              <span className="text-primary">Tells a Story</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            Discover one-of-a-kind crochet creations — from adorable amigurumi
            friends to cozy accessories. Made by hand, made for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild variant="playful" size="lg" className="gap-2 text-base px-8">
              <Link href="/products">
                Browse Collection
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </Link>
            </Button>
            <Button asChild variant="outline-playful" size="lg" className="gap-2 text-base px-8">
              <Link href="/products#amigurumi">
                <Sparkles className="h-5 w-5" strokeWidth={2.5} />
                New Arrivals
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

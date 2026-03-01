'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getCategoriesWithCount } from '@/lib/data'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

export function CategoryGrid() {
  const categories = getCategoriesWithCount()

  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
          Shop by Category
        </h2>
        <p className="text-muted-foreground text-lg">
          Find exactly what you&apos;re looking for
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
      >
        {categories.map((cat) => (
          <motion.div key={cat.slug} variants={itemVariants}>
            <Link
              href={`/products#${cat.slug}`}
              className="group relative block overflow-hidden rounded-2xl border-2 border-border aspect-[4/3] shadow-hard-sm transition-all hover:shadow-hard hover:-translate-y-1"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-2xl mb-1 block">{cat.emoji}</span>
                <h3 className="font-heading font-bold text-white text-lg">
                  {cat.name}
                </h3>
                <p className="text-white/80 text-sm">
                  {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

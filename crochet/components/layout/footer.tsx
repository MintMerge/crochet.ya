import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/cart', label: 'Cart' },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-border bg-muted/50">
      {/* Wavy top decoration */}
      <div className="h-2 bg-gradient-to-r from-primary/30 via-tertiary/30 to-quaternary/30" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧶</span>
              <span className="font-heading text-xl font-bold">Crochet Ya</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Handmade with love, one stitch at a time. Each piece is uniquely
              crafted to bring warmth and joy to your everyday life.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-3">Get in Touch</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Have questions or want a custom order? Reach out to us on Telegram
              or Instagram. We love hearing from you!
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 fill-primary text-primary" /> by
            Crochet Ya
          </p>
          <p>&copy; {new Date().getFullYear()} Crochet Ya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Heart, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore, useWishlistStore } from '@/lib/stores'
import { useMounted } from '@/hooks/use-mounted'
import { cn } from '@/lib/utils'
import { MobileNav } from './mobile-nav'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/wishlist', label: 'Wishlist' },
]

export function Navbar() {
  const pathname = usePathname()
  const mounted = useMounted()
  const itemCount = useCartStore((state) => state.getItemCount)
  const wishlistCount = useWishlistStore((state) => state.getCount)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧶</span>
          <span className="font-heading text-xl font-bold text-foreground">
            Crochet Ya
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-medium transition-colors hover:text-primary',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Wishlist"
          >
            <Heart
              className={cn(
                'h-5 w-5',
                pathname === '/wishlist' ? 'fill-primary text-primary' : ''
              )}
              strokeWidth={2.5}
            />
            {mounted && wishlistCount() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background">
                {wishlistCount()}
              </Badge>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
            {mounted && itemCount() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-2 border-background">
                {itemCount()}
              </Badge>
            )}
          </Link>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </nav>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  )
}

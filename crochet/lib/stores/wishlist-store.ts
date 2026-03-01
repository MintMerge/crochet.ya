import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistState {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  getCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        if (!get().items.includes(productId)) {
          set({ items: [...get().items, productId] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((id) => id !== productId) })
      },

      toggleItem: (productId) => {
        if (get().items.includes(productId)) {
          get().removeItem(productId)
        } else {
          get().addItem(productId)
        }
      },

      isWishlisted: (productId) => get().items.includes(productId),

      getCount: () => get().items.length,
    }),
    {
      name: 'crochet-ya-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

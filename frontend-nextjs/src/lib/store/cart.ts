/**
 * Zustand Cart Store
 * Client-side cart state management with API synchronization
 */

import { create } from 'zustand';
import type { Cart, CartLineItem } from '../types/cart';

interface CartState {
  // Cart data
  items: CartLineItem[];
  subtotal: number;
  currency: string;

  // UI state
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;

  // Actions
  setCart: (cart: Cart) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  // Initial state
  items: [],
  subtotal: 0,
  currency: 'USD',
  isLoading: false,
  error: null,
  isCartOpen: false,

  // Update cart from API response
  setCart: (cart: Cart) =>
    set({
      items: cart.items,
      subtotal: cart.subtotal,
      currency: cart.currency,
      error: null,
    }),

  // Loading state
  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  // Error state
  setError: (error: string | null) =>
    set({ error, isLoading: false }),

  // Cart drawer visibility
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  // Clear cart
  clearCart: () =>
    set({
      items: [],
      subtotal: 0,
      currency: 'USD',
      error: null,
    }),
}));

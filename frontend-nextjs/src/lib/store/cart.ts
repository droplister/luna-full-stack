/**
 * Zustand Cart Store
 * Client-side cart state management with API synchronization
 */

import { create } from 'zustand';
import type { Cart, CartLineItem } from '../types/cart';

/**
 * Cart Store State Interface
 * Exported for testing and type inference
 */
export interface CartState {
  // Cart data
  items: CartLineItem[];
  subtotal: number;
  currency: string;

  // UI state
  isLoading: boolean; // Global loading (for initial fetch)
  loadingItems: Set<string>; // Per-item loading states (line_id)
  error: string | null;
  isCartOpen: boolean;

  // Optimistic update rollback
  previousState: Cart | null;

  // Actions
  setCart: (cart: Cart) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearCart: () => void;

  // Per-item loading management
  addLoadingItem: (lineId: string) => void;
  removeLoadingItem: (lineId: string) => void;
  isItemLoading: (lineId: string) => boolean;

  // Optimistic update helpers
  snapshotState: () => void;
  rollbackState: () => void;
  clearSnapshot: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  // Initial state
  items: [],
  subtotal: 0,
  currency: 'USD',
  isLoading: false,
  loadingItems: new Set<string>(),
  error: null,
  isCartOpen: false,
  previousState: null,

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
      loadingItems: new Set<string>(),
      previousState: null,
    }),

  // Per-item loading management
  addLoadingItem: (lineId: string) =>
    set((state) => {
      const newLoadingItems = new Set(state.loadingItems);
      newLoadingItems.add(lineId);
      return { loadingItems: newLoadingItems };
    }),

  removeLoadingItem: (lineId: string) =>
    set((state) => {
      const newLoadingItems = new Set(state.loadingItems);
      newLoadingItems.delete(lineId);
      return { loadingItems: newLoadingItems };
    }),

  isItemLoading: (lineId: string) => {
    return get().loadingItems.has(lineId);
  },

  // Optimistic update helpers
  snapshotState: () =>
    set((state) => ({
      previousState: {
        items: state.items,
        subtotal: state.subtotal,
        currency: state.currency,
      },
    })),

  rollbackState: () =>
    set((state) => {
      if (!state.previousState) return {};
      return {
        items: state.previousState.items,
        subtotal: state.previousState.subtotal,
        currency: state.previousState.currency,
        previousState: null,
      };
    }),

  clearSnapshot: () =>
    set({ previousState: null }),
}));

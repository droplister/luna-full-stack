/**
 * Zustand Cart Store
 * Client-side cart state management with API synchronization
 */

import { create } from 'zustand';
import type { Cart, CartLineItem } from '../types/cart';

/**
 * Snapshot of cart state for rollback (includes version)
 */
interface CartSnapshot {
  items: CartLineItem[];
  subtotal: number;
  currency: string;
  stateVersion: number;
}

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
  previousState: CartSnapshot | null;

  // Version tracking for optimistic updates
  stateVersion: number; // Increments on each optimistic update to prevent stale server responses

  // Actions
  setCart: (cart: Cart) => void;
  setCartIfCurrent: (cart: Cart, expectedVersion: number) => boolean;
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
  stateVersion: 0,

  // Update cart from API response (increments version for optimistic updates)
  setCart: (cart: Cart) =>
    set((state) => ({
      items: cart.items,
      subtotal: cart.subtotal,
      currency: cart.currency,
      error: null,
      stateVersion: state.stateVersion + 1,
    })),

  // Update cart only if version matches (prevents stale server responses from regressing state)
  // Returns true if update was applied, false if ignored (stale)
  setCartIfCurrent: (cart: Cart, expectedVersion: number) => {
    let wasApplied = false;

    set((state) => {
      // If state has been updated since this request was made, ignore this response
      if (state.stateVersion !== expectedVersion) {
        console.debug(
          `[Cart] Ignoring stale server response (expected v${expectedVersion}, current v${state.stateVersion})`
        );
        wasApplied = false;
        return {};
      }

      wasApplied = true;
      return {
        items: cart.items,
        subtotal: cart.subtotal,
        currency: cart.currency,
        error: null,
      };
    });

    return wasApplied;
  },

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
      stateVersion: 0,
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
        stateVersion: state.stateVersion,
      },
    })),

  rollbackState: () =>
    set((state) => {
      if (!state.previousState) return {};
      return {
        items: state.previousState.items,
        subtotal: state.previousState.subtotal,
        currency: state.previousState.currency,
        stateVersion: state.previousState.stateVersion,
        previousState: null,
      };
    }),

  clearSnapshot: () =>
    set({ previousState: null }),
}));

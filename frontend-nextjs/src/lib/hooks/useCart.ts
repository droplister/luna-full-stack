/**
 * useCart Hook
 * Provides cart operations with API integration and optimistic updates
 */

'use client';

import { useEffect, useCallback, useRef, useMemo, startTransition } from 'react';
import { useCartStore } from '../store/cart';
import type { Product } from '../types/products';
import type { Cart, CartLineItem } from '../types/cart';
import { toast } from 'react-hot-toast';
import { createDebouncedMap } from '../utils/debounce';
import { cartConfig } from '../config/cart';
import md5 from 'md5';

/**
 * Generate line_id using MD5 hash (matches backend implementation)
 * Backend uses: md5((string)$productId)
 */
function generateLineId(productId: number): string {
  return md5(String(productId));
}

/**
 * Return type for useCart hook
 */
export interface UseCartReturn {
  // Cart data
  items: CartLineItem[];
  subtotal: number;
  currency: string;
  itemCount: number;

  // UI state
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  incrementItem: (lineId: string) => Promise<void>;
  decrementItem: (lineId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Per-item loading state
  isItemLoading: (lineId: string) => boolean;
}

export function useCart(): UseCartReturn {
  const {
    items,
    subtotal,
    currency,
    isLoading,
    error,
    isCartOpen,
    stateVersion,
    setCart,
    setCartIfCurrent,
    setLoading,
    setError,
    openCart,
    closeCart,
    toggleCart,
    addLoadingItem,
    removeLoadingItem,
    isItemLoading,
    snapshotState,
    rollbackState,
    clearSnapshot,
  } = useCartStore();

  /**
   * Fetch cart from API
   */
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cart', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const cart: Cart = await response.json();
      setCart(cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [setCart, setLoading, setError]);

  /**
   * Update quantity optimistically (immediate UI update, no API call)
   */
  const updateQuantityImmediate = useCallback((lineId: string, quantity: number) => {
    const updatedItems = items.map((i) =>
      i.line_id === lineId
        ? { ...i, quantity, line_total: i.price * quantity }
        : i
    );

    const newSubtotal = updatedItems.reduce(
      (sum, i) => sum + i.line_total,
      0
    );

    setCart({
      items: updatedItems,
      subtotal: newSubtotal,
      currency,
    });
  }, [items, currency, setCart]);

  /**
   * Update quantity via API (debounced, with loading state and rollback)
   */
  const updateQuantityAPI = useCallback(async (lineId: string, quantity: number) => {
    // Capture current version (for race condition prevention)
    const expectedVersion = useCartStore.getState().stateVersion; // Get fresh version from store

    try {
      // Mark item as loading
      addLoadingItem(lineId);

      // Call API
      const response = await fetch(`/api/cart/${lineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update quantity');
      }

      const cart: Cart = await response.json();

      // Update with server response only if state hasn't changed (prevents race conditions)
      const wasApplied = setCartIfCurrent(cart, expectedVersion);

      if (wasApplied) {
        // Response was applied successfully
        startTransition(() => {
          clearSnapshot();
        });
      } else {
        // Response was stale and ignored - a newer response already updated the state
        // Don't rollback or show error - this is expected behavior
        console.debug('[Cart] Stale updateQuantity response ignored - newer state already applied');
      }
    } catch (err) {
      // Only rollback and show error for actual failures (network errors, server errors)
      rollbackState();
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      // Remove loading state
      removeLoadingItem(lineId);
    }
  }, [setCartIfCurrent, setError, rollbackState, clearSnapshot, addLoadingItem, removeLoadingItem]);

  /**
   * Create debounced API update function per cart item
   */
  const debouncedAPIUpdates = useMemo(
    () => createDebouncedMap(
      (lineId: string, quantity: number) => {
        updateQuantityAPI(lineId, quantity);
      },
      cartConfig.ux.quantityDebounceMs
    ),
    [updateQuantityAPI]
  );

  /**
   * Cleanup debounced functions on unmount
   */
  useEffect(() => {
    return () => {
      debouncedAPIUpdates.cancelAll();
    };
  }, [debouncedAPIUpdates]);

  /**
   * Add product to cart with optimistic updates
   * Opens drawer immediately for instant feedback (unless openDrawer is false)
   */
  const addItem = useCallback(
    async (product: Product, quantity: number = 1, openDrawer: boolean = true) => {
      // Generate line_id to match backend
      const lineId = generateLineId(product.id);

      // Check if item already exists
      const existingItem = items.find((i) => i.line_id === lineId);

      // Snapshot state before optimistic update
      snapshotState();

      // Create optimistic cart item
      const priceInCents = Math.round(product.price * 100);
      const optimisticItem: CartLineItem = {
        line_id: lineId,
        product_id: product.id,
        title: product.title,
        price: priceInCents,
        quantity: existingItem ? existingItem.quantity + quantity : quantity,
        stock: product.stock,
        image: product.thumbnail,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        line_total: priceInCents * (existingItem ? existingItem.quantity + quantity : quantity),
      };

      // Optimistic UI update
      const updatedItems = existingItem
        ? items.map((i) => (i.line_id === lineId ? optimisticItem : i))
        : [...items, optimisticItem];

      const newSubtotal = updatedItems.reduce((sum, i) => sum + i.line_total, 0);

      setCart({
        items: updatedItems,
        subtotal: newSubtotal,
        currency,
      });

      // Capture version after optimistic update (for race condition prevention)
      const expectedVersion = useCartStore.getState().stateVersion; // Get fresh version from store

      // Open drawer immediately (optimistic) - only if openDrawer is true
      if (openDrawer) {
        openCart();
      }

      // Background API call
      try {
        addLoadingItem(lineId);
        setError(null);

        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product, quantity }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to add item to cart');
        }

        const cart: Cart = await response.json();

        // Update with server response only if state hasn't changed (prevents race conditions)
        startTransition(() => {
        const wasApplied = setCartIfCurrent(cart, expectedVersion);

        if (wasApplied) {
          // Response was applied successfully
          startTransition(() => {
            clearSnapshot();
          });
        } else {
          // Response was stale and ignored - a newer response already updated the state
          // Don't rollback or show error - this is expected behavior
          console.debug('[Cart] Stale addItem response ignored - newer state already applied');
        }
      } catch (err) {
        // Only rollback and show error for actual failures (network errors, server errors)
        rollbackState();
        const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        removeLoadingItem(lineId);
      }
    },
    [items, currency, setCart, setCartIfCurrent, setError, openCart, snapshotState, rollbackState, clearSnapshot, addLoadingItem, removeLoadingItem]
  );

  /**
   * Update cart item quantity with debounced API calls
   * (Public API - can be called directly from dropdown selects)
   */
  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      // Find the item to validate
      const item = items.find((i) => i.line_id === lineId);
      if (!item) {
        toast.error('Item not found in cart');
        return;
      }

      // Validate stock limit
      if (quantity > item.stock) {
        toast.error(`Only ${item.stock} available`);
        return;
      }

      // Validate minimum quantity
      if (quantity < 0) {
        return;
      }

      // Snapshot state before first update (if not already loading)
      if (!isItemLoading(lineId)) {
        snapshotState();
      }

      // 1. Immediate UI update
      updateQuantityImmediate(lineId, quantity);

      // 2. Debounced API call
      const debouncedUpdate = debouncedAPIUpdates.get(lineId);
      debouncedUpdate(quantity);
    },
    [items, isItemLoading, snapshotState, updateQuantityImmediate, debouncedAPIUpdates]
  );

  /**
   * Remove item from cart with optimistic updates
   */
  const removeItem = useCallback(
    async (lineId: string) => {
      // Cancel any pending quantity updates for this item
      debouncedAPIUpdates.cancel(lineId);

      // Snapshot state before optimistic update
      snapshotState();

      // Optimistic UI update - remove item immediately
      const updatedItems = items.filter((i) => i.line_id !== lineId);
      const newSubtotal = updatedItems.reduce((sum, i) => sum + i.line_total, 0);

      setCart({
        items: updatedItems,
        subtotal: newSubtotal,
        currency,
      });

      // Capture version after optimistic update (for race condition prevention)
      const expectedVersion = useCartStore.getState().stateVersion; // Get fresh version from store

      // Background API call
      try {
        addLoadingItem(lineId);
        setError(null);

        const response = await fetch(`/api/cart/${lineId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to remove item');
        }

        const cart: Cart = await response.json();

        // Update with server response only if state hasn't changed (prevents race conditions)
        const wasApplied = setCartIfCurrent(cart, expectedVersion);

        if (wasApplied) {
          // Response was applied successfully
          startTransition(() => {
            clearSnapshot();
          });
        } else {
          // Response was stale and ignored - a newer response already updated the state
          // Don't rollback or show error - this is expected behavior
          console.debug('[Cart] Stale removeItem response ignored - newer state already applied');
        }
      } catch (err) {
        // Only rollback and show error for actual failures (network errors, server errors)
        rollbackState();
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        removeLoadingItem(lineId);
      }
    },
    [items, currency, setCart, setCartIfCurrent, setError, snapshotState, rollbackState, clearSnapshot, addLoadingItem, removeLoadingItem, debouncedAPIUpdates]
  );

  /**
   * Increment item quantity with stock validation
   */
  const incrementItem = useCallback(
    async (lineId: string) => {
      const item = items.find((i) => i.line_id === lineId);
      if (!item) return;

      // Check stock limit before incrementing
      if (item.quantity >= item.stock) {
        toast.error('Maximum stock reached');
        return;
      }

      await updateQuantity(lineId, item.quantity + 1);
    },
    [items, updateQuantity]
  );

  /**
   * Decrement item quantity
   * If quantity would reach 0, uses optimistic remove instead
   */
  const decrementItem = useCallback(
    async (lineId: string) => {
      const item = items.find((i) => i.line_id === lineId);
      if (!item) return;

      // If decrementing to 0, use optimistic remove for instant feedback
      if (item.quantity === 1) {
        await removeItem(lineId);
      } else {
        await updateQuantity(lineId, item.quantity - 1);
      }
    },
    [items, updateQuantity, removeItem]
  );

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Calculate total item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    // Cart data
    items,
    subtotal,
    currency,
    itemCount,

    // UI state
    isLoading,
    error,
    isCartOpen,

    // Actions
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    incrementItem,
    decrementItem,
    openCart,
    closeCart,
    toggleCart,

    // Per-item loading state
    isItemLoading,
  };
}

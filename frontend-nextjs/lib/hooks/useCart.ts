/**
 * useCart Hook
 * Provides cart operations with API integration and optimistic updates
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useCartStore } from '../store/cart';
import type { Product } from '../types/products';
import type { Cart } from '../types/cart';

export function useCart() {
  const {
    items,
    subtotal,
    currency,
    isLoading,
    error,
    isCartOpen,
    setCart,
    setLoading,
    setError,
    openCart,
    closeCart,
    toggleCart,
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
   * Add product to cart
   */
  const addItem = useCallback(
    async (product: Product, quantity: number = 1) => {
      try {
        setLoading(true);
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
        setCart(cart);
        openCart(); // Open cart drawer after adding item
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      } finally {
        setLoading(false);
      }
    },
    [setCart, setLoading, setError, openCart]
  );

  /**
   * Update cart item quantity
   */
  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/cart/${lineId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to update quantity');
        }

        const cart: Cart = await response.json();
        setCart(cart);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update quantity');
      } finally {
        setLoading(false);
      }
    },
    [setCart, setLoading, setError]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    async (lineId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/cart/${lineId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to remove item');
        }

        const cart: Cart = await response.json();
        setCart(cart);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove item');
      } finally {
        setLoading(false);
      }
    },
    [setCart, setLoading, setError]
  );

  /**
   * Increment item quantity
   */
  const incrementItem = useCallback(
    async (lineId: string) => {
      const item = items.find((i) => i.line_id === lineId);
      if (item) {
        await updateQuantity(lineId, item.quantity + 1);
      }
    },
    [items, updateQuantity]
  );

  /**
   * Decrement item quantity
   */
  const decrementItem = useCallback(
    async (lineId: string) => {
      const item = items.find((i) => i.line_id === lineId);
      if (item && item.quantity > 1) {
        await updateQuantity(lineId, item.quantity - 1);
      }
    },
    [items, updateQuantity]
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
  };
}

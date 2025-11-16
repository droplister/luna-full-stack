/**
 * useCart Hook Integration Tests
 * Tests for cart operations with optimistic updates and version tracking
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCart } from '../useCart';
import { useCartStore } from '../../store/cart';
import type { Product } from '../../types/products';
import type { Cart } from '../../types/cart';
import * as toast from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Helper to create a mock product
const createMockProduct = (id: number): Product => ({
  id,
  title: `Product ${id}`,
  description: `Description for product ${id}`,
  category: 'test-category',
  price: 10.00,
  discountPercentage: 0,
  rating: 4.5,
  stock: 10,
  tags: ['test'],
  brand: 'Test Brand',
  sku: `SKU${id}`,
  weight: 1,
  dimensions: { width: 10, height: 10, depth: 10 },
  warrantyInformation: 'Test warranty',
  shippingInformation: 'Test shipping',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: 'Test return policy',
  minimumOrderQuantity: 1,
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    barcode: '1234567890',
    qrCode: 'test-qr',
  },
  images: [`https://example.com/image${id}.jpg`],
  thumbnail: `https://example.com/thumb${id}.jpg`,
});

// Helper to create a mock cart response
const createMockCartResponse = (productIds: number[]): Cart => {
  const items = productIds.map((id, index) => ({
    line_id: `line_${id}`,
    product_id: id,
    title: `Product ${id}`,
    price: 1000, // $10 in cents
    quantity: 1,
    stock: 10,
    image: `https://example.com/image${id}.jpg`,
    brand: 'Test Brand',
    category: 'test-category',
    sku: `SKU${id}`,
    line_total: 1000,
  }));

  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.line_total, 0),
    currency: 'USD',
  };
};

describe('useCart Hook', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.getState().clearCart();

    // Clear all mocks
    vi.clearAllMocks();

    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.currency).toBe('USD');
      expect(result.current.itemCount).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('addItem with Version Tracking', () => {
    it('should add item optimistically and apply server response', async () => {
      const mockProduct = createMockProduct(1);
      const mockResponse = createMockCartResponse([1]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useCart());

      // Add item
      await act(async () => {
        await result.current.addItem(mockProduct, 1, false);
      });

      // Should have item optimistically
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product_id).toBe(1);

      // Wait for server response
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/cart',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"product"'),
          })
        );
      });
    });

    it('should ignore stale server response when adding items rapidly', async () => {
      const mockProduct1 = createMockProduct(1);
      const mockProduct2 = createMockProduct(2);

      // Simulate slow response for product 1
      let resolveProduct1: any;
      const product1Promise = new Promise((resolve) => {
        resolveProduct1 = resolve;
      });

      // Mock fetch to return promises we control
      (global.fetch as any)
        .mockImplementationOnce(() => product1Promise)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockCartResponse([1, 2]),
        });

      const { result } = renderHook(() => useCart());

      // Add product 1 (slow)
      act(() => {
        result.current.addItem(mockProduct1, 1, false);
      });

      // Add product 2 immediately (fast)
      await act(async () => {
        await result.current.addItem(mockProduct2, 1, false);
      });

      // Now resolve product 1's slow response with stale data
      act(() => {
        resolveProduct1({
          ok: true,
          json: async () => createMockCartResponse([1]), // Only product 1
        });
      });

      await waitFor(() => {
        const { items } = result.current;
        // Should still have both items (stale response ignored)
        expect(items).toHaveLength(2);
      });
    });

    it('should rollback on server error', async () => {
      const mockProduct = createMockProduct(1);

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem(mockProduct, 1, false);
      });

      // Should rollback to empty cart
      await waitFor(() => {
        expect(result.current.items).toHaveLength(0);
        expect(toast.toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('removeItem with Version Tracking', () => {
    it('should remove item optimistically and apply server response', async () => {
      const mockCart = createMockCartResponse([1, 2]);

      // Setup initial cart
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.fetchCart();
      });

      // Remove item
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([2]),
      });

      await act(async () => {
        await result.current.removeItem('line_1');
      });

      // Should remove optimistically
      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].product_id).toBe(2);
      });
    });

    it('should ignore stale server response when removing items rapidly', async () => {
      const mockCart = createMockCartResponse([1, 2, 3]);

      // Setup initial cart
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.fetchCart();
      });

      // Simulate slow response for removing item 1
      let resolveRemove1: any;
      const remove1Promise = new Promise((resolve) => {
        resolveRemove1 = resolve;
      });

      (global.fetch as any)
        .mockImplementationOnce(() => remove1Promise)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockCartResponse([3]),
        });

      // Remove item 1 (slow)
      act(() => {
        result.current.removeItem('line_1');
      });

      // Remove item 2 immediately (fast)
      await act(async () => {
        await result.current.removeItem('line_2');
      });

      // Resolve slow response with stale data
      act(() => {
        resolveRemove1({
          ok: true,
          json: async () => createMockCartResponse([2, 3]), // Still has item 2
        });
      });

      await waitFor(() => {
        const { items } = result.current;
        // Should only have item 3 (stale response ignored)
        expect(items).toHaveLength(1);
        expect(items[0].product_id).toBe(3);
      });
    });
  });

  describe('incrementItem and decrementItem', () => {
    it('should increment quantity respecting stock limits', async () => {
      const mockCart = createMockCartResponse([1]);
      mockCart.items[0].quantity = 9;
      mockCart.items[0].stock = 10;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.fetchCart();
      });

      // Should allow increment (9 -> 10)
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          const cart = createMockCartResponse([1]);
          cart.items[0].quantity = 10;
          cart.items[0].line_total = 10000;
          cart.subtotal = 10000;
          return cart;
        },
      });

      await act(async () => {
        await result.current.incrementItem('line_1');
      });

      await waitFor(() => {
        expect(result.current.items[0].quantity).toBe(10);
      });

      // Should prevent increment beyond stock
      await act(async () => {
        await result.current.incrementItem('line_1');
      });

      expect(toast.toast.error).toHaveBeenCalledWith('Maximum stock reached');
    });

    it('should decrement quantity and remove at 0', async () => {
      const mockCart = createMockCartResponse([1]);
      mockCart.items[0].quantity = 1;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.fetchCart();
      });

      // Mock remove response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([]),
      });

      // Decrement from 1 should remove
      await act(async () => {
        await result.current.decrementItem('line_1');
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(0);
      });

      // Verify DELETE was called
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/line_1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Cart Drawer', () => {
    it('should open cart when adding item by default', async () => {
      const mockProduct = createMockProduct(1);

      // Mock initial fetchCart on mount
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([]),
      });

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCartOpen).toBe(false);

      // Mock addItem response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([1]),
      });

      await act(async () => {
        await result.current.addItem(mockProduct, 1, true); // openDrawer = true
      });

      // Drawer should open optimistically
      expect(result.current.isCartOpen).toBe(true);
    });

    it('should not open cart when openDrawer is false', async () => {
      const mockProduct = createMockProduct(1);

      // Mock initial fetchCart on mount
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([]),
      });

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ensure cart is closed before test
      if (result.current.isCartOpen) {
        act(() => {
          result.current.closeCart();
        });
      }

      // Mock addItem response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([1]),
      });

      await act(async () => {
        await result.current.addItem(mockProduct, 1, false); // openDrawer = false
      });

      expect(result.current.isCartOpen).toBe(false);
    });

    it('should toggle cart drawer', async () => {
      // Mock initial fetchCart on mount
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([]),
      });

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ensure cart starts closed
      if (result.current.isCartOpen) {
        act(() => {
          result.current.closeCart();
        });
      }

      expect(result.current.isCartOpen).toBe(false);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isCartOpen).toBe(true);

      act(() => {
        result.current.toggleCart();
      });

      expect(result.current.isCartOpen).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should track per-item loading state', async () => {
      const mockProduct = createMockProduct(1);
      const lineId = 'c4ca4238a0b923820dcc509a6f75849b'; // MD5 of "1"

      // Mock initial fetchCart on mount
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCartResponse([]),
      });

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Create a promise we can control
      let resolveAdd: any;
      const addPromise = new Promise((resolve) => {
        resolveAdd = resolve;
      });

      (global.fetch as any).mockImplementationOnce(() => addPromise);

      // Start adding item (don't await)
      let addPromiseResult: Promise<void>;
      act(() => {
        addPromiseResult = result.current.addItem(mockProduct, 1, false);
      });

      // Check loading state while request is pending
      await waitFor(() => {
        expect(result.current.isItemLoading(lineId)).toBe(true);
      }, { timeout: 100 });

      // Resolve the add request
      await act(async () => {
        resolveAdd({
          ok: true,
          json: async () => createMockCartResponse([1]),
        });
        await addPromiseResult!;
      });

      // Should stop loading
      expect(result.current.isItemLoading(lineId)).toBe(false);
    });
  });

  describe('Item Count', () => {
    it('should calculate total item count across quantities', async () => {
      const mockCart = createMockCartResponse([1, 2]);
      mockCart.items[0].quantity = 2;
      mockCart.items[1].quantity = 3;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      });

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.fetchCart();
      });

      await waitFor(() => {
        expect(result.current.itemCount).toBe(5); // 2 + 3
      });
    });
  });
});

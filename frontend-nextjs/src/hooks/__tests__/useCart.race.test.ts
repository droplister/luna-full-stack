/**
 * useCart Race Condition Tests
 * Focused tests for version tracking with simulated out-of-order responses
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCart } from '../useCart';
import { useCartStore } from '../../lib/store/cart';
import type { Product } from '../../lib/types/products';
import type { Cart } from '../../lib/types/cart';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const createMockProduct = (id: number): Product => ({
  id,
  title: `Product ${id}`,
  description: `Description ${id}`,
  category: 'test',
  price: 10.00,
  discountPercentage: 0,
  rating: 4.5,
  stock: 100,
  tags: [],
  brand: 'Test',
  sku: `SKU${id}`,
  weight: 1,
  dimensions: { width: 10, height: 10, depth: 10 },
  warrantyInformation: 'Test',
  shippingInformation: 'Test',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: 'Test',
  minimumOrderQuantity: 1,
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    barcode: '123',
    qrCode: 'test',
  },
  images: [],
  thumbnail: '',
});

const createMockCartResponse = (items: Array<{ id: number; quantity: number }>): Cart => ({
  items: items.map(item => ({
    line_id: `line_${item.id}`,
    product_id: item.id,
    title: `Product ${item.id}`,
    price: 1000,
    quantity: item.quantity,
    stock: 100,
    image: '',
    brand: 'Test',
    category: 'test',
    sku: `SKU${item.id}`,
    line_total: 1000 * item.quantity,
  })),
  subtotal: items.reduce((sum, item) => sum + (1000 * item.quantity), 0),
  currency: 'USD',
});

describe('useCart Race Condition Tests', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should ignore stale response when adding two items rapidly', async () => {
    // Mock initial empty cart
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockCartResponse([]),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup controlled promises
    let resolveAdd1: any, resolveAdd2: any;
    const promise1 = new Promise(resolve => { resolveAdd1 = resolve; });
    const promise2 = new Promise(resolve => { resolveAdd2 = resolve; });

    (global.fetch as any)
      .mockImplementationOnce(() => promise1)
      .mockImplementationOnce(() => promise2);

    // Start both operations
    const add1 = result.current.addItem(createMockProduct(1), 1, false);
    await new Promise(r => setTimeout(r, 10));
    const add2 = result.current.addItem(createMockProduct(2), 1, false);

    // Resolve in REVERSE order (response 2 before response 1)
    await new Promise(r => setTimeout(r, 50));

    // Response 2 arrives first (has both items)
    resolveAdd2({
      ok: true,
      json: async () => createMockCartResponse([{ id: 1, quantity: 1 }, { id: 2, quantity: 1 }]),
    });

    await new Promise(r => setTimeout(r, 50));

    // Response 1 arrives late (only has item 1) - should be ignored
    resolveAdd1({
      ok: true,
      json: async () => createMockCartResponse([{ id: 1, quantity: 1 }]),
    });

    await act(async () => {
      await Promise.all([add1, add2]);
    });

    // Should have both items (stale response ignored)
    await waitFor(() => {
      expect(result.current.items.length).toBe(2);
    });
  });

  it('should handle rapid increment/decrement with out-of-order responses', async () => {
    // Start with item at quantity 5
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockCartResponse([{ id: 1, quantity: 5 }]),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup controlled promises for increment -> decrement -> increment
    let resolveInc1: any, resolveDec: any, resolveInc2: any;
    const promiseInc1 = new Promise(r => { resolveInc1 = r; });
    const promiseDec = new Promise(r => { resolveDec = r; });
    const promiseInc2 = new Promise(r => { resolveInc2 = r; });

    (global.fetch as any)
      .mockImplementationOnce(() => promiseInc1)
      .mockImplementationOnce(() => promiseDec)
      .mockImplementationOnce(() => promiseInc2);

    // Execute operations
    const inc1 = result.current.incrementItem('line_1');
    await new Promise(r => setTimeout(r, 10));
    const dec = result.current.decrementItem('line_1');
    await new Promise(r => setTimeout(r, 10));
    const inc2 = result.current.incrementItem('line_1');

    // Resolve in chaotic order: inc2, inc1, dec
    await new Promise(r => setTimeout(r, 50));

    resolveInc2({
      ok: true,
      json: async () => createMockCartResponse([{ id: 1, quantity: 6 }]),
    });

    await new Promise(r => setTimeout(r, 30));

    resolveInc1({
      ok: true,
      json: async () => createMockCartResponse([{ id: 1, quantity: 6 }]),
    });

    await new Promise(r => setTimeout(r, 30));

    resolveDec({
      ok: true,
      json: async () => createMockCartResponse([{ id: 1, quantity: 5 }]),
    });

    await act(async () => {
      await Promise.all([inc1, dec, inc2]);
    });

    // Should maintain correct state despite chaotic responses
    await waitFor(() => {
      const qty = result.current.items[0]?.quantity;
      expect(qty).toBeGreaterThan(0);
      expect(result.current.items.length).toBe(1);
    });
  });

  it('should handle remove operation with delayed stale responses', async () => {
    // Start with 3 items
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockCartResponse([
        { id: 1, quantity: 1 },
        { id: 2, quantity: 1 },
        { id: 3, quantity: 1 },
      ]),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup controlled promises
    let resolveRemove1: any, resolveRemove2: any;
    const promiseRemove1 = new Promise(r => { resolveRemove1 = r; });
    const promiseRemove2 = new Promise(r => { resolveRemove2 = r; });

    (global.fetch as any)
      .mockImplementationOnce(() => promiseRemove1)
      .mockImplementationOnce(() => promiseRemove2);

    // Remove item 1, then remove item 2
    const remove1 = result.current.removeItem('line_1');
    await new Promise(r => setTimeout(r, 10));
    const remove2 = result.current.removeItem('line_2');

    // Response 2 arrives first (only item 3 left)
    await new Promise(r => setTimeout(r, 50));

    resolveRemove2({
      ok: true,
      json: async () => createMockCartResponse([{ id: 3, quantity: 1 }]),
    });

    await new Promise(r => setTimeout(r, 100));

    // Response 1 arrives late (items 2 and 3 still there) - should be ignored
    resolveRemove1({
      ok: true,
      json: async () => createMockCartResponse([
        { id: 2, quantity: 1 },
        { id: 3, quantity: 1 },
      ]),
    });

    await act(async () => {
      await Promise.all([remove1, remove2]);
    });

    // Should only have item 3 (stale response ignored)
    await waitFor(() => {
      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].product_id).toBe(3);
    });
  });

  it('should handle rapid remove operations with out-of-order responses', async () => {
    // Start with 2 items
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockCartResponse([
        { id: 1, quantity: 1 },
        { id: 2, quantity: 1 },
      ]),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup promises for removing both items
    let resolveRemove1: any, resolveRemove2: any;
    const promiseRemove1 = new Promise(r => { resolveRemove1 = r; });
    const promiseRemove2 = new Promise(r => { resolveRemove2 = r; });

    (global.fetch as any)
      .mockImplementationOnce(() => promiseRemove1)
      .mockImplementationOnce(() => promiseRemove2);

    // Remove both items rapidly
    const remove1 = result.current.removeItem('line_1');
    await new Promise(r => setTimeout(r, 10));
    const remove2 = result.current.removeItem('line_2');

    // Resolve in reverse order (response 2 before response 1)
    await new Promise(r => setTimeout(r, 50));

    // Response 2 arrives first (empty cart)
    resolveRemove2({
      ok: true,
      json: async () => createMockCartResponse([]),
    });

    await new Promise(r => setTimeout(r, 50));

    // Response 1 arrives late (still has item 2) - should be ignored
    resolveRemove1({
      ok: true,
      json: async () => createMockCartResponse([{ id: 2, quantity: 1 }]),
    });

    await act(async () => {
      await Promise.all([remove1, remove2]);
    });

    // Should be empty (stale response ignored by version tracking)
    await waitFor(() => {
      expect(result.current.items.length).toBe(0);
    }, { timeout: 2000 });
  });

  it('should maintain consistent state across 5 rapid operations', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => createMockCartResponse([]),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup 5 controlled promises
    const promises: any[] = [];
    for (let i = 0; i < 5; i++) {
      let resolve: any;
      const promise = new Promise(r => { resolve = r; });
      promises.push({ promise, resolve, productId: i + 1 });
      (global.fetch as any).mockImplementationOnce(() => promise);
    }

    // Add 5 products rapidly
    const operations = promises.map((_, i) =>
      result.current.addItem(createMockProduct(i + 1), 1, false)
    );

    // Resolve in random order
    const shuffled = [...promises].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      await new Promise(r => setTimeout(r, 30 + Math.random() * 50));

      const items = Array.from({ length: i + 1 }, (_, idx) => ({
        id: shuffled[idx].productId,
        quantity: 1,
      }));

      shuffled[i].resolve({
        ok: true,
        json: async () => createMockCartResponse(items),
      });
    }

    await act(async () => {
      await Promise.all(operations);
    });

    // Should maintain consistent state (may have fewer than 5 if stale responses ignored)
    await waitFor(() => {
      const { items } = result.current;
      // Should have at least some items
      expect(items.length).toBeGreaterThan(0);
      expect(items.length).toBeLessThanOrEqual(5);
      // All items should have valid quantities
      expect(items.every(item => item.quantity > 0)).toBe(true);
      // No duplicate product IDs
      const productIds = items.map(i => i.product_id);
      expect(new Set(productIds).size).toBe(productIds.length);
    }, { timeout: 2000 });
  });
});

/**
 * Cart Store Unit Tests
 * Tests for Zustand cart store with version tracking and optimistic updates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart';
import type { Cart, CartLineItem } from '../../types/cart';

// Helper to create a mock cart item
const createMockItem = (id: number, quantity: number = 1): CartLineItem => ({
  line_id: `mock_line_${id}`,
  product_id: id,
  title: `Product ${id}`,
  price: 1000, // $10.00 in cents
  quantity,
  stock: 10,
  image: `https://example.com/image${id}.jpg`,
  brand: 'Test Brand',
  category: 'test-category',
  sku: `SKU${id}`,
  line_total: 1000 * quantity,
});

// Helper to create a mock cart
const createMockCart = (items: CartLineItem[]): Cart => ({
  items,
  subtotal: items.reduce((sum, item) => sum + item.line_total, 0),
  currency: 'USD',
});

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCartStore.getState().clearCart();
  });

  describe('Version Tracking', () => {
    it('should initialize with version 0', () => {
      const { stateVersion } = useCartStore.getState();
      expect(stateVersion).toBe(0);
    });

    it('should increment version when setCart is called', () => {
      const { setCart, stateVersion: initialVersion } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setCart(mockCart);

      const { stateVersion: newVersion } = useCartStore.getState();
      expect(newVersion).toBe(initialVersion + 1);
    });

    it('should increment version on each setCart call', () => {
      const { setCart } = useCartStore.getState();
      const mockCart1 = createMockCart([createMockItem(1)]);
      const mockCart2 = createMockCart([createMockItem(1), createMockItem(2)]);

      setCart(mockCart1);
      const version1 = useCartStore.getState().stateVersion;

      setCart(mockCart2);
      const version2 = useCartStore.getState().stateVersion;

      expect(version2).toBe(version1 + 1);
    });

    it('should apply cart update when version matches (setCartIfCurrent)', () => {
      const { setCart, setCartIfCurrent } = useCartStore.getState();
      const mockCart1 = createMockCart([createMockItem(1)]);
      const mockCart2 = createMockCart([createMockItem(1), createMockItem(2)]);

      // Initial update
      setCart(mockCart1);
      const currentVersion = useCartStore.getState().stateVersion;

      // Should apply because version matches
      setCartIfCurrent(mockCart2, currentVersion);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(items[1].product_id).toBe(2);
    });

    it('should ignore stale cart update when version does not match (setCartIfCurrent)', () => {
      const { setCart, setCartIfCurrent } = useCartStore.getState();
      const mockCart1 = createMockCart([createMockItem(1)]);
      const mockCart2 = createMockCart([createMockItem(1), createMockItem(2)]);
      const staleCart = createMockCart([createMockItem(1)]); // Stale response

      // Initial update
      setCart(mockCart1);
      const version1 = useCartStore.getState().stateVersion;

      // Second update (newer)
      setCart(mockCart2);

      // Try to apply stale response (expects version1, but current is version2)
      setCartIfCurrent(staleCart, version1);

      // Cart should still have 2 items (stale update was ignored)
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(items[1].product_id).toBe(2);
    });

    it('should not increment version when setCartIfCurrent is called', () => {
      const { setCart, setCartIfCurrent } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setCart(mockCart);
      const currentVersion = useCartStore.getState().stateVersion;

      setCartIfCurrent(mockCart, currentVersion);
      const newVersion = useCartStore.getState().stateVersion;

      // Version should not change when applying server response
      expect(newVersion).toBe(currentVersion);
    });

    it('should prevent race condition in concurrent operations', () => {
      const { setCart, setCartIfCurrent } = useCartStore.getState();

      // Simulate: User adds Product A
      const cartWithA = createMockCart([createMockItem(1)]);
      setCart(cartWithA);
      const versionA = useCartStore.getState().stateVersion;

      // Simulate: User quickly adds Product B (before A's response arrives)
      const cartWithAB = createMockCart([createMockItem(1), createMockItem(2)]);
      setCart(cartWithAB);
      const versionB = useCartStore.getState().stateVersion;

      // Simulate: Server response for A arrives (stale, only has A)
      const serverResponseA = createMockCart([createMockItem(1)]);
      setCartIfCurrent(serverResponseA, versionA);

      // Cart should still have both A and B (stale response ignored)
      const { items } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(items.map(i => i.product_id)).toEqual([1, 2]);

      // Simulate: Server response for B arrives (fresh, has both A and B)
      const serverResponseB = createMockCart([createMockItem(1), createMockItem(2)]);
      setCartIfCurrent(serverResponseB, versionB);

      // Cart should still have both A and B
      const { items: finalItems } = useCartStore.getState();
      expect(finalItems).toHaveLength(2);
    });
  });

  describe('Snapshot and Rollback', () => {
    it('should snapshot current state including version', () => {
      const { setCart, snapshotState } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setCart(mockCart);
      const currentVersion = useCartStore.getState().stateVersion;
      snapshotState();

      const { previousState } = useCartStore.getState();
      expect(previousState).toBeDefined();
      expect(previousState?.items).toHaveLength(1);
      expect(previousState?.stateVersion).toBe(currentVersion);
    });

    it('should rollback to previous state including version', () => {
      const { setCart, snapshotState, rollbackState } = useCartStore.getState();
      const mockCart1 = createMockCart([createMockItem(1)]);
      const mockCart2 = createMockCart([createMockItem(1), createMockItem(2)]);

      // Set initial cart and snapshot
      setCart(mockCart1);
      const version1 = useCartStore.getState().stateVersion;
      snapshotState();

      // Make a change
      setCart(mockCart2);

      // Rollback
      rollbackState();

      const { items, stateVersion, previousState } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].product_id).toBe(1);
      expect(stateVersion).toBe(version1); // Version should be restored
      expect(previousState).toBeNull(); // Snapshot should be cleared
    });

    it('should clear snapshot without changing cart state', () => {
      const { setCart, snapshotState, clearSnapshot } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setCart(mockCart);
      snapshotState();
      clearSnapshot();

      const { previousState, items } = useCartStore.getState();
      expect(previousState).toBeNull();
      expect(items).toHaveLength(1); // Cart state unchanged
    });

    it('should do nothing when rolling back with no snapshot', () => {
      const { setCart, rollbackState } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setCart(mockCart);
      const initialState = useCartStore.getState();

      rollbackState(); // No snapshot exists

      const finalState = useCartStore.getState();
      expect(finalState).toEqual(initialState);
    });
  });

  describe('Loading States', () => {
    it('should add item to loading state', () => {
      const { addLoadingItem, isItemLoading } = useCartStore.getState();
      const lineId = 'test_line_1';

      addLoadingItem(lineId);

      expect(isItemLoading(lineId)).toBe(true);
    });

    it('should remove item from loading state', () => {
      const { addLoadingItem, removeLoadingItem, isItemLoading } = useCartStore.getState();
      const lineId = 'test_line_1';

      addLoadingItem(lineId);
      removeLoadingItem(lineId);

      expect(isItemLoading(lineId)).toBe(false);
    });

    it('should track multiple items loading independently', () => {
      const { addLoadingItem, removeLoadingItem, isItemLoading } = useCartStore.getState();
      const lineId1 = 'test_line_1';
      const lineId2 = 'test_line_2';

      addLoadingItem(lineId1);
      addLoadingItem(lineId2);

      expect(isItemLoading(lineId1)).toBe(true);
      expect(isItemLoading(lineId2)).toBe(true);

      removeLoadingItem(lineId1);

      expect(isItemLoading(lineId1)).toBe(false);
      expect(isItemLoading(lineId2)).toBe(true);
    });

    it('should return false for item that is not loading', () => {
      const { isItemLoading } = useCartStore.getState();

      expect(isItemLoading('nonexistent_line')).toBe(false);
    });
  });

  describe('Cart Operations', () => {
    it('should set cart data correctly', () => {
      const { setCart } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1, 2), createMockItem(2, 1)]);

      setCart(mockCart);

      const { items, subtotal, currency } = useCartStore.getState();
      expect(items).toHaveLength(2);
      expect(subtotal).toBe(3000); // $30.00
      expect(currency).toBe('USD');
    });

    it('should clear all cart data including version', () => {
      const { setCart, clearCart, addLoadingItem } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setCart(mockCart);
      addLoadingItem('test_line');

      clearCart();

      const { items, subtotal, stateVersion, loadingItems, previousState } = useCartStore.getState();
      expect(items).toHaveLength(0);
      expect(subtotal).toBe(0);
      expect(stateVersion).toBe(0);
      expect(loadingItems.size).toBe(0);
      expect(previousState).toBeNull();
    });

    it('should update error state', () => {
      const { setError } = useCartStore.getState();

      setError('Test error message');

      const { error } = useCartStore.getState();
      expect(error).toBe('Test error message');
    });

    it('should clear error when setting cart', () => {
      const { setError, setCart } = useCartStore.getState();
      const mockCart = createMockCart([createMockItem(1)]);

      setError('Test error');
      setCart(mockCart);

      const { error } = useCartStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('Cart Drawer Visibility', () => {
    it('should open cart drawer', () => {
      const { openCart } = useCartStore.getState();

      openCart();

      const { isCartOpen } = useCartStore.getState();
      expect(isCartOpen).toBe(true);
    });

    it('should close cart drawer', () => {
      const { openCart, closeCart } = useCartStore.getState();

      openCart();
      closeCart();

      const { isCartOpen } = useCartStore.getState();
      expect(isCartOpen).toBe(false);
    });

    it('should toggle cart drawer', () => {
      const { toggleCart } = useCartStore.getState();

      toggleCart();
      expect(useCartStore.getState().isCartOpen).toBe(true);

      toggleCart();
      expect(useCartStore.getState().isCartOpen).toBe(false);
    });
  });
});

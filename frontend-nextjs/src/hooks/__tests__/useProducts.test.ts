/**
 * useProducts Hook Tests
 * Tests for product fetching with React Query caching and filtering
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useProduct, useRelatedProducts } from '../useProducts';
import type { Product } from '../../lib/types/products';
import type { ReactNode } from 'react';

// Create a wrapper with fresh QueryClient for each test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable cache persistence
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Helper to create mock product
const createMockProduct = (id: number, category: string = 'test-category'): Product => ({
  id,
  title: `Product ${id}`,
  description: `Description for product ${id}`,
  category,
  price: 10.00 + id,
  discountPercentage: 5,
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

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State and Data Fetching', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.products).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.category).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should fetch and display all products', async () => {
      const mockProducts = [
        createMockProduct(1, 'electronics'),
        createMockProduct(2, 'books'),
        createMockProduct(3, 'electronics'),
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts, total: 3 }),
      } as Response);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(3);
      expect(result.current.total).toBe(3);
      expect(result.current.products).toEqual(mockProducts);
    });

    it('should handle fetch errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch products');
      expect(result.current.products).toEqual([]);
    });
  });

  describe('Category Filtering', () => {
    it('should filter products by category', async () => {
      const mockProducts = [
        createMockProduct(1, 'electronics'),
        createMockProduct(2, 'books'),
        createMockProduct(3, 'electronics'),
        createMockProduct(4, 'clothing'),
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts, total: 4 }),
      } as Response);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initial: all products
      expect(result.current.products).toHaveLength(4);
      expect(result.current.total).toBe(4);

      // Filter by electronics
      act(() => {
        result.current.setCategory('electronics');
      });

      expect(result.current.category).toBe('electronics');
      expect(result.current.products).toHaveLength(2);
      expect(result.current.total).toBe(2);
      expect(result.current.products.every(p => p.category === 'electronics')).toBe(true);

      // Filter by books
      act(() => {
        result.current.setCategory('books');
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.total).toBe(1);
      expect(result.current.products[0].category).toBe('books');

      // Clear filter
      act(() => {
        result.current.setCategory(null);
      });

      expect(result.current.products).toHaveLength(4);
      expect(result.current.total).toBe(4);
    });

    it('should return empty array for non-existent category', async () => {
      const mockProducts = [
        createMockProduct(1, 'electronics'),
        createMockProduct(2, 'books'),
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts, total: 2 }),
      } as Response);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setCategory('non-existent-category');
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });

  describe('Refetch Functionality', () => {
    it('should refetch products when refetch is called', async () => {
      const initialProducts = [createMockProduct(1)];
      const updatedProducts = [createMockProduct(1), createMockProduct(2)];

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: initialProducts, total: 1 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: updatedProducts, total: 2 }),
        } as Response);

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);

      // Trigger refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.products).toHaveLength(2);
      });
    });
  });
});

describe('useProduct Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Single Product Fetching', () => {
    it('should fetch a single product by ID', async () => {
      const mockProduct = createMockProduct(42);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      } as Response);

      const { result } = renderHook(() => useProduct(42), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.product).toEqual(mockProduct);
      expect(result.current.error).toBeNull();
    });

    it('should handle product fetch errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const { result } = renderHook(() => useProduct(999), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch product');
      expect(result.current.product).toBeNull();
    });

    it('should not fetch if ID is falsy', () => {
      const { result } = renderHook(() => useProduct(0), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.product).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

describe('useRelatedProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Related Products Fetching', () => {
    it('should fetch related products from same category', async () => {
      const mockProducts = [
        createMockProduct(1, 'electronics'),
        createMockProduct(2, 'electronics'),
        createMockProduct(3, 'electronics'),
        createMockProduct(4, 'electronics'),
        createMockProduct(5, 'electronics'),
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts, total: 5 }),
      } as Response);

      const { result } = renderHook(
        () => useRelatedProducts('electronics', 1, 4),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(4);
      // Should exclude current product (id: 1)
      expect(result.current.products.every(p => p.id !== 1)).toBe(true);
      expect(result.current.products.every(p => p.category === 'electronics')).toBe(true);
    });

    it('should respect the limit parameter', async () => {
      const mockProducts = [
        createMockProduct(1, 'books'),
        createMockProduct(2, 'books'),
        createMockProduct(3, 'books'),
        createMockProduct(4, 'books'),
        createMockProduct(5, 'books'),
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: mockProducts, total: 5 }),
      } as Response);

      const { result } = renderHook(
        () => useRelatedProducts('books', 10, 2),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
    });

    it('should not fetch if category is undefined', () => {
      const { result } = renderHook(
        () => useRelatedProducts(undefined, 1, 4),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.products).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(
        () => useRelatedProducts('electronics', 1, 4),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch related products');
      expect(result.current.products).toEqual([]);
    });

    it('should return empty array when no products in category', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [], total: 0 }),
      } as Response);

      const { result } = renderHook(
        () => useRelatedProducts('empty-category', 1, 4),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
    });
  });
});

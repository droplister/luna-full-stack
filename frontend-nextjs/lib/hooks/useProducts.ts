/**
 * useProducts Hook
 * Provides product fetching with pagination support
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/products';

interface UseProductsOptions {
  limit?: number;
  initialPage?: number;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export function useProducts({ limit = 12, initialPage = 1 }: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch products for current page
   */
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const skip = (page - 1) * limit;
      const response = await fetch(`/api/products?limit=${limit}&skip=${skip}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductsResponse = await response.json();

      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  // Fetch products when page or limit changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [hasNextPage]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage((p) => p - 1);
    }
  }, [hasPrevPage]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((pageNumber: number) => {
    setPage(pageNumber);
  }, []);

  return {
    // Product data
    products,
    total,

    // Pagination
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    setPage,

    // UI state
    isLoading,
    error,

    // Actions
    refetch: fetchProducts,
  };
}

/**
 * useProduct Hook
 * Fetch a single product by ID
 */
export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data: Product = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
}

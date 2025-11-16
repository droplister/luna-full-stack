/**
 * useProducts Hook
 * Provides product fetching with React Query for caching and request deduplication
 * No pagination - fetches all ~40 products from configured categories
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types/products';

interface ProductsResponse {
  products: Product[];
  total: number;
}

/**
 * Fetch all products from API
 */
async function fetchProducts(): Promise<ProductsResponse> {
  const response = await fetch('/api/products');

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

/**
 * Return type for useProducts hook
 */
export interface UseProductsReturn {
  products: Product[];
  total: number;
  category: string | null;
  setCategory: (category: string | null) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(): UseProductsReturn {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Use React Query for automatic caching and request deduplication
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products'], // Cache key
    queryFn: fetchProducts,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  /**
   * Filter products by category (client-side)
   */
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    return selectedCategory
      ? data.products.filter(p => p.category === selectedCategory)
      : data.products;
  }, [data?.products, selectedCategory]);

  return {
    // Product data
    products: filteredProducts,
    total: filteredProducts.length,

    // Filtering
    category: selectedCategory,
    setCategory: setSelectedCategory,

    // UI state
    isLoading,
    error: error instanceof Error ? error.message : null,

    // Actions
    refetch: () => { refetch(); },
  };
}

/**
 * Fetch a single product by ID
 */
async function fetchProduct(id: number): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  return response.json();
}

/**
 * Return type for useProduct hook
 */
export interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useProduct Hook
 * Fetch a single product by ID with React Query caching
 */
export function useProduct(id: number): UseProductReturn {
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', id], // Cache key includes ID
    queryFn: () => fetchProduct(id),
    enabled: !!id, // Only fetch if ID exists
    staleTime: 2 * 60 * 1000, // Product details are fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    product: product || null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => { refetch(); },
  };
}

/**
 * Return type for useRelatedProducts hook
 */
export interface UseRelatedProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useRelatedProducts Hook
 * Fetch products from the same category, excluding the current product
 * Uses the same products query cache for efficiency
 */
export function useRelatedProducts(
  category: string | undefined,
  currentProductId: number | undefined,
  limit: number = 4
): UseRelatedProductsReturn {
  // Reuse the products query cache
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products'], // Same cache key as useProducts
    queryFn: fetchProducts,
    enabled: !!category, // Only fetch if category exists
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Filter by category and exclude current product (client-side)
  const relatedProducts = useMemo(() => {
    if (!data?.products || !category) return [];

    return data.products
      .filter(p => p.category === category && p.id !== currentProductId)
      .slice(0, limit);
  }, [data?.products, category, currentProductId, limit]);

  return {
    products: relatedProducts,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => { refetch(); },
  };
}

/**
 * useProducts Hook
 * Provides product fetching (no pagination - fetches all ~40 products from configured categories)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/products';

interface ProductsResponse {
  products: Product[];
  total: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all products from configured categories
   */
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/products');

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
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Filter products by category (client-side)
   */
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  /**
   * Change category filter
   */
  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  return {
    // Product data
    products: filteredProducts,
    total: filteredProducts.length,

    // Filtering
    category: selectedCategory,
    setCategory,

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

/**
 * useRelatedProducts Hook
 * Fetch products from the same category, excluding the current product
 */
export function useRelatedProducts(category: string | undefined, currentProductId: number | undefined, limit: number = 4) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedProducts = useCallback(async () => {
    if (!category) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }

      const data: ProductsResponse = await response.json();

      // Filter by category and exclude current product
      const related = data.products
        .filter(p => p.category === category && p.id !== currentProductId)
        .slice(0, limit);

      setProducts(related);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch related products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, currentProductId, limit]);

  useEffect(() => {
    fetchRelatedProducts();
  }, [fetchRelatedProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchRelatedProducts,
  };
}

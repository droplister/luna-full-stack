/**
 * DummyJSON API Client
 * API Documentation: https://dummyjson.com/docs/products
 */

import { fetchJson, buildUrl } from './upstream';
import type { DummyProduct, DummyProductList } from '../types/products';

const BASE_URL = 'https://dummyjson.com';

/**
 * Fetch paginated list of products
 *
 * @param limit - Number of products to return (default: 12)
 * @param skip - Number of products to skip (default: 0)
 * @returns Paginated product list
 */
export async function getProducts(
  limit: number = 12,
  skip: number = 0
): Promise<DummyProductList> {
  const url = buildUrl(`${BASE_URL}/products`, { limit, skip });
  return fetchJson<DummyProductList>(url);
}

/**
 * Fetch a single product by ID
 *
 * @param id - Product ID
 * @returns Single product
 */
export async function getProduct(id: number): Promise<DummyProduct> {
  return fetchJson<DummyProduct>(`${BASE_URL}/products/${id}`);
}

/**
 * Search products by query
 *
 * @param query - Search query
 * @returns Matching products
 */
export async function searchProducts(query: string): Promise<DummyProductList> {
  const url = buildUrl(`${BASE_URL}/products/search`, { q: query });
  return fetchJson<DummyProductList>(url);
}

/**
 * Get all product categories
 *
 * @returns List of category names
 */
export async function getCategories(): Promise<string[]> {
  return fetchJson<string[]>(`${BASE_URL}/products/categories`);
}

/**
 * Get products by category
 *
 * @param category - Category name
 * @returns Products in category
 */
export async function getProductsByCategory(category: string): Promise<DummyProductList> {
  return fetchJson<DummyProductList>(`${BASE_URL}/products/category/${category}`);
}

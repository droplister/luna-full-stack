/**
 * DummyJSON API Client
 * API Documentation: https://dummyjson.com/docs/products
 */

import { fetchJson, buildUrl } from './upstream';
import type { DummyProduct, DummyProductList, ProductCategory } from '../types/products';
import { configuredCategories } from '../cms';

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
 * Get all product categories with full data
 *
 * @returns List of category objects with slug, name, and url
 */
export async function getCategories(): Promise<ProductCategory[]> {
  return fetchJson<ProductCategory[]>(`${BASE_URL}/products/categories`);
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

/**
 * Get all products from configured categories in parallel
 * Categories are defined in brand config
 *
 * @returns Combined list of all products from configured categories
 */
export async function getAllConfiguredCategoryProducts(): Promise<DummyProductList> {
  // Fetch all configured categories in parallel
  const results = await Promise.all(
    configuredCategories.map(category =>
      fetchJson<DummyProductList>(`${BASE_URL}/products/category/${category}`)
    )
  );

  // Merge all products and deduplicate by ID
  const allProducts = results.flatMap(result => result.products);
  const uniqueProducts = Array.from(
    new Map(allProducts.map(product => [product.id, product])).values()
  );

  // Return in DummyProductList format
  return {
    products: uniqueProducts,
    total: uniqueProducts.length,
    skip: 0,
    limit: uniqueProducts.length,
  };
}

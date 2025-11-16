/**
 * Product Service Layer
 * Domain operations for product data
 */

import { getProducts, getProduct, searchProducts, getCategories, getProductsByCategory, getAllConfiguredCategoryProducts } from '../clients/dummyjson';
import type { DummyProduct, DummyProductList, Product, ProductCategory } from '../types/products';

/**
 * Fetch paginated list of all products
 *
 * @param limit - Number of products per page
 * @param skip - Number of products to skip
 * @returns Paginated product list
 */
export async function fetchAllProducts(
  limit: number = 12,
  skip: number = 0
): Promise<{ products: Product[]; total: number; skip: number; limit: number }> {
  const response = await getProducts(limit, skip);

  return {
    products: response.products,
    total: response.total,
    skip: response.skip,
    limit: response.limit,
  };
}

/**
 * Fetch a single product by ID
 *
 * @param id - Product ID
 * @returns Product
 */
export async function fetchProductById(id: number): Promise<Product> {
  return getProduct(id);
}

/**
 * Search products by query string
 *
 * @param query - Search query
 * @returns Matching products
 */
export async function searchProductsByQuery(query: string): Promise<{ products: Product[]; total: number }> {
  const response = await searchProducts(query);

  return {
    products: response.products,
    total: response.total,
  };
}

/**
 * Fetch all available product categories
 *
 * @returns List of category objects
 */
export async function fetchCategories(): Promise<ProductCategory[]> {
  return getCategories();
}

/**
 * Fetch products by category with pagination
 *
 * @param category - Category slug
 * @param limit - Number of products per page
 * @param skip - Number of products to skip
 * @returns Products in category
 */
export async function fetchProductsByCategory(
  category: string,
  limit: number = 12,
  skip: number = 0
): Promise<{ products: Product[]; total: number; skip: number; limit: number }> {
  const response = await getProductsByCategory(category);

  // Note: DummyJSON doesn't support pagination for category filtering
  // We'll simulate it client-side
  const paginatedProducts = response.products.slice(skip, skip + limit);

  return {
    products: paginatedProducts,
    total: response.total,
    skip,
    limit,
  };
}

/**
 * Fetch all products from configured categories
 * Fetches from all 8 configured categories in parallel with heavy caching
 *
 * @returns All products from configured categories
 */
export async function fetchAllCategoryProducts(): Promise<{ products: Product[]; total: number }> {
  const response = await getAllConfiguredCategoryProducts();

  return {
    products: response.products,
    total: response.total,
  };
}

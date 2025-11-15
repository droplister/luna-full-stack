/**
 * Product Service Layer
 * Domain operations for product data
 */

import { getProducts, getProduct, searchProducts, getCategories, getProductsByCategory } from '../clients/dummyjson';
import type { DummyProduct, DummyProductList, Product } from '../types/products';

/**
 * Normalize DummyJSON product to our internal Product type
 */
export function normalizeProduct(dummyProduct: DummyProduct): Product {
  return {
    id: dummyProduct.id,
    title: dummyProduct.title,
    description: dummyProduct.description,
    price: dummyProduct.price,
    thumbnail: dummyProduct.thumbnail,
    images: dummyProduct.images,
    category: dummyProduct.category,
    brand: dummyProduct.brand,
    sku: dummyProduct.sku,
    stock: dummyProduct.stock,
    rating: dummyProduct.rating,
  };
}

/**
 * Fetch paginated list of all products
 *
 * @param limit - Number of products per page
 * @param skip - Number of products to skip
 * @returns Paginated product list with normalized products
 */
export async function fetchAllProducts(
  limit: number = 12,
  skip: number = 0
): Promise<{ products: Product[]; total: number; skip: number; limit: number }> {
  const response = await getProducts(limit, skip);

  return {
    products: response.products.map(normalizeProduct),
    total: response.total,
    skip: response.skip,
    limit: response.limit,
  };
}

/**
 * Fetch a single product by ID
 *
 * @param id - Product ID
 * @returns Normalized product
 */
export async function fetchProductById(id: number): Promise<Product> {
  const product = await getProduct(id);
  return normalizeProduct(product);
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
    products: response.products.map(normalizeProduct),
    total: response.total,
  };
}

/**
 * Fetch all available product categories
 *
 * @returns List of category names
 */
export async function fetchCategories(): Promise<string[]> {
  return getCategories();
}

/**
 * Fetch products by category
 *
 * @param category - Category name
 * @returns Products in category
 */
export async function fetchProductsByCategory(category: string): Promise<{ products: Product[]; total: number }> {
  const response = await getProductsByCategory(category);

  return {
    products: response.products.map(normalizeProduct),
    total: response.total,
  };
}

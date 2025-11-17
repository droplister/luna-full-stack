/**
 * Server-Side Product Data Fetching
 * Functions for fetching product data in Server Components
 */

import type { Product } from '@/lib/types/products'
import { extractIdFromSlug } from '@/utils/slugify'
import { fetchProductById, fetchAllCategoryProducts } from '@/lib/services/products'

/**
 * Fetch a single product by ID or slug (server-side)
 * Used in generateMetadata and Server Components
 */
export async function getProduct(idOrSlug: string | number): Promise<Product | null> {
  try {
    const id = typeof idOrSlug === 'string' ? extractIdFromSlug(idOrSlug) : idOrSlug

    if (!id || id <= 0) {
      return null
    }

    // Fetch directly from service layer to avoid HTTP self-referencing during build
    const product = await fetchProductById(id)
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Fetch all products (server-side)
 * Used for generating static params
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    // Fetch directly from service layer to avoid HTTP self-referencing during build
    const { products } = await fetchAllCategoryProducts()
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

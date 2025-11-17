/**
 * Server-Side Product Data Fetching
 * Functions for fetching product data in Server Components
 */

import type { Product } from '@/lib/types/products'
import { extractIdFromSlug } from '@/utils/slugify'
import { cacheConfig } from '@/lib/config'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

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

    const response = await fetch(`${API_BASE}/api/products/${id}`, {
      next: { revalidate: cacheConfig.products.detail }, // ISR: 1-minute cache
    })

    if (!response.ok) {
      console.error(`Failed to fetch product ${id}: ${response.status}`)
      return null
    }

    const product = await response.json()
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
    const response = await fetch(`${API_BASE}/api/products`, {
      next: { revalidate: cacheConfig.products.list }, // ISR: 1-minute cache
    })

    if (!response.ok) {
      console.error(`Failed to fetch products: ${response.status}`)
      return []
    }

    const products = await response.json()
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

/**
 * Static Params Generation
 * Utilities for generating static paths at build time (SSG/ISR)
 */

import { generateProductSlug } from '@/lib/utils/slugify'
import type { Product } from '@/lib/types/products'

/**
 * Generate static params for all product pages
 * Used by generateStaticParams in app/products/[id]/page.tsx
 *
 * @returns Array of params objects with slug-based IDs
 */
export async function generateProductStaticParams() {
  try {
    // Determine the API URL based on environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    // Fetch all products from the API
    const response = await fetch(`${apiUrl}/api/products`, {
      // Disable caching during build to get fresh data
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = await response.json()
    const products: Product[] = data.products || []

    // Generate slug-based params for each product
    return products.map((product) => ({
      id: generateProductSlug(product),
    }))
  } catch (error) {
    console.error('Error generating product static params:', error)
    // Return empty array if fetch fails - pages will be generated on-demand via ISR
    return []
  }
}

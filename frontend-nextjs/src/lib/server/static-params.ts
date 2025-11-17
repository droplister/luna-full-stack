/**
 * Static Params Generation
 * Utilities for generating static paths at build time (SSG/ISR)
 */

import { generateProductSlug } from '@/utils/slugify'
import type { Product } from '@/lib/types/products'
import { fetchAllCategoryProducts } from '@/lib/services/products'

/**
 * Generate static params for all product pages
 * Used by generateStaticParams in app/products/[id]/page.tsx
 *
 * @returns Array of params objects with slug-based IDs
 */
export async function generateProductStaticParams() {
  try {
    // Fetch all products directly from service layer
    // This avoids HTTP self-referencing during build time
    const { products } = await fetchAllCategoryProducts()

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

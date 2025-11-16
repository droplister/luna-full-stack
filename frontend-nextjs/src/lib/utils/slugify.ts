/**
 * Slugify utilities for generating URL-friendly product handles
 */

import type { Product } from '@/lib/types/products'

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns URL-safe slug in lowercase with hyphens
 *
 * @example
 * slugify("Essence Mascara Lash Princess") // "essence-mascara-lash-princess"
 * slugify("Royal Canin Size Health Nutrition Medium Puppy (4 kg)") // "royal-canin-size-health-nutrition-medium-puppy-4-kg"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/--+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a compound product slug with ID suffix for uniqueness
 * Format: {title-slug}-{id}
 *
 * @param product - The product object
 * @returns Compound slug like "magic-wand-deluxe-42"
 *
 * @example
 * generateProductSlug({ id: 1, title: "Essence Mascara" }) // "essence-mascara-1"
 */
export function generateProductSlug(product: Product): string {
  const titleSlug = slugify(product.title)
  return `${titleSlug}-${product.id}`
}

/**
 * Generate a product URL path
 * @param product - The product object
 * @returns Full URL path like "/products/essence-mascara-1"
 */
export function getProductUrl(product: Product): string {
  return `/products/${generateProductSlug(product)}`
}

/**
 * Generate a product URL from just ID and title
 * Useful when you don't have the full product object (e.g., cart items)
 *
 * @param id - Product ID
 * @param title - Product title
 * @returns Full URL path like "/products/essence-mascara-1"
 */
export function getProductUrlFromIdAndTitle(id: number, title: string): string {
  const titleSlug = slugify(title)
  return `/products/${titleSlug}-${id}`
}

/**
 * Extract product ID from a slug parameter
 * Handles both formats:
 * - Numeric ID: "42" → 42
 * - Compound slug: "magic-wand-deluxe-42" → 42
 *
 * @param slug - The URL slug parameter
 * @returns Product ID number, or null if invalid
 *
 * @example
 * extractIdFromSlug("42") // 42
 * extractIdFromSlug("essence-mascara-lash-princess-1") // 1
 * extractIdFromSlug("invalid") // null
 */
export function extractIdFromSlug(slug: string): number | null {
  // Try parsing as plain number first (backward compatibility)
  // Only treat as plain number if the ENTIRE string is numeric
  if (/^\d+$/.test(slug)) {
    const plainId = parseInt(slug, 10)
    if (plainId > 0) {
      return plainId
    }
  }

  // Extract ID from compound slug (last segment after final hyphen)
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  const id = parseInt(lastPart, 10)

  if (!isNaN(id) && id > 0) {
    return id
  }

  return null
}

/**
 * Format Utilities
 * Helpers for formatting strings, numbers, etc.
 */

/**
 * Convert kebab-case to Title Case
 * @example kebabToTitleCase('beauty') => 'Beauty'
 * @example kebabToTitleCase('womens-dresses') => 'Womens Dresses'
 * @example kebabToTitleCase('womens-bags') => 'Womens Bags'
 */
export function kebabToTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format category slug to display name
 * Uses categoryDisplayNames if available, otherwise converts kebab-case
 */
export function formatCategory(slug: string): string {
  // Try to use the display name from brand config first
  // This allows for custom formatting like "Jewellery" instead of "Womens Jewellery"
  return kebabToTitleCase(slug)
}

/**
 * Format price in cents to dollars
 * @example formatPrice(999) => '$9.99'
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Format price in dollars
 * @example formatDollars(9.99) => '$9.99'
 */
export function formatDollars(dollars: number): string {
  return `$${dollars.toFixed(2)}`
}

/**
 * Convert string to Title Case
 * @example toTitleCase('hello world') => 'Hello World'
 * @example toTitleCase('beauty') => 'Beauty'
 */
export function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

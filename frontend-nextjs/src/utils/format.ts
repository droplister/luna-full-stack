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
 * Convert price from cents to dollars
 * @example centsToDollars(999) => 9.99
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Format price in cents to currency string
 * @example formatPrice(999) => '$9.99'
 * @example formatPrice(999, 'EUR') => '€9.99'
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  const dollars = centsToDollars(cents)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars)
}

/**
 * Format price in dollars to currency string
 * @example formatDollars(9.99) => '$9.99'
 * @example formatDollars(9.99, 'EUR') => '€9.99'
 */
export function formatDollars(dollars: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars)
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

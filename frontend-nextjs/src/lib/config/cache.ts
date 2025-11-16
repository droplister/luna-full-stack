/**
 * Cache & Revalidation Configuration
 * Centralized cache settings for ISR, data fetching, and API responses
 */

/**
 * Next.js ISR (Incremental Static Regeneration) settings
 * Values in seconds
 */
export const cacheConfig = {
  /**
   * Product Data Caching
   */
  products: {
    /**
     * Single product detail page revalidation
     * 60 seconds (1 minute) - frequent updates for stock/price changes
     */
    detail: 60,

    /**
     * Product list/catalog revalidation
     * 60 seconds (1 minute) - unified with detail for consistency
     */
    list: 60,

    /**
     * Related products revalidation
     * 60 seconds (1 minute) - should match product detail timing
     */
    related: 60,
  },

  /**
   * Collection/Category Data Caching
   */
  collections: {
    /**
     * Collection detail page revalidation
     * 60 seconds (1 minute) - unified with products
     */
    detail: 60,

    /**
     * Collections list revalidation
     * 60 seconds (1 minute) - unified with products
     */
    list: 60,
  },

  /**
   * Static Content Caching
   */
  static: {
    /**
     * CMS content revalidation
     * 900 seconds (15 minutes) - static content changes less frequently
     */
    cms: 900,

    /**
     * Site configuration revalidation
     * 3600 seconds (1 hour) - very stable data
     */
    config: 3600,
  },

  /**
   * Dynamic/No-Cache Settings
   */
  dynamic: {
    /**
     * Cart operations (always fresh)
     * No caching to ensure real-time cart state
     */
    cart: 'no-store' as const,

    /**
     * User session data (always fresh)
     * No caching for security and accuracy
     */
    session: 'no-store' as const,

    /**
     * Checkout data (always fresh)
     * No caching to ensure accurate pricing and availability
     */
    checkout: 'no-store' as const,

    /**
     * Build-time static params generation (always fresh)
     * No caching to get latest products for static generation
     */
    buildTime: 'no-store' as const,
  },
} as const

export type CacheConfig = typeof cacheConfig

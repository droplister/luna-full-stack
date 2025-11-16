/**
 * Cart & Checkout Configuration
 * Centralized settings for cart, checkout, and shipping
 */

export const cartConfig = {
  /**
   * Shipping Configuration
   */
  shipping: {
    // Flat rate shipping cost in cents
    flatRate: 1000, // $10.00

    // Free shipping threshold in cents
    freeShippingThreshold: 10000, // $100.00
  },

  /**
   * Free Shipping Promotion
   * Shows progress bar in cart drawer
   */
  freeShippingPromo: {
    // Enable/disable the free shipping promotion banner
    enabled: true,

    // Threshold for free shipping (should match shipping.freeShippingThreshold)
    threshold: 10000, // $100.00
  },

  /**
   * Tax Configuration
   */
  tax: {
    // Tax rate as a decimal (13% = 0.13)
    rate: 0.13,
  },
} as const

/**
 * Calculate shipping cost based on subtotal
 * @param subtotalInCents - Order subtotal in cents
 * @returns Shipping cost in cents (0 if free shipping applies)
 */
export function calculateShipping(subtotalInCents: number): number {
  if (subtotalInCents >= cartConfig.shipping.freeShippingThreshold) {
    return 0
  }
  return cartConfig.shipping.flatRate
}

/**
 * Calculate tax based on subtotal and shipping
 * @param subtotalInCents - Order subtotal in cents
 * @param shippingInCents - Shipping cost in cents
 * @returns Tax amount in cents
 */
export function calculateTax(subtotalInCents: number, shippingInCents: number): number {
  return Math.round((subtotalInCents + shippingInCents) * cartConfig.tax.rate)
}

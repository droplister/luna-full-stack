/**
 * Promotions Configuration
 * Marketing messages, promo codes, and promotional content
 */

/**
 * Discount Code Settings
 */
export const discountCode = {
  // The promo code to reveal
  code: 'EXPECTO-20',

  // Discount percentage (0-100)
  percentage: 20,

  // Expiry date (null = no expiry)
  expiresAt: null as Date | null,

  // Minimum order amount in cents (null = no minimum)
  minimumOrder: null as number | null,

  // Description shown in modal
  description: 'Get 20% Off!',
}

/**
 * Revelio Modal Messaging
 */
export const revelioMessages = {
  // Text before code is revealed
  preReveal: 'Click and hold to scratch the charm and reveal your offer.',

  // Text after code is revealed
  postReveal: 'Oh, Nargles... you found it!',

  // Helper text
  helperText: 'Copy and use at checkout.',
}

/**
 * Promo Bar Configuration
 */
export const promoBar = {
  // Promo bar message
  message: '✨ Magical things happen to orders over $100',
}

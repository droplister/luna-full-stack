/**
 * Promo Code Configuration
 * Settings for the Revelio scratch-off discount feature
 */

export const promoConfig = {
  /**
   * Revelio Feature Toggle
   */
  revelio: {
    // Enable/disable the Revelio scratch-off modal
    enabled: true,

    // Show modal automatically on first visit
    showOnFirstVisit: true,

    // LocalStorage key to track if user has revealed the code
    storageKey: 'luna-revelio-revealed',
  },

  /**
   * Discount Code Settings
   */
  discount: {
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
  },

  /**
   * Scratch Card Settings
   */
  scratchCard: {
    // Height of scratch area in pixels
    height: 220,

    // Brush radius in pixels
    brushRadius: 24,

    // Percent of area that must be cleared before auto-reveal (0-1)
    revealThreshold: 0.6,
  },

  /**
   * Messaging
   */
  messages: {
    // Text before code is revealed
    preReveal: 'Click and hold to scratch the charm and reveal your offer.',

    // Text after code is revealed
    postReveal: 'Oh, Nargles... you found it!',

    // Helper text
    helperText: 'Copy and use at checkout.',
  },
} as const

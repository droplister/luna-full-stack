/**
 * Feature Flags & Technical Settings
 * Controls feature availability and technical behavior
 */

export const features = {
  /**
   * Revelio Feature Toggle
   */
  revelio: {
    // Enable/disable the Revelio scratch-off modal
    enabled: true,

    // Show modal automatically on first visit
    showOnFirstVisit: true,
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
   * Promo Bar Feature Toggle
   */
  promoBar: {
    // Enable/disable the promo bar
    enabled: true,
  },
} as const

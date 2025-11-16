/**
 * Z-Index Configuration
 * Centralized z-index values to maintain consistent layering across the application
 */

export const Z_INDEX = {
  // Base layer - clickable overlays and links
  PRODUCT_OVERLAY: 10,
  SEARCH_MODAL_INNER: 10,
  MEGA_MENU_FEATURED_LINK: 10,

  // Interactive elements above overlays
  ADD_TO_CART_BUTTON: 20,

  // Navigation - must be above all product elements
  DROPDOWN_INDICATOR: 30,
  DROPDOWN_PANEL: 35,

  // Modal dialogs
  MOBILE_DIALOG: 40,
  MOBILE_MENU: 40,
  MOBILE_FILTERS: 40,

  // Cart drawer - higher than mobile dialogs so it can overlay them
  CART_DRAWER: 45,

  // Top layer - search/command palettes and promo modals (highest priority)
  SEARCH_MODAL: 50,
  REVELIO_MODAL: 50,
} as const

export type ZIndex = typeof Z_INDEX[keyof typeof Z_INDEX]

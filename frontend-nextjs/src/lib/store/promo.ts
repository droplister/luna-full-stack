/**
 * Zustand Promo Store
 * State management for Revelio promo code feature
 */

import { create } from 'zustand';

/**
 * Promo Store State Interface
 * Exported for testing and type inference
 */
export interface PromoState {
  // UI state
  isRevelioOpen: boolean;

  // Promo code state
  activePromoCode: string | null;

  // Actions
  openRevelio: () => void;
  closeRevelio: () => void;
  setPromoCode: (code: string) => void;
  clearPromoCode: () => void;
}

export const usePromoStore = create<PromoState>((set) => ({
  // Initial state
  isRevelioOpen: false,
  activePromoCode: null,

  // Open Revelio modal
  openRevelio: () => set({ isRevelioOpen: true }),

  // Close Revelio modal
  closeRevelio: () => set({ isRevelioOpen: false }),

  // Set active promo code
  setPromoCode: (code: string) => set({ activePromoCode: code }),

  // Clear promo code
  clearPromoCode: () => set({ activePromoCode: null }),
}));

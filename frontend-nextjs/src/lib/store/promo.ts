/**
 * Zustand Promo Store
 * State management for Revelio promo code feature
 */

import { create } from 'zustand';
import { promoConfig } from '../config/promo';

interface PromoState {
  // UI state
  isRevelioOpen: boolean;
  hasRevealed: boolean;

  // Promo code state
  activePromoCode: string | null;

  // Actions
  openRevelio: () => void;
  closeRevelio: () => void;
  markAsRevealed: () => void;
  setPromoCode: (code: string) => void;
  clearPromoCode: () => void;
  initializeFromStorage: () => void;
}

export const usePromoStore = create<PromoState>((set) => ({
  // Initial state
  isRevelioOpen: false,
  hasRevealed: false,
  activePromoCode: null,

  // Open Revelio modal
  openRevelio: () => set({ isRevelioOpen: true }),

  // Close Revelio modal
  closeRevelio: () => set({ isRevelioOpen: false }),

  // Mark as revealed and save to localStorage
  markAsRevealed: () => {
    set({ hasRevealed: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem(promoConfig.revelio.storageKey, 'true');
    }
  },

  // Set active promo code
  setPromoCode: (code: string) => set({ activePromoCode: code }),

  // Clear promo code
  clearPromoCode: () => set({ activePromoCode: null }),

  // Initialize from localStorage
  initializeFromStorage: () => {
    if (typeof window !== 'undefined') {
      const revealed = localStorage.getItem(promoConfig.revelio.storageKey);
      if (revealed === 'true') {
        set({ hasRevealed: true });
      }
    }
  },
}));

/**
 * Unit tests for Cart Service Layer
 */

import { centsToDollars, formatPrice } from '../cart';

describe('Cart Service - Utility Functions', () => {
  describe('centsToDollars', () => {
    it('should convert cents to dollars correctly', () => {
      expect(centsToDollars(999)).toBe(9.99);
      expect(centsToDollars(1000)).toBe(10.00);
      expect(centsToDollars(0)).toBe(0);
      expect(centsToDollars(1)).toBe(0.01);
    });

    it('should handle large amounts', () => {
      expect(centsToDollars(999999)).toBe(9999.99);
    });

    it('should handle negative amounts', () => {
      expect(centsToDollars(-500)).toBe(-5.00);
    });
  });

  describe('formatPrice', () => {
    it('should format USD prices correctly', () => {
      expect(formatPrice(999, 'USD')).toBe('$9.99');
      expect(formatPrice(1000, 'USD')).toBe('$10.00');
      expect(formatPrice(0, 'USD')).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      expect(formatPrice(999, 'EUR')).toContain('9.99');
      expect(formatPrice(999, 'GBP')).toContain('9.99');
    });

    it('should use USD as default currency', () => {
      expect(formatPrice(999)).toBe('$9.99');
    });

    it('should round correctly', () => {
      expect(formatPrice(999, 'USD')).toBe('$9.99');
      expect(formatPrice(1234, 'USD')).toBe('$12.34');
    });
  });
});

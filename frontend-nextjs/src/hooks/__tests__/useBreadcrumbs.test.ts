/**
 * useBreadcrumbs Hook Tests
 * Tests for dynamic breadcrumb generation based on routes
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBreadcrumbs } from '../useBreadcrumbs';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock CMS module
vi.mock('../../lib/cms/categories', () => ({
  categoryDisplayNames: {
    'tops': 'Tops',
    'womens-dresses': 'Dresses',
    'fragrances': 'Fragrances',
    'beauty': 'Beauty',
  },
  getCategorySection: (slug: string) => {
    const sections: Record<string, string> = {
      'tops': 'Clothing',
      'womens-dresses': 'Clothing',
      'fragrances': 'Potions',
      'beauty': 'Potions',
    };
    return sections[slug] || 'Products';
  },
}));

// Mock format utility
vi.mock('../../utils/format', () => ({
  kebabToTitleCase: (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
}));

describe('useBreadcrumbs Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Home Route', () => {
    it('should return only Home breadcrumb for home page', () => {
      mockPathname.mockReturnValue('/');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
      ]);
    });
  });

  describe('Products Listing Route', () => {
    it('should return Home and Shop All for /products', () => {
      mockPathname.mockReturnValue('/products');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
      ]);
    });
  });

  describe('Product Detail Route', () => {
    it('should return Home and Shop All for product detail without category', () => {
      mockPathname.mockReturnValue('/products/123');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
      ]);
    });

    it('should include category breadcrumb when productCategory is provided', () => {
      mockPathname.mockReturnValue('/products/123');

      const { result } = renderHook(() =>
        useBreadcrumbs({ productCategory: 'tops' })
      );

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
        { name: 'Tops', href: '/collections/tops' },
      ]);
    });

    it('should use display name from categoryDisplayNames', () => {
      mockPathname.mockReturnValue('/products/456');

      const { result } = renderHook(() =>
        useBreadcrumbs({ productCategory: 'womens-dresses' })
      );

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
        { name: 'Dresses', href: '/collections/womens-dresses' },
      ]);
    });

    it('should format category slug if not in categoryDisplayNames', () => {
      mockPathname.mockReturnValue('/products/789');

      const { result } = renderHook(() =>
        useBreadcrumbs({ productCategory: 'custom-category' })
      );

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
        { name: 'Custom Category', href: '/collections/custom-category' },
      ]);
    });
  });

  describe('Collection Route', () => {
    it('should return breadcrumbs with section name for collection', () => {
      mockPathname.mockReturnValue('/collections/tops');

      const { result } = renderHook(() =>
        useBreadcrumbs({ categorySlug: 'tops' })
      );

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
        { name: 'Clothing' },
      ]);
    });

    it('should handle fragrances collection with Potions section', () => {
      mockPathname.mockReturnValue('/collections/fragrances');

      const { result } = renderHook(() =>
        useBreadcrumbs({ categorySlug: 'fragrances' })
      );

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
        { name: 'Potions' },
      ]);
    });

    it('should return default breadcrumbs if no categorySlug provided', () => {
      mockPathname.mockReturnValue('/collections/something');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
      ]);
    });
  });

  describe('Other Routes', () => {
    it('should return only Home breadcrumb for unrecognized routes', () => {
      mockPathname.mockReturnValue('/about');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
      ]);
    });

    it('should return only Home breadcrumb for cart route', () => {
      mockPathname.mockReturnValue('/cart');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options object', () => {
      mockPathname.mockReturnValue('/products');

      const { result } = renderHook(() => useBreadcrumbs({}));

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
      ]);
    });

    it('should handle undefined options', () => {
      mockPathname.mockReturnValue('/products');

      const { result } = renderHook(() => useBreadcrumbs());

      expect(result.current).toEqual([
        { name: 'Home', href: '/' },
        { name: 'Shop All', href: '/products' },
      ]);
    });

    it('should always include Home as first breadcrumb', () => {
      const testRoutes = [
        '/',
        '/products',
        '/products/123',
        '/collections/tops',
        '/cart',
        '/checkout',
      ];

      testRoutes.forEach((route) => {
        mockPathname.mockReturnValue(route);
        const { result } = renderHook(() => useBreadcrumbs());

        expect(result.current[0]).toEqual({ name: 'Home', href: '/' });
      });
    });
  });

  describe('Breadcrumb href Consistency', () => {
    it('should have href for navigable breadcrumbs', () => {
      mockPathname.mockReturnValue('/products/123');

      const { result } = renderHook(() =>
        useBreadcrumbs({ productCategory: 'tops' })
      );

      // Home should have href
      expect(result.current[0].href).toBe('/');
      // Shop All should have href
      expect(result.current[1].href).toBe('/products');
      // Category should have href
      expect(result.current[2].href).toBe('/collections/tops');
    });

    it('should not have href for current page (section)', () => {
      mockPathname.mockReturnValue('/collections/tops');

      const { result } = renderHook(() =>
        useBreadcrumbs({ categorySlug: 'tops' })
      );

      // Section name (last breadcrumb) should not have href (current page)
      const lastBreadcrumb = result.current[result.current.length - 1];
      expect(lastBreadcrumb.name).toBe('Clothing');
      expect(lastBreadcrumb.href).toBeUndefined();
    });
  });
});

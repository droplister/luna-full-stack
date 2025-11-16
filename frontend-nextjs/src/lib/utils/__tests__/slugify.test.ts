/**
 * Tests for slugify utilities
 */

import { describe, it, expect } from 'vitest'
import {
  slugify,
  generateProductSlug,
  getProductUrl,
  getProductUrlFromIdAndTitle,
  extractIdFromSlug,
} from '../slugify'
import type { Product } from '@/lib/types/products'

describe('slugify', () => {
  it('converts text to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('replaces underscores with hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
    expect(slugify('test (item)')).toBe('test-item')
  })

  it('replaces multiple hyphens with single hyphen', () => {
    expect(slugify('hello---world')).toBe('hello-world')
  })

  it('removes leading and trailing hyphens', () => {
    expect(slugify('-hello-world-')).toBe('hello-world')
  })

  it('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('handles complex product titles', () => {
    expect(slugify('Essence Mascara Lash Princess')).toBe('essence-mascara-lash-princess')
    expect(slugify('Royal Canin Size Health Nutrition Medium Puppy (4 kg)')).toBe(
      'royal-canin-size-health-nutrition-medium-puppy-4-kg'
    )
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('generateProductSlug', () => {
  it('generates slug with ID suffix', () => {
    const product: Product = {
      id: 1,
      title: 'Essence Mascara',
    } as Product

    expect(generateProductSlug(product)).toBe('essence-mascara-1')
  })

  it('handles products with special characters in title', () => {
    const product: Product = {
      id: 42,
      title: 'Magic Wand (Deluxe Edition)',
    } as Product

    expect(generateProductSlug(product)).toBe('magic-wand-deluxe-edition-42')
  })

  it('handles products with numeric IDs of various lengths', () => {
    expect(
      generateProductSlug({
        id: 1,
        title: 'Test',
      } as Product)
    ).toBe('test-1')

    expect(
      generateProductSlug({
        id: 999,
        title: 'Test',
      } as Product)
    ).toBe('test-999')

    expect(
      generateProductSlug({
        id: 12345,
        title: 'Test',
      } as Product)
    ).toBe('test-12345')
  })
})

describe('getProductUrl', () => {
  it('generates full product URL path', () => {
    const product: Product = {
      id: 1,
      title: 'Essence Mascara',
    } as Product

    expect(getProductUrl(product)).toBe('/products/essence-mascara-1')
  })

  it('handles complex titles', () => {
    const product: Product = {
      id: 42,
      title: 'Royal Canin Size Health Nutrition',
    } as Product

    expect(getProductUrl(product)).toBe('/products/royal-canin-size-health-nutrition-42')
  })
})

describe('getProductUrlFromIdAndTitle', () => {
  it('generates URL from ID and title', () => {
    expect(getProductUrlFromIdAndTitle(1, 'Essence Mascara')).toBe('/products/essence-mascara-1')
  })

  it('handles special characters in title', () => {
    expect(getProductUrlFromIdAndTitle(42, 'Magic Wand (Deluxe)')).toBe('/products/magic-wand-deluxe-42')
  })
})

describe('extractIdFromSlug', () => {
  describe('plain numeric IDs', () => {
    it('extracts plain numeric ID', () => {
      expect(extractIdFromSlug('42')).toBe(42)
    })

    it('handles single digit IDs', () => {
      expect(extractIdFromSlug('1')).toBe(1)
    })

    it('handles large numeric IDs', () => {
      expect(extractIdFromSlug('99999')).toBe(99999)
    })
  })

  describe('compound slugs', () => {
    it('extracts ID from compound slug', () => {
      expect(extractIdFromSlug('essence-mascara-lash-princess-1')).toBe(1)
    })

    it('handles multi-digit IDs in compound slugs', () => {
      expect(extractIdFromSlug('magic-wand-deluxe-42')).toBe(42)
      expect(extractIdFromSlug('product-name-999')).toBe(999)
    })

    it('handles single-word slugs with ID', () => {
      expect(extractIdFromSlug('mascara-1')).toBe(1)
    })
  })

  describe('invalid inputs', () => {
    it('returns null for invalid slugs', () => {
      expect(extractIdFromSlug('invalid')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(extractIdFromSlug('')).toBeNull()
    })

    it('returns null for zero', () => {
      expect(extractIdFromSlug('0')).toBeNull()
    })

    it('extracts ID from edge case formats', () => {
      // "-1" splits to ["", "1"] - extracts the valid ID "1"
      // This is acceptable behavior as it's an edge case format
      expect(extractIdFromSlug('-1')).toBe(1)
      // "product--1" splits to ["product", "", "1"] - extracts "1"
      expect(extractIdFromSlug('product--1')).toBe(1)
    })

    it('returns null for slugs ending with non-numeric characters', () => {
      expect(extractIdFromSlug('product-name-abc')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('handles slugs with numbers in the middle', () => {
      // Should extract the last number
      expect(extractIdFromSlug('product-123-name-456')).toBe(456)
    })

    it('handles slugs with hyphens in various positions', () => {
      expect(extractIdFromSlug('a-b-c-1')).toBe(1)
      expect(extractIdFromSlug('single-1')).toBe(1)
    })
  })
})

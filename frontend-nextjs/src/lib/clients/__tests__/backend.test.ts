/**
 * Unit tests for Backend Client
 * Tests cookie forwarding and API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCart, addToCart, updateCartLine, removeCartLine } from '../backend'
import * as upstream from '../upstream'

// Mock the upstream fetchJsonWithHeaders function
vi.mock('../upstream', () => ({
  fetchJsonWithHeaders: vi.fn(),
}))

describe('Backend Client', () => {
  const mockFetchJson = vi.mocked(upstream.fetchJsonWithHeaders)

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variable
    vi.stubEnv('NEXT_PUBLIC_BACKEND_BASE_URL', 'http://backend-php.test/api')
  })

  describe('getCart', () => {
    it('should call backend API without cookie header', async () => {
      const mockCart = { items: [], subtotal: 0, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const result = await getCart()

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/cart'),
        expect.objectContaining({
          cache: 'no-store',
        })
      )
      expect(result.data).toEqual(mockCart)
    })

    it('should forward cookie header when provided', async () => {
      const mockCart = { items: [], subtotal: 0, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const cookieHeader = 'ci_session=abc123'
      await getCart(cookieHeader)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/cart'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cookie': cookieHeader,
          }),
          cache: 'no-store',
        })
      )
    })
  })

  describe('addToCart', () => {
    it('should send POST request with product data', async () => {
      const mockCart = { items: [], subtotal: 999, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const request = {
        product_id: 1,
        quantity: 2,
        title: 'Test Product',
        price: 9.99,
      }

      const result = await addToCart(request)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.stringContaining('/cart/add'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
          cache: 'no-store',
        })
      )
      expect(result.data).toEqual(mockCart)
    })

    it('should forward cookie header', async () => {
      const mockCart = { items: [], subtotal: 999, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const request = {
        product_id: 1,
        quantity: 1,
        title: 'Test',
        price: 9.99,
      }
      const cookieHeader = 'ci_session=xyz789'

      await addToCart(request, cookieHeader)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cookie': cookieHeader,
          }),
        })
      )
    })
  })

  describe('updateCartLine', () => {
    it('should send PUT request with line ID and quantity', async () => {
      const mockCart = { items: [], subtotal: 0, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const lineId = 'c4ca4238a0b923820dcc509a6f75849b'
      const quantity = 3

      const result = await updateCartLine(lineId, quantity)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.stringContaining(`/cart/update/${lineId}`),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        })
      )
      expect(result.data).toEqual(mockCart)
    })

    it('should forward cookie header', async () => {
      const mockCart = { items: [], subtotal: 0, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const cookieHeader = 'ci_session=test123'
      await updateCartLine('line123', 2, cookieHeader)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cookie': cookieHeader,
          }),
        })
      )
    })
  })

  describe('removeCartLine', () => {
    it('should send DELETE request with line ID', async () => {
      const mockCart = { items: [], subtotal: 0, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const lineId = 'c4ca4238a0b923820dcc509a6f75849b'
      const result = await removeCartLine(lineId)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.stringContaining(`/cart/remove/${lineId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result.data).toEqual(mockCart)
    })

    it('should forward cookie header', async () => {
      const mockCart = { items: [], subtotal: 0, currency: 'USD' }
      const mockHeaders = new Headers()
      mockFetchJson.mockResolvedValueOnce({ data: mockCart, headers: mockHeaders })

      const cookieHeader = 'ci_session=remove123'
      await removeCartLine('line456', cookieHeader)

      expect(mockFetchJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cookie': cookieHeader,
          }),
        })
      )
    })
  })
})

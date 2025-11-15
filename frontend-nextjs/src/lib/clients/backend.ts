/**
 * Backend PHP Cart API Client
 * Communicates with the CodeIgniter 4 cart API
 */

import { fetchJsonWithHeaders, type FetchResult } from './upstream';
import type { Cart, AddToCartRequest, UpdateCartLineRequest } from '../types/cart';

// Base URL from environment variable, fallback to localhost
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8080/api';

/**
 * Helper to get headers with optional cookie forwarding
 */
function getHeaders(cookieHeader?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  return headers;
}

/**
 * Fetch current cart state
 *
 * @param cookieHeader - Optional cookie header to forward from browser
 * @returns Current cart with items, subtotal, and response headers
 */
export async function getCart(cookieHeader?: string): Promise<FetchResult<Cart>> {
  return fetchJsonWithHeaders<Cart>(`${BASE_URL}/cart`, {
    headers: cookieHeader ? getHeaders(cookieHeader) : undefined,
    cache: 'no-store',
  });
}

/**
 * Add item to cart or update quantity if already exists
 *
 * @param request - Product details and quantity
 * @param cookieHeader - Optional cookie header to forward from browser
 * @returns Updated cart state and response headers
 */
export async function addToCart(request: AddToCartRequest, cookieHeader?: string): Promise<FetchResult<Cart>> {
  return fetchJsonWithHeaders<Cart>(`${BASE_URL}/cart/add`, {
    method: 'POST',
    headers: getHeaders(cookieHeader),
    body: JSON.stringify(request),
    cache: 'no-store',
  });
}

/**
 * Update quantity for a specific cart line item
 *
 * @param lineId - MD5 hash line ID
 * @param quantity - New quantity (0 or negative will remove item)
 * @param cookieHeader - Optional cookie header to forward from browser
 * @returns Updated cart state and response headers
 */
export async function updateCartLine(
  lineId: string,
  quantity: number,
  cookieHeader?: string
): Promise<FetchResult<Cart>> {
  const request: UpdateCartLineRequest = { quantity };

  return fetchJsonWithHeaders<Cart>(`${BASE_URL}/cart/update/${lineId}`, {
    method: 'PUT',
    headers: getHeaders(cookieHeader),
    body: JSON.stringify(request),
    cache: 'no-store',
  });
}

/**
 * Remove a line item from cart
 *
 * @param lineId - MD5 hash line ID
 * @param cookieHeader - Optional cookie header to forward from browser
 * @returns Updated cart state and response headers
 */
export async function removeCartLine(lineId: string, cookieHeader?: string): Promise<FetchResult<Cart>> {
  return fetchJsonWithHeaders<Cart>(`${BASE_URL}/cart/remove/${lineId}`, {
    method: 'DELETE',
    headers: cookieHeader ? getHeaders(cookieHeader) : undefined,
    cache: 'no-store',
  });
}

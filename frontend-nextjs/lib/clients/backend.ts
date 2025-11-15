/**
 * Backend PHP Cart API Client
 * Communicates with the CodeIgniter 4 cart API
 */

import { fetchJson } from './upstream';
import type { Cart, AddToCartRequest, UpdateCartLineRequest } from '../types/cart';

// Base URL from environment variable, fallback to localhost
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8080/api';

/**
 * Fetch current cart state
 *
 * @returns Current cart with items and subtotal
 */
export async function getCart(): Promise<Cart> {
  return fetchJson<Cart>(`${BASE_URL}/cart`, {
    cache: 'no-store',
    credentials: 'include', // Important: include cookies for session
  });
}

/**
 * Add item to cart or update quantity if already exists
 *
 * @param request - Product details and quantity
 * @returns Updated cart state
 */
export async function addToCart(request: AddToCartRequest): Promise<Cart> {
  return fetchJson<Cart>(`${BASE_URL}/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    cache: 'no-store',
    credentials: 'include',
  });
}

/**
 * Update quantity for a specific cart line item
 *
 * @param lineId - MD5 hash line ID
 * @param quantity - New quantity (0 or negative will remove item)
 * @returns Updated cart state
 */
export async function updateCartLine(
  lineId: string,
  quantity: number
): Promise<Cart> {
  const request: UpdateCartLineRequest = { quantity };

  return fetchJson<Cart>(`${BASE_URL}/cart/update/${lineId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    cache: 'no-store',
    credentials: 'include',
  });
}

/**
 * Remove a line item from cart
 *
 * @param lineId - MD5 hash line ID
 * @returns Updated cart state
 */
export async function removeCartLine(lineId: string): Promise<Cart> {
  return fetchJson<Cart>(`${BASE_URL}/cart/remove/${lineId}`, {
    method: 'DELETE',
    cache: 'no-store',
    credentials: 'include',
  });
}

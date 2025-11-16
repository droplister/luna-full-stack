/**
 * Cart Service Layer
 * Domain operations for cart management
 */

import { getCart, addToCart, updateCartLine, removeCartLine } from '../clients/backend';
import type { FetchResult } from '../clients/upstream';
import type { Cart, AddToCartRequest } from '../types/cart';
import type { Product } from '../types/products';

/**
 * Fetch current cart state
 * @param cookieHeader - Optional cookie header to forward to backend
 */
export async function fetchCart(cookieHeader?: string): Promise<FetchResult<Cart>> {
  return getCart(cookieHeader);
}

/**
 * Add product to cart (converts price from dollars to cents)
 *
 * @param product - Product to add
 * @param quantity - Quantity to add
 * @param cookieHeader - Optional cookie header to forward to backend
 * @returns Updated cart state and headers
 */
export async function addProductToCart(product: Product, quantity: number = 1, cookieHeader?: string): Promise<FetchResult<Cart>> {
  const request: AddToCartRequest = {
    product_id: product.id,
    quantity,
    title: product.title,
    price: product.price, // Backend will convert to cents
    stock: product.stock,
    image: product.thumbnail,
    brand: product.brand,
    category: product.category,
    sku: product.sku,
  };

  return addToCart(request, cookieHeader);
}

/**
 * Update quantity for a cart line item
 *
 * @param lineId - Line item ID (MD5 hash)
 * @param quantity - New quantity
 * @param cookieHeader - Optional cookie header to forward to backend
 * @returns Updated cart state and headers
 */
export async function updateCartItemQuantity(lineId: string, quantity: number, cookieHeader?: string): Promise<FetchResult<Cart>> {
  return updateCartLine(lineId, quantity, cookieHeader);
}

/**
 * Remove item from cart
 *
 * @param lineId - Line item ID (MD5 hash)
 * @param cookieHeader - Optional cookie header to forward to backend
 * @returns Updated cart state and headers
 */
export async function removeCartItem(lineId: string, cookieHeader?: string): Promise<FetchResult<Cart>> {
  return removeCartLine(lineId, cookieHeader);
}

/**
 * Helper: Convert price from cents to dollars for display
 *
 * @param cents - Price in cents
 * @returns Price in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Helper: Format price for display
 *
 * @param cents - Price in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  const dollars = centsToDollars(cents);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars);
}

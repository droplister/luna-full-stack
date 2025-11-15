/**
 * Cart Service Layer
 * Domain operations for cart management
 */

import { getCart, addToCart, updateCartLine, removeCartLine } from '../clients/backend';
import type { Cart, AddToCartRequest } from '../types/cart';
import type { Product } from '../types/products';

/**
 * Fetch current cart state
 */
export async function fetchCart(): Promise<Cart> {
  return getCart();
}

/**
 * Add product to cart (converts price from dollars to cents)
 *
 * @param product - Product to add
 * @param quantity - Quantity to add
 * @returns Updated cart state
 */
export async function addProductToCart(product: Product, quantity: number = 1): Promise<Cart> {
  const request: AddToCartRequest = {
    product_id: product.id,
    quantity,
    title: product.title,
    price: Math.round(product.price * 100), // Convert dollars to cents
    image: product.thumbnail,
    brand: product.brand,
    category: product.category,
    sku: product.sku,
  };

  return addToCart(request);
}

/**
 * Update quantity for a cart line item
 *
 * @param lineId - Line item ID (MD5 hash)
 * @param quantity - New quantity
 * @returns Updated cart state
 */
export async function updateCartItemQuantity(lineId: string, quantity: number): Promise<Cart> {
  return updateCartLine(lineId, quantity);
}

/**
 * Remove item from cart
 *
 * @param lineId - Line item ID (MD5 hash)
 * @returns Updated cart state
 */
export async function removeCartItem(lineId: string): Promise<Cart> {
  return removeCartLine(lineId);
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

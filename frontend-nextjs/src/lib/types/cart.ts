/**
 * TypeScript interfaces for Cart API
 * Matches the PHP backend CartController response structure
 */

export interface CartLineItem {
  line_id: string; // MD5 hash of product_id
  product_id: number;
  title: string;
  price: number; // in cents
  quantity: number;
  image?: string;
  brand?: string;
  category?: string;
  sku?: string;
  line_total: number; // in cents (price * quantity)
}

export interface Cart {
  items: CartLineItem[];
  subtotal: number; // in cents
  currency: string; // e.g., "USD"
}

/**
 * Request body for adding item to cart
 */
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  title: string;
  price: number; // in cents
  image?: string;
  brand?: string;
  category?: string;
  sku?: string;
}

/**
 * Request body for updating cart line quantity
 */
export interface UpdateCartLineRequest {
  quantity: number;
}

/**
 * API response wrapper (for error handling)
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

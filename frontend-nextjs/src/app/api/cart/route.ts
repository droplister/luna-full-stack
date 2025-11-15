/**
 * Cart API Route (BFF Layer)
 * GET /api/cart - Fetch cart
 * POST /api/cart - Add item to cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchCart, addProductToCart } from '@/lib/services/cart';
import type { Product } from '@/lib/types/products';

export async function GET(request: NextRequest) {
  try {
    // Forward cookies from browser to backend
    const cookieHeader = request.headers.get('cookie');

    const { data: cart, headers } = await fetchCart(cookieHeader || undefined);

    // Create response and forward Set-Cookie headers from backend
    const response = NextResponse.json(cart, { status: 200 });

    // Forward all Set-Cookie headers from backend to browser
    // Use getSetCookie() to get all Set-Cookie headers (there can be multiple)
    const setCookieHeaders = headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('Error fetching cart:', error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch cart',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Forward cookies from browser to backend
    const cookieHeader = request.headers.get('cookie');

    const body = await request.json();

    // Validate required fields
    if (!body.product || !body.product.id) {
      return NextResponse.json(
        {
          error: {
            message: 'Product data is required',
          },
        },
        { status: 400 }
      );
    }

    const product: Product = body.product;
    const quantity: number = body.quantity || 1;

    if (quantity <= 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Quantity must be greater than 0',
          },
        },
        { status: 400 }
      );
    }

    const { data: cart, headers } = await addProductToCart(product, quantity, cookieHeader || undefined);

    // Create response and forward Set-Cookie headers from backend
    const response = NextResponse.json(cart, { status: 200 });

    // Forward all Set-Cookie headers from backend to browser
    // Use getSetCookie() to get all Set-Cookie headers (there can be multiple)
    const setCookieHeaders = headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to add item to cart',
        },
      },
      { status: 500 }
    );
  }
}

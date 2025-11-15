/**
 * Cart API Route (BFF Layer)
 * GET /api/cart - Fetch cart
 * POST /api/cart - Add item to cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCart, addProductToCart } from '@/lib/services/cart';
import type { Product } from '@/lib/types/products';

export async function GET() {
  try {
    const cart = await fetchCart();
    return NextResponse.json(cart, { status: 200 });
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

    const cart = await addProductToCart(product, quantity);

    return NextResponse.json(cart, { status: 200 });
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

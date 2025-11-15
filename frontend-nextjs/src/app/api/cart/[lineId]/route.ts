/**
 * Cart Line Item API Route (BFF Layer)
 * PUT /api/cart/[lineId] - Update quantity
 * DELETE /api/cart/[lineId] - Remove item
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCartItemQuantity, removeCartItem } from '@/lib/services/cart';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lineId: string }> }
) {
  try {
    // Forward cookies from browser to backend
    const cookieHeader = request.headers.get('cookie');

    const { lineId } = await params;

    if (!lineId) {
      return NextResponse.json(
        {
          error: {
            message: 'Line ID is required',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const quantity = body.quantity;

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Valid quantity is required',
          },
        },
        { status: 400 }
      );
    }

    const { data: cart, headers } = await updateCartItemQuantity(lineId, quantity, cookieHeader || undefined);

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
    console.error(`Error updating cart line:`, error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to update cart item',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lineId: string }> }
) {
  try {
    // Forward cookies from browser to backend
    const cookieHeader = request.headers.get('cookie');

    const { lineId } = await params;

    if (!lineId) {
      return NextResponse.json(
        {
          error: {
            message: 'Line ID is required',
          },
        },
        { status: 400 }
      );
    }

    const { data: cart, headers } = await removeCartItem(lineId, cookieHeader || undefined);

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
    console.error(`Error removing cart line:`, error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to remove cart item',
        },
      },
      { status: 500 }
    );
  }
}

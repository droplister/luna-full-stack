/**
 * Cart Line Item API Route (BFF Layer)
 * PUT /api/cart/[lineId] - Update quantity
 * DELETE /api/cart/[lineId] - Remove item
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCartItemQuantity, removeCartItem } from '@/lib/services/cart';

export async function PUT(
  request: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const { lineId } = params;

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

    const cart = await updateCartItemQuantity(lineId, quantity);

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error(`Error updating cart line ${params.lineId}:`, error);

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
  { params }: { params: { lineId: string } }
) {
  try {
    const { lineId } = params;

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

    const cart = await removeCartItem(lineId);

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error(`Error removing cart line ${params.lineId}:`, error);

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

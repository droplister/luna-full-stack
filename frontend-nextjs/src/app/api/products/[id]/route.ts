/**
 * Single Product API Route (BFF Layer)
 * GET /api/products/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchProductById } from '@/lib/services/products';

// Revalidate product details every 60 seconds (ISR)
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);

    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid product ID',
          },
        },
        { status: 400 }
      );
    }

    const product = await fetchProductById(productId);

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch product',
        },
      },
      { status: 500 }
    );
  }
}

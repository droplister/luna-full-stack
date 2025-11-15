/**
 * Products API Route (BFF Layer)
 * GET /api/products?limit=12&skip=0
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllProducts } from '@/lib/services/products';

// Revalidate products every 60 seconds (ISR)
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    const result = await fetchAllProducts(limit, skip);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}

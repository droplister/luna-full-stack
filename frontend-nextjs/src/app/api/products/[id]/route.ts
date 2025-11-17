/**
 * Single Product API Route (BFF Layer)
 * GET /api/products/[id]
 * Supports both numeric IDs and slug-based URLs:
 * - /api/products/42
 * - /api/products/essence-mascara-lash-princess-1
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchProductById } from '@/lib/services/products';
import { extractIdFromSlug } from '@/utils/slugify';
import { cacheConfig } from '@/lib/config';

// Revalidate product details every 60 seconds (ISR)
// Note: Must be a literal number for Next.js static analysis
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Extract product ID from either numeric ID or compound slug
    const productId = extractIdFromSlug(id);

    if (!productId || productId <= 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid product ID or slug',
          },
        },
        { status: 400 }
      );
    }

    const product = await fetchProductById(productId);

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);

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

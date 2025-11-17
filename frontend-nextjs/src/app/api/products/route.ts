/**
 * Products API Route (BFF Layer)
 * GET /api/products
 *
 * Fetches all products from configured categories (no pagination needed)
 * Categories: tops, womens-dresses, womens-shoes, womens-jewellery,
 *            womens-bags, sunglasses, fragrances, beauty
 */

import { NextResponse } from 'next/server';
import { fetchAllCategoryProducts } from '@/lib/services/products';
import { cacheConfig } from '@/lib/config';

// ISR caching: revalidate every 1 minute (60 seconds)
// All ~40 products from 8 categories are fetched in parallel and cached
// Note: Must be a literal number for Next.js static analysis
export const revalidate = 60;

export async function GET() {
  try {
    const result = await fetchAllCategoryProducts();
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

/**
 * Collections API Route (BFF Layer)
 * GET /api/collections/[slug]
 *
 * Fetches products from a specific category/collection from DummyJSON
 * Example: /api/collections/womens-dresses
 */

import { NextResponse } from 'next/server';
import { fetchProductsByCategory } from '@/lib/services/products';
import { cacheConfig } from '@/lib/config';

// ISR caching: revalidate every 1 minute (60 seconds)
export const revalidate = cacheConfig.products.category;

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: { message: 'Category slug is required' } },
        { status: 400 }
      );
    }

    const result = await fetchProductsByCategory(slug);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching collection:', error);

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch collection',
        },
      },
      { status: 500 }
    );
  }
}

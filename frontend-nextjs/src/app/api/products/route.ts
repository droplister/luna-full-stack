/**
 * Products API Route (BFF Layer)
 * GET /api/products?search=query
 *
 * Fetches all products from configured categories (no pagination needed)
 * Categories: tops, womens-dresses, womens-shoes, womens-jewellery,
 *            womens-bags, sunglasses, fragrances, beauty
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAllCategoryProducts, searchProductsByQuery } from '@/lib/services/products';

// Heavy caching: revalidate every 5 minutes (300 seconds)
// All ~40 products from 8 categories are fetched in parallel and cached
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    // Search or return all category products
    let result;
    if (search) {
      result = await searchProductsByQuery(search);
    } else {
      result = await fetchAllCategoryProducts();
    }

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

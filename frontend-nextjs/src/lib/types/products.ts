/**
 * TypeScript interfaces for DummyJSON product API
 * API Documentation: https://dummyjson.com/docs/products
 */

export interface DummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number; // in dollars
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface DummyProductList {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Product Review from DummyJSON API
 */
export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

/**
 * Product type - direct alias to DummyProduct (API response)
 * No normalization needed - we use the full API response
 */
export type Product = DummyProduct;

/**
 * Product Category from DummyJSON API
 */
export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}

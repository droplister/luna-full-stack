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
 * Normalized Product type for internal use
 * Simplifies DummyProduct to only what we need
 */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number; // in dollars
  thumbnail: string;
  images: string[];
  category: string;
  brand?: string;
  sku: string;
  stock: number;
  rating: number;
}

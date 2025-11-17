/**
 * Metadata Utilities
 * Helper functions for generating SEO meta tags, OpenGraph, and Twitter cards
 */

import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config/site'
import { brand } from '@/lib/cms'
import type { DummyProduct } from '@/lib/types/products'

interface ProductMetadataOptions {
  product: DummyProduct
  url?: string
}

interface CollectionMetadataOptions {
  title: string
  description: string
  slug: string
  productCount?: number
}

/**
 * Generate metadata for product detail pages
 */
export function generateProductMetadata({ product, url }: ProductMetadataOptions): Metadata {
  const pageUrl = url || `${siteConfig.url}/products/${product.id}`
  const productTitle = `${product.title} | ${brand.name}`
  const productDescription = product.description || `Shop ${product.title} at ${brand.name}. ${brand.tagline}`

  // Use first image or thumbnail
  const image = product.images?.[0] || product.thumbnail
  const imageUrl = image?.startsWith('http') ? image : `${siteConfig.url}${image}`

  return {
    title: productTitle,
    description: productDescription,
    openGraph: {
      title: productTitle,
      description: productDescription,
      url: pageUrl,
      siteName: brand.name,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: productTitle,
      description: productDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'USD',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:brand': product.brand || brand.name,
      'product:category': product.category,
      'product:rating': product.rating?.toString() || '',
    },
  }
}

/**
 * Generate metadata for collection/category pages
 */
export function generateCollectionMetadata({
  title,
  description,
  slug,
  productCount,
}: CollectionMetadataOptions): Metadata {
  const pageUrl = `${siteConfig.url}/collections/${slug}`
  const pageTitle = `${title} | ${brand.name}`
  const pageDescription = productCount
    ? `${description} Browse ${productCount} products in our ${title} collection.`
    : description

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: brand.name,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: pageDescription,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

/**
 * Generate default/fallback metadata for the site
 */
export function generateDefaultMetadata(): Metadata {
  return {
    title: `${brand.name} - ${brand.tagline}`,
    description: brand.tagline,
    keywords: [
      'online shopping',
      'curated treasures',
      'fashion',
      'beauty',
      'accessories',
      'free spirits',
      'unique finds',
    ],
    authors: [{ name: brand.name }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      siteName: brand.name,
      title: `${brand.name} - ${brand.tagline}`,
      description: brand.tagline,
    },
    twitter: {
      card: 'summary',
      title: `${brand.name} - ${brand.tagline}`,
      description: brand.tagline,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add your verification codes here when needed
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  }
}

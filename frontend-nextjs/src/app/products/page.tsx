/**
 * Products Listing Page (Server Component)
 * Handles static generation and metadata for the shop all page
 */

import type { Metadata } from 'next'
import { brand } from '@/lib/cms'
import { siteConfig } from '@/lib/config/site'
import { ProductsPageClient } from './page.client'

/**
 * Generate metadata for SEO
 */
export async function generateMetadata(): Promise<Metadata> {
  const pageTitle = `Shop All | ${brand.name}`
  const pageDescription = `Discover our complete collection of carefully curated treasures. ${brand.tagline}`
  const pageUrl = `${siteConfig.url}/products`

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
 * Products page - wraps client component
 */
export default function ProductsPage() {
  return <ProductsPageClient />
}

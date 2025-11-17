/**
 * Product Detail Page (Server Component)
 * Handles static generation and metadata for product pages
 */

import type { Metadata } from 'next'
import { generateProductStaticParams } from '@/lib/server/static-params'
import { getProduct } from '@/lib/server/products'
import { generateProductMetadata } from '@/utils/metadata'
import { generateProductSlug } from '@/utils/slugify'
import { ProductPageClient } from './page.client'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Generate static params for all products at build time
 */
export async function generateStaticParams() {
  return generateProductStaticParams()
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const slug = generateProductSlug(product)
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${slug}`

  return generateProductMetadata({ product, url })
}

/**
 * Product page - wraps client component
 */
export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params
  return <ProductPageClient params={params} />
}

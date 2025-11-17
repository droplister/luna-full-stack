/**
 * Collection Page (Server Component)
 * Handles static generation and metadata for collection pages
 */

import type { Metadata } from 'next'
import { getAllCollectionSlugs, getCollectionInfo } from '@/lib/server/collections'
import { generateCollectionMetadata } from '@/utils/metadata'
import { CategoryPageClient } from './page.client'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Generate static params for all collections at build time
 */
export async function generateStaticParams() {
  const slugs = getAllCollectionSlugs()
  return slugs.map((slug) => ({ slug }))
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const info = getCollectionInfo(slug)

  return generateCollectionMetadata({
    title: info.title,
    description: info.description,
    slug: info.slug,
  })
}

/**
 * Collection page - wraps client component
 */
export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params
  return <CategoryPageClient params={params} />
}

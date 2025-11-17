/**
 * Server-Side Collections Data Fetching
 * Functions for fetching collection/category data in Server Components
 */

import { navigation } from '@/lib/cms/navigation'
import { categoryDisplayNames, categoryDescriptions } from '@/lib/cms/categories'
import { kebabToTitleCase } from '@/utils/format'

/**
 * Get all collection slugs for generateStaticParams
 */
export function getAllCollectionSlugs(): string[] {
  const slugs: string[] = []

  navigation.megaMenus.forEach((menu) => {
    menu.sections.forEach((section) => {
      section.items.forEach((item) => {
        const slug = item.href.split('/').pop()
        if (slug) {
          slugs.push(slug)
        }
      })
    })
  })

  return slugs
}

/**
 * Get collection metadata by slug
 */
export function getCollectionInfo(slug: string) {
  // Use CMS display name if available, otherwise format the slug
  const title = categoryDisplayNames[slug] || kebabToTitleCase(slug)
  const description = categoryDescriptions[slug] || `Browse our ${title} collection`

  return {
    slug,
    title,
    description,
  }
}

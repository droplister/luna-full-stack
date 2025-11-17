/**
 * Category utilities
 * Helper functions for working with categories
 */

import { navigation, categoryDisplayNames } from '@/lib/cms'

export interface Category {
  slug: string
  name: string
  href: string
}

/**
 * Extract all categories from brand config navigation
 */
export function extractAllCategories(): Category[] {
  const categories: Category[] = []
  const seen = new Set<string>()

  navigation.megaMenus.forEach((menu) => {
    menu.sections.forEach((section) => {
      section.items.forEach((item) => {
        // Extract slug from href like "/collections/tops" -> "tops"
        const slug = item.href.split('/').pop() || ''

        // Avoid duplicates
        if (!seen.has(slug) && slug) {
          seen.add(slug)
          categories.push({
            slug,
            name: categoryDisplayNames[slug] || item.name,
            href: item.href,
          })
        }
      })
    })
  })

  return categories.sort((a, b) => a.name.localeCompare(b.name))
}

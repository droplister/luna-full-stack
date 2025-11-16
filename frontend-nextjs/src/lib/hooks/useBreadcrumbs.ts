/**
 * useBreadcrumbs Hook
 * Generates breadcrumbs based on current route and dynamic data
 */

'use client'

import { usePathname } from 'next/navigation'
import { categoryDisplayNames, getCategorySection } from '@/lib/cms'
import { kebabToTitleCase } from '@/lib/utils/format'

export interface Breadcrumb {
  name: string
  href?: string
}

interface UseBreadcrumbsOptions {
  productCategory?: string
  categorySlug?: string
}

export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): Breadcrumb[] {
  const pathname = usePathname()
  const { productCategory, categorySlug } = options

  const breadcrumbs: Breadcrumb[] = [
    { name: 'Home', href: '/' },
  ]

  // Handle /products route
  if (pathname === '/products') {
    breadcrumbs.push({ name: 'Shop All', href: '/products' })
    return breadcrumbs
  }

  // Handle /products/[id] route
  if (pathname.startsWith('/products/') && pathname !== '/products') {
    breadcrumbs.push({ name: 'Shop All', href: '/products' })
    if (productCategory) {
      // Use display name from config if available, otherwise format the slug
      const categoryName = categoryDisplayNames[productCategory] || kebabToTitleCase(productCategory)
      // Link to the category page
      breadcrumbs.push({ name: categoryName, href: `/collections/${productCategory}` })
    }
    return breadcrumbs
  }

  // Handle /collections/[slug] route
  if (pathname.startsWith('/collections/') && categorySlug) {
    // Add Shop All breadcrumb
    breadcrumbs.push({ name: 'Shop All', href: '/products' })

    // Add section name (parent category) - e.g., "Spells" for fragrances
    const sectionName = getCategorySection(categorySlug)
    breadcrumbs.push({ name: sectionName })

    return breadcrumbs
  }

  return breadcrumbs
}

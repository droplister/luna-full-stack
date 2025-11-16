/**
 * Category Filter Component
 * Shows Luna Lovegood's curated categories from brand config
 */

'use client'

import Link from 'next/link'
import { brandConfig, categoryDisplayNames } from '@/lib/config/brand'

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

// Extract all category slugs from brand config navigation
const brandCategories = brandConfig.navigation.megaMenus.flatMap((menu) =>
  menu.sections.flatMap((section) =>
    section.items.map((item) => {
      // Extract slug from href like "/category/tops" -> "tops"
      const slug = item.href.split('/').pop() || ''
      return {
        slug,
        name: categoryDisplayNames[slug] || item.name,
        section: section.name,
      }
    })
  )
)

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {

  const handleCategoryClick = (slug: string) => {
    // If clicking the currently selected category, clear the filter
    if (selectedCategory === slug) {
      onCategoryChange(null)
    } else {
      onCategoryChange(slug)
    }
  }

  const handleAllProductsClick = () => {
    onCategoryChange(null)
  }

  // Group categories by section
  const categoriesBySection = brandCategories.reduce((acc, cat) => {
    if (!acc[cat.section]) {
      acc[cat.section] = []
    }
    acc[cat.section].push(cat)
    return acc
  }, {} as Record<string, typeof brandCategories>)

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Shop by Category</h3>

      <div className="space-y-6">
        {/* All Products option */}
        <div>
          <button
            onClick={handleAllProductsClick}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Products
          </button>
        </div>

        {/* Category sections */}
        {Object.entries(categoriesBySection).map(([sectionName, categories]) => (
          <div key={sectionName}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {sectionName}
            </h4>
            <div className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

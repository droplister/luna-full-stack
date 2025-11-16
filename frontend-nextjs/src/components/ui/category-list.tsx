/**
 * Category List Component
 * Displays a list of category links with active state
 */

import Link from 'next/link'

interface Category {
  slug: string
  name: string
  href: string
}

interface CategoryListProps {
  categories: Category[]
  currentCategory?: string
  showAllProducts?: boolean
}

export function CategoryList({
  categories,
  currentCategory,
  showAllProducts = true,
}: CategoryListProps) {
  return (
    <div>
      <h3 className="sr-only">Categories</h3>
      <ul role="list" className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
        {showAllProducts && (
          <li>
            <Link
              href="/products"
              className={`block font-semibold ${!currentCategory ? 'text-indigo-600' : 'hover:text-gray-800'}`}
            >
              Shop All
            </Link>
          </li>
        )}
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={category.href}
              className={`block cursor-pointer ${
                currentCategory === category.slug
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-gray-800'
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

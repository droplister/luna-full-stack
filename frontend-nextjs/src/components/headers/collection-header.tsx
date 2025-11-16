/**
 * Collection Header Component
 * Displays page title and description for collection/category pages
 * Based on the design from tmp/full-layout.tsx
 */

'use client'

interface CollectionHeaderProps {
  title: string
  description?: string
}

export function CollectionHeader({ title, description }: CollectionHeaderProps) {
  return (
    <div>
      {/* Page Header */}
      <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
        <div className="border-b border-gray-200 pt-24 pb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
          {description && (
            <p className="mt-4 text-base text-gray-500">
              {description}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

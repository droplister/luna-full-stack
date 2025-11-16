/**
 * Page Header Component
 * Reusable page header with title and optional description
 */

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

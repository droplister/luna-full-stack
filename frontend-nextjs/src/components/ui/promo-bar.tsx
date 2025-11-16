/**
 * PromoBar Component
 * Displays a promotional message banner
 */

interface PromoBarProps {
  /** The promotional message to display */
  message: string
}

export function PromoBar({ message }: PromoBarProps) {
  return (
    <div className="flex h-10 items-center justify-center bg-violet-50 px-4 text-sm font-bold text-violet-600 sm:px-6 lg:px-8">
      {message}
    </div>
  )
}

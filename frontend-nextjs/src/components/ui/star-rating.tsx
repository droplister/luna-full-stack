/**
 * Star Rating Component
 * Reusable component for displaying star ratings
 */

import { StarIcon } from '@heroicons/react/20/solid'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className = ''
}: StarRatingProps) {
  return (
    <div className={classNames('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => (
          <StarIcon
            key={index}
            aria-hidden="true"
            className={classNames(
              rating > index ? 'text-yellow-400' : 'text-gray-200',
              sizeClasses[size],
              'shrink-0',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
      <span className="sr-only">{rating} out of {maxRating} stars</span>
    </div>
  )
}

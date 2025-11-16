/**
 * Review Card Component
 * Individual review card for displaying customer reviews
 */

'use client'

import { StarRating } from '../ui/star-rating'

export interface Review {
  id: number
  rating: number
  content: string
  author: string
  avatarSrc: string
  avatarPosition?: { x: number; y: number }
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="py-12">
      <div className="flex items-center">
        {review.avatarPosition ? (
          <div
            className="size-12 rounded-full overflow-hidden"
            aria-label={`${review.author}'s avatar`}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${review.avatarSrc})`,
                backgroundPosition: `-${review.avatarPosition.x * 0.8}px -${review.avatarPosition.y * 0.8}px`,
                backgroundSize: '481.6px 481.6px',
              }}
            />
          </div>
        ) : (
          <img alt={`${review.author}.`} src={review.avatarSrc} className="size-12 rounded-full" />
        )}
        <div className="ml-4">
          <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
          <div className="mt-1">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: review.content }}
        className="mt-4 space-y-6 text-base text-gray-600 italic"
      />
    </div>
  )
}

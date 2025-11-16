/**
 * Reviews Service
 * Domain logic for product review statistics and formatting
 */

export interface Review {
  rating: number
  comment: string
  reviewerName: string
  reviewerEmail: string
  date: string
}

export interface ReviewStats {
  average: number
  totalCount: number
  counts: Array<{ rating: number; count: number }>
  featured: Array<{
    id: number
    rating: number
    content: string
    author: string
    avatarSrc: string
    avatarPosition: { x: number; y: number }
  }>
}

/**
 * Calculate review statistics from product reviews
 *
 * Generates aggregate statistics including average rating, rating distribution,
 * and featured reviews with avatar sprite positions.
 *
 * @param reviews - Array of product reviews
 * @returns Aggregated review statistics
 */
export function calculateReviewStats(reviews: Review[] = []): ReviewStats {
  if (reviews.length === 0) {
    return {
      average: 0,
      totalCount: 0,
      counts: [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
      featured: [],
    }
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const average = Math.round(totalRating / reviews.length)

  // Count reviews by rating
  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }))

  // Format featured reviews (take top 3)
  const featured = reviews.slice(0, 3).map((review, index) => {
    const position = getAvatarSpritePosition(review.reviewerEmail)
    return {
      id: index + 1,
      rating: review.rating,
      content: `<p>${review.comment}</p>`,
      author: review.reviewerName,
      avatarSrc: '/avatars.jpg',
      avatarPosition: position,
    }
  })

  return {
    average,
    totalCount: reviews.length,
    counts,
    featured,
  }
}

/**
 * Generate random but consistent avatar sprite position from email
 *
 * Uses email as seed for consistent positioning across renders.
 * Assumes avatars.jpg is 602x602 grid with 60x60 avatars (10x10 grid).
 *
 * @param email - Reviewer email (used as hash seed)
 * @returns Sprite position coordinates
 */
function getAvatarSpritePosition(email: string): { x: number; y: number } {
  // Use email as seed for consistent but random-looking positions
  const hash = email.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)

  // 10x10 grid (602px / 60px ≈ 10 avatars per row/column)
  const col = Math.abs(hash) % 10
  const row = Math.abs(hash >> 4) % 10

  return { x: col * 60, y: row * 60 }
}

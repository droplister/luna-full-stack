/**
 * Tests for Reviews Service
 * Covers review statistics calculation and avatar positioning
 */

import { describe, it, expect } from 'vitest'
import { calculateReviewStats, type Review } from '../reviews'

describe('calculateReviewStats', () => {
  describe('Empty reviews', () => {
    it('should return zero stats for empty array', () => {
      const result = calculateReviewStats([])

      expect(result.average).toBe(0)
      expect(result.totalCount).toBe(0)
      expect(result.featured).toEqual([])
      expect(result.counts).toEqual([
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ])
    })

    it('should return zero stats for undefined', () => {
      const result = calculateReviewStats(undefined)

      expect(result.average).toBe(0)
      expect(result.totalCount).toBe(0)
    })
  })

  describe('Single review', () => {
    it('should calculate stats for one 5-star review', () => {
      const reviews: Review[] = [
        {
          rating: 5,
          comment: 'Excellent product!',
          reviewerName: 'John Doe',
          reviewerEmail: 'john@example.com',
          date: '2024-01-01',
        },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.average).toBe(5)
      expect(result.totalCount).toBe(1)
      expect(result.counts).toEqual([
        { rating: 5, count: 1 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ])
      expect(result.featured).toHaveLength(1)
      expect(result.featured[0].rating).toBe(5)
      expect(result.featured[0].author).toBe('John Doe')
    })

    it('should calculate stats for one 1-star review', () => {
      const reviews: Review[] = [
        {
          rating: 1,
          comment: 'Terrible',
          reviewerName: 'Jane Smith',
          reviewerEmail: 'jane@example.com',
          date: '2024-01-01',
        },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.average).toBe(1)
      expect(result.counts).toEqual([
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 1 },
      ])
    })
  })

  describe('Multiple reviews', () => {
    it('should calculate average rating correctly', () => {
      const reviews: Review[] = [
        {
          rating: 5,
          comment: 'Great!',
          reviewerName: 'User 1',
          reviewerEmail: 'user1@example.com',
          date: '2024-01-01',
        },
        {
          rating: 4,
          comment: 'Good',
          reviewerName: 'User 2',
          reviewerEmail: 'user2@example.com',
          date: '2024-01-02',
        },
        {
          rating: 3,
          comment: 'OK',
          reviewerName: 'User 3',
          reviewerEmail: 'user3@example.com',
          date: '2024-01-03',
        },
      ]

      const result = calculateReviewStats(reviews)

      // Average of [5, 4, 3] = 12/3 = 4, rounded = 4
      expect(result.average).toBe(4)
      expect(result.totalCount).toBe(3)
    })

    it('should round average rating to nearest integer', () => {
      const reviews: Review[] = [
        {
          rating: 5,
          comment: 'Great',
          reviewerName: 'User 1',
          reviewerEmail: 'user1@example.com',
          date: '2024-01-01',
        },
        {
          rating: 3,
          comment: 'OK',
          reviewerName: 'User 2',
          reviewerEmail: 'user2@example.com',
          date: '2024-01-02',
        },
      ]

      const result = calculateReviewStats(reviews)

      // Average of [5, 3] = 8/2 = 4
      expect(result.average).toBe(4)
    })

    it('should count reviews by rating correctly', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'A', reviewerName: 'U1', reviewerEmail: 'u1@example.com', date: '2024-01-01' },
        { rating: 5, comment: 'B', reviewerName: 'U2', reviewerEmail: 'u2@example.com', date: '2024-01-02' },
        { rating: 4, comment: 'C', reviewerName: 'U3', reviewerEmail: 'u3@example.com', date: '2024-01-03' },
        { rating: 3, comment: 'D', reviewerName: 'U4', reviewerEmail: 'u4@example.com', date: '2024-01-04' },
        { rating: 3, comment: 'E', reviewerName: 'U5', reviewerEmail: 'u5@example.com', date: '2024-01-05' },
        { rating: 1, comment: 'F', reviewerName: 'U6', reviewerEmail: 'u6@example.com', date: '2024-01-06' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.counts).toEqual([
        { rating: 5, count: 2 },
        { rating: 4, count: 1 },
        { rating: 3, count: 2 },
        { rating: 2, count: 0 },
        { rating: 1, count: 1 },
      ])
    })
  })

  describe('Featured reviews', () => {
    it('should return top 3 reviews as featured', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'First', reviewerName: 'User 1', reviewerEmail: 'u1@example.com', date: '2024-01-01' },
        { rating: 4, comment: 'Second', reviewerName: 'User 2', reviewerEmail: 'u2@example.com', date: '2024-01-02' },
        { rating: 3, comment: 'Third', reviewerName: 'User 3', reviewerEmail: 'u3@example.com', date: '2024-01-03' },
        { rating: 2, comment: 'Fourth', reviewerName: 'User 4', reviewerEmail: 'u4@example.com', date: '2024-01-04' },
        { rating: 1, comment: 'Fifth', reviewerName: 'User 5', reviewerEmail: 'u5@example.com', date: '2024-01-05' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.featured).toHaveLength(3)
      expect(result.featured[0].author).toBe('User 1')
      expect(result.featured[1].author).toBe('User 2')
      expect(result.featured[2].author).toBe('User 3')
    })

    it('should format featured review content as HTML', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'Amazing product!', reviewerName: 'John', reviewerEmail: 'john@example.com', date: '2024-01-01' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.featured[0].content).toBe('<p>Amazing product!</p>')
    })

    it('should include avatar data in featured reviews', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'Great', reviewerName: 'Alice', reviewerEmail: 'alice@example.com', date: '2024-01-01' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.featured[0].avatarSrc).toBe('/avatars.jpg')
      expect(result.featured[0].avatarPosition).toHaveProperty('x')
      expect(result.featured[0].avatarPosition).toHaveProperty('y')
      expect(typeof result.featured[0].avatarPosition.x).toBe('number')
      expect(typeof result.featured[0].avatarPosition.y).toBe('number')
    })

    it('should assign sequential IDs to featured reviews', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'A', reviewerName: 'U1', reviewerEmail: 'u1@example.com', date: '2024-01-01' },
        { rating: 4, comment: 'B', reviewerName: 'U2', reviewerEmail: 'u2@example.com', date: '2024-01-02' },
        { rating: 3, comment: 'C', reviewerName: 'U3', reviewerEmail: 'u3@example.com', date: '2024-01-03' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.featured[0].id).toBe(1)
      expect(result.featured[1].id).toBe(2)
      expect(result.featured[2].id).toBe(3)
    })

    it('should handle less than 3 reviews', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'One', reviewerName: 'User', reviewerEmail: 'user@example.com', date: '2024-01-01' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.featured).toHaveLength(1)
    })
  })

  describe('Avatar sprite positioning', () => {
    it('should generate consistent position for same email', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'Test', reviewerName: 'User', reviewerEmail: 'same@example.com', date: '2024-01-01' },
      ]

      const result1 = calculateReviewStats(reviews)
      const result2 = calculateReviewStats(reviews)

      expect(result1.featured[0].avatarPosition).toEqual(result2.featured[0].avatarPosition)
    })

    it('should generate different positions for different emails', () => {
      const reviews1: Review[] = [
        { rating: 5, comment: 'A', reviewerName: 'User1', reviewerEmail: 'email1@example.com', date: '2024-01-01' },
      ]
      const reviews2: Review[] = [
        { rating: 5, comment: 'B', reviewerName: 'User2', reviewerEmail: 'email2@example.com', date: '2024-01-01' },
      ]

      const result1 = calculateReviewStats(reviews1)
      const result2 = calculateReviewStats(reviews2)

      expect(result1.featured[0].avatarPosition).not.toEqual(result2.featured[0].avatarPosition)
    })

    it('should generate positions within valid grid bounds (10x10 grid, 60px cells)', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'Test', reviewerName: 'User', reviewerEmail: 'test@example.com', date: '2024-01-01' },
      ]

      const result = calculateReviewStats(reviews)
      const pos = result.featured[0].avatarPosition

      // Grid is 10x10, cells are 60px
      // Valid x values: 0, 60, 120, 180, 240, 300, 360, 420, 480, 540
      // Valid y values: same
      expect(pos.x).toBeGreaterThanOrEqual(0)
      expect(pos.x).toBeLessThan(600)
      expect(pos.y).toBeGreaterThanOrEqual(0)
      expect(pos.y).toBeLessThan(600)
      expect(pos.x % 60).toBe(0) // Should be multiple of 60
      expect(pos.y % 60).toBe(0) // Should be multiple of 60
    })
  })

  describe('Edge cases', () => {
    it('should handle all 5-star reviews', () => {
      const reviews: Review[] = [
        { rating: 5, comment: 'A', reviewerName: 'U1', reviewerEmail: 'u1@example.com', date: '2024-01-01' },
        { rating: 5, comment: 'B', reviewerName: 'U2', reviewerEmail: 'u2@example.com', date: '2024-01-02' },
        { rating: 5, comment: 'C', reviewerName: 'U3', reviewerEmail: 'u3@example.com', date: '2024-01-03' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.average).toBe(5)
      expect(result.counts[0].count).toBe(3) // All 5-star
      expect(result.counts[1].count).toBe(0) // No 4-star
    })

    it('should handle all 1-star reviews', () => {
      const reviews: Review[] = [
        { rating: 1, comment: 'Bad', reviewerName: 'U1', reviewerEmail: 'u1@example.com', date: '2024-01-01' },
        { rating: 1, comment: 'Worse', reviewerName: 'U2', reviewerEmail: 'u2@example.com', date: '2024-01-02' },
      ]

      const result = calculateReviewStats(reviews)

      expect(result.average).toBe(1)
      expect(result.counts[4].count).toBe(2) // All 1-star
    })

    it('should handle reviews with special characters in comments', () => {
      const reviews: Review[] = [
        {
          rating: 5,
          comment: '<script>alert("xss")</script>',
          reviewerName: 'Hacker',
          reviewerEmail: 'hacker@example.com',
          date: '2024-01-01',
        },
      ]

      const result = calculateReviewStats(reviews)

      // Content should wrap in <p> tags (note: this is basic HTML wrapping, real apps need sanitization)
      expect(result.featured[0].content).toBe('<p><script>alert("xss")</script></p>')
    })
  })
})

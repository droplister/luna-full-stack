/**
 * useDelayedLoading Hook Tests
 * Tests for delayed loading state to prevent flicker
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDelayedLoading } from '../useDelayedLoading';

describe('useDelayedLoading Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Default Delay (200ms)', () => {
    it('should not show loading immediately', () => {
      const { result } = renderHook(() => useDelayedLoading(true));

      expect(result.current).toBe(false);
    });

    it('should show loading after default delay of 200ms', async () => {
      const { result } = renderHook(() => useDelayedLoading(true));

      expect(result.current).toBe(false);

      // Fast-forward time by 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should not show loading if finished before delay', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useDelayedLoading(isLoading),
        { initialProps: { isLoading: true } }
      );

      expect(result.current).toBe(false);

      // Fast-forward time by 100ms (less than delay)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Loading finishes before delay
      rerender({ isLoading: false });

      // Fast-forward remaining time
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should still be false (timer was cleared)
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should immediately hide loading when isLoading becomes false', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useDelayedLoading(isLoading),
        { initialProps: { isLoading: true } }
      );

      // Wait for loading to show
      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Set isLoading to false
      rerender({ isLoading: false });

      // Should immediately hide (uses queueMicrotask for fast response)
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('Custom Delay', () => {
    it('should respect custom delay of 300ms', async () => {
      const { result } = renderHook(() => useDelayedLoading(true, 300));

      expect(result.current).toBe(false);

      // Fast-forward by 200ms (less than custom delay)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should still be false
      expect(result.current).toBe(false);

      // Fast-forward by remaining 100ms
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should respect custom delay of 500ms', async () => {
      const { result } = renderHook(() => useDelayedLoading(true, 500));

      expect(result.current).toBe(false);

      // Fast-forward by 400ms
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Should still be false
      expect(result.current).toBe(false);

      // Fast-forward by remaining 100ms
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle zero delay', async () => {
      const { result } = renderHook(() => useDelayedLoading(true, 0));

      // With zero delay, should show immediately
      act(() => {
        vi.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Multiple Loading Cycles', () => {
    it('should handle rapid on/off loading states', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useDelayedLoading(isLoading),
        { initialProps: { isLoading: true } }
      );

      expect(result.current).toBe(false);

      // Cycle 1: Loading starts
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Loading stops before delay
      rerender({ isLoading: false });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });

      // Cycle 2: Loading starts again
      rerender({ isLoading: true });

      expect(result.current).toBe(false);

      // This time, wait full delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Stop loading
      rerender({ isLoading: false });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should handle consecutive loading states with different delays', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading, delay }) => useDelayedLoading(isLoading, delay),
        { initialProps: { isLoading: true, delay: 200 } }
      );

      // First cycle with 200ms delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // Stop loading
      rerender({ isLoading: false, delay: 200 });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });

      // Start loading with different delay (500ms)
      rerender({ isLoading: true, delay: 500 });

      // Advance by 200ms (old delay)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should still be false (new delay is 500ms)
      expect(result.current).toBe(false);

      // Advance by remaining 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Cleanup Behavior', () => {
    it('should cleanup timer on unmount', () => {
      const { unmount } = renderHook(() => useDelayedLoading(true));

      // Unmount before delay completes
      unmount();

      // Advance timers (should not cause errors)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Test passes if no errors thrown
      expect(true).toBe(true);
    });

    it('should cleanup timer when loading stops', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useDelayedLoading(isLoading),
        { initialProps: { isLoading: true } }
      );

      // Start loading
      expect(result.current).toBe(false);

      // Stop loading before delay
      rerender({ isLoading: false });

      // Advance timers past delay
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should still be false (timer was cleaned up)
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle isLoading starting as false', () => {
      const { result } = renderHook(() => useDelayedLoading(false));

      expect(result.current).toBe(false);

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should remain false
      expect(result.current).toBe(false);
    });

    it('should handle negative delay (treated as immediate)', async () => {
      const { result } = renderHook(() => useDelayedLoading(true, -100));

      // Negative delay should behave like zero
      act(() => {
        vi.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should handle very long delay', async () => {
      const { result } = renderHook(() => useDelayedLoading(true, 10000));

      // Fast-forward by 9999ms
      act(() => {
        vi.advanceTimersByTime(9999);
      });

      // Should still be false
      expect(result.current).toBe(false);

      // Fast-forward by 1ms to complete delay
      act(() => {
        vi.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('Use Case: Preventing Flicker', () => {
    it('should prevent flicker for fast API calls (<200ms)', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useDelayedLoading(isLoading),
        { initialProps: { isLoading: true } }
      );

      // Simulate fast API call (100ms)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // API completes before delay
      rerender({ isLoading: false });

      // Fast-forward to ensure no flicker
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Loading indicator never showed
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });

    it('should show loading for slow API calls (>200ms)', async () => {
      const { result, rerender } = renderHook(
        ({ isLoading }) => useDelayedLoading(isLoading),
        { initialProps: { isLoading: true } }
      );

      // Simulate slow API call (300ms)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Loading should show after delay
      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      // API completes
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ isLoading: false });

      // Loading hides immediately
      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });
});

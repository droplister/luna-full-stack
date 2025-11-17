"use client";

import React, { useEffect, useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";

type ApparateButtonProps = {
  currentProductId?: number;
  onNavigate?: () => void;
  label?: string;
};

export function ApparateButton({
  currentProductId,
  onNavigate,
  label = "Apparate",
}: ApparateButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload swoosh sound (with cache-busting to prevent cache errors)
  useEffect(() => {
    audioRef.current = new Audio("/sounds/swoosh.mp3?v=1");
    audioRef.current.preload = "auto";
  }, []);

  // Delay showing loading state to prevent flicker (like product page does)
  useEffect(() => {
    if (isPending) {
      // Only show "Apparating..." after 300ms delay
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 300);
    } else {
      // Clear timeout and hide loading immediately when done
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setShowLoading(false);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isPending]);

  const getRandomProductId = () => {
    // Generate random ID between 1-194
    let randomId = Math.floor(Math.random() * 194) + 1;

    // If we randomly picked the current product, try one more time
    if (randomId === currentProductId) {
      randomId = Math.floor(Math.random() * 194) + 1;
    }

    return randomId;
  };

  const handleClick = async () => {
    const targetId = getRandomProductId();

    // Play sound (user gesture = safe)
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // ignore audio errors
      });
    }

    setIsPending(true);

    // Call onNavigate callback if provided (e.g., to close cart drawer)
    onNavigate?.();

    try {
      // Prefetch the product data before navigating
      const response = await fetch(`/api/products/${targetId}`);
      const product = await response.json();

      // Generate slug-based URL from product data
      const titleSlug = product.title
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');

      const slugUrl = `/products/${titleSlug}-${targetId}`;

      // Data is now cached, navigate to slug-based URL
      router.push(slugUrl);
    } catch (error) {
      // If prefetch fails, still navigate with numeric ID fallback
      router.push(`/products/${targetId}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md border-2 px-3 py-2 text-sm font-semibold
        border-gray-300 bg-transparent text-gray-900
        hover:bg-gray-50 hover:border-gray-400
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        transition-colors duration-150
      `}
      aria-busy={showLoading}
      aria-label="Apparate to a random product"
    >
      {showLoading ? "Apparating..." : label}
      <span aria-hidden="true">💨</span>
    </button>
  );
}

/**
 * ScratchCard Component
 * Interactive canvas-based scratch-off effect
 * Supports mouse and touch interactions
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'

type ScratchCardProps = {
  /** Height of the scratch area in px */
  height?: number
  /** Radius of the brush in px */
  brushRadius?: number
  /** Percent (0–1) of area that must be cleared before auto-reveal */
  revealThreshold?: number
  /** Called when the card is fully revealed */
  onComplete?: () => void
  /** Content to reveal under the scratch layer */
  children: React.ReactNode
}

type Point = { x: number; y: number }

export function ScratchCard({
  height = 220,
  brushRadius = 24,
  revealThreshold = 0.6,
  onComplete,
  children,
}: ScratchCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastPointRef = useRef<Point | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const setupCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    const dpr = window.devicePixelRatio || 1

    // Let CSS control layout: fill the container
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    // Now measure the actual rendered size of the canvas
    const rect = canvas.getBoundingClientRect()

    // Internal buffer in device pixels
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)

    // Reset transform, then scale so 1 unit == 1 CSS pixel
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const drawWidth = rect.width
    const drawHeight = rect.height

    ctx.globalCompositeOperation = 'source-over'

    // Soft metallic gold gradient (no dark bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, drawHeight)
    gradient.addColorStop(0.0, '#d8c7a0')   // light champagne
    gradient.addColorStop(0.35, '#fbe8b9')  // bright highlight band
    gradient.addColorStop(0.7, '#d3b47a')   // warm mid-gold
    gradient.addColorStop(1.0, '#b18b53')   // gentle bronze, not too dark

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, drawWidth, drawHeight)

    // Sparkle text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.font = 'bold 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Scratch to Reveal', drawWidth / 2, drawHeight / 2)

    // Switch to erase mode for scratching
    ctx.globalCompositeOperation = 'destination-out'
  }

  // Init canvas size + redraw on container resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      if (!isRevealed) {
        setupCanvas()
      }
    }

    // Initial setup
    handleResize()

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isRevealed])

  const getRelativePos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return { x, y }
  }

  const scratchLine = (from: Point | null, to: Point) => {
    const ctx = ctxRef.current
    if (!ctx) return

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = brushRadius * 2
    ctx.strokeStyle = 'rgba(0,0,0,1)' // color doesn't matter in destination-out mode

    ctx.beginPath()
    if (from) {
      ctx.moveTo(from.x, from.y)
    } else {
      ctx.moveTo(to.x, to.y)
    }
    ctx.lineTo(to.x, to.y)
    ctx.stroke()

    // Also stamp a circle at the point to ensure full coverage
    ctx.beginPath()
    ctx.arc(to.x, to.y, brushRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed) return
    e.preventDefault()
    const point = getRelativePos(e)
    setIsDrawing(true)
    lastPointRef.current = point
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
    scratchLine(null, point)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isRevealed) return
    e.preventDefault()
    const point = getRelativePos(e)
    scratchLine(lastPointRef.current, point)
    lastPointRef.current = point
  }

  const handlePointerUpOrLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    setIsDrawing(false)
    lastPointRef.current = null
    try {
      ;(e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
    checkReveal()
  }

  const checkReveal = () => {
    if (isRevealed) return
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const { width, height } = canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    const totalPixels = pixels.length / 4

    let clearedCount = 0
    const alphaThreshold = 128 // treat pixels with alpha < 128 as cleared

    // Sample every 4th pixel for performance (16 bytes = 4 pixels)
    for (let i = 0; i < pixels.length; i += 16) {
      const alpha = pixels[i + 3]
      if (alpha < alphaThreshold) {
        clearedCount++
      }
    }

    const sampledPixels = totalPixels / 4
    const clearedRatio = clearedCount / sampledPixels

    if (clearedRatio >= revealThreshold) {
      setIsRevealed(true)
      if (onComplete) onComplete()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg"
      style={{ height }}
    >
      {/* Revealed content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center bg-gradient-to-br from-indigo-900/90 to-indigo-950/95">
        <div className="px-4">{children}</div>
      </div>

      {/* Scratch overlay */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${
          isRevealed ? 'opacity-0 transition-opacity duration-300' : ''
        }`}
        style={{
          touchAction: isRevealed ? 'auto' : 'none', // prevents scroll on mobile while scratching
          cursor: isRevealed ? 'default' : isDrawing ? 'grabbing' : 'grab',
          pointerEvents: isRevealed ? 'none' : 'auto', // let you select/copy beneath once revealed
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        aria-label="Scratch to reveal discount code"
      />
    </div>
  )
}

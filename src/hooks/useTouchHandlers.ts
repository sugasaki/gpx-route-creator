import { useCallback, useRef } from 'react'
import { MapRef } from 'react-map-gl/maplibre'

interface TouchHandler {
  onTouchStart?: (e: TouchEvent) => void
  onTouchMove?: (e: TouchEvent) => void
  onTouchEnd?: (e: TouchEvent) => void
  onTouchCancel?: (e: TouchEvent) => void
}

interface UseTouchHandlersProps {
  mapRef: React.RefObject<MapRef | null>
  onTap?: (x: number, y: number) => void
  onLongPress?: (x: number, y: number) => void
  onDragStart?: (x: number, y: number) => void
  onDragMove?: (x: number, y: number) => void
  onDragEnd?: () => void
  longPressDelay?: number
}

export function useTouchHandlers({
  onTap,
  onLongPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  longPressDelay = 500
}: UseTouchHandlersProps): TouchHandler {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const hasMoved = useRef(false)

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return

    const touch = e.touches[0]
    const { clientX: x, clientY: y } = touch
    
    touchStartRef.current = { x, y, time: Date.now() }
    isDraggingRef.current = false
    hasMoved.current = false

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = window.setTimeout(() => {
        if (!hasMoved.current && touchStartRef.current) {
          onLongPress(x, y)
          touchStartRef.current = null // Prevent tap after long press
        }
      }, longPressDelay)
    }
  }, [onLongPress, longPressDelay])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1 || !touchStartRef.current) return

    const touch = e.touches[0]
    const { clientX: x, clientY: y } = touch
    const startPoint = touchStartRef.current

    // Calculate movement distance
    const distance = Math.sqrt(
      Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
    )

    // If moved more than threshold, cancel long press and start dragging
    if (distance > 10) {
      hasMoved.current = true
      clearLongPressTimer()

      if (!isDraggingRef.current) {
        isDraggingRef.current = true
        onDragStart?.(startPoint.x, startPoint.y)
      }

      onDragMove?.(x, y)
    }
  }, [clearLongPressTimer, onDragStart, onDragMove])

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer()

    if (!touchStartRef.current) return

    const startPoint = touchStartRef.current
    const touchDuration = Date.now() - startPoint.time

    if (isDraggingRef.current) {
      onDragEnd?.()
    } else if (!hasMoved.current && touchDuration < longPressDelay) {
      // It's a tap
      onTap?.(startPoint.x, startPoint.y)
    }

    touchStartRef.current = null
    isDraggingRef.current = false
    hasMoved.current = false
  }, [clearLongPressTimer, onTap, onDragEnd, longPressDelay])

  const handleTouchCancel = useCallback(() => {
    clearLongPressTimer()
    
    if (isDraggingRef.current) {
      onDragEnd?.()
    }

    touchStartRef.current = null
    isDraggingRef.current = false
    hasMoved.current = false
  }, [clearLongPressTimer, onDragEnd])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel
  }
}
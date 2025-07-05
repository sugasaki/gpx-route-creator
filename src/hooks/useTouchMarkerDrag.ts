import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { RoutePoint } from '@/types'
import { isTouchDevice } from '@/utils/device'

interface UseTouchMarkerDragProps {
  point: RoutePoint
  isFirst: boolean
  isLast: boolean
}

export function useTouchMarkerDrag({ point, isFirst, isLast }: UseTouchMarkerDragProps) {
  const { movePointWithoutHistory, saveCurrentStateToHistory, deletePoint } = useRouteStore()
  const { editMode, selectedPointId, setSelectedPoint, setHoveredPoint } = useUIStore()
  const [isDragging, setIsDragging] = useState(false)
  const longPressTimer = useRef<number | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const hasMoved = useRef(false)
  
  const isSelected = selectedPointId === point.id
  const canDrag = editMode !== 'delete' && editMode !== 'delete-range'
  const canDelete = editMode === 'edit' && !isFirst && !isLast
  const canDeleteInDeleteMode = editMode === 'delete'
  
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])
  
  useEffect(() => {
    return () => clearLongPressTimer()
  }, [clearLongPressTimer])
  
  const handleTouchStart = useCallback((e: any) => {
    if (!canDrag) return
    
    e.originalEvent.preventDefault()
    e.originalEvent.stopPropagation()
    
    const touch = e.originalEvent.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    hasMoved.current = false
    
    // Set up long press for deletion
    if (canDelete || canDeleteInDeleteMode) {
      longPressTimer.current = window.setTimeout(() => {
        if (!hasMoved.current) {
          // Vibrate on mobile devices if supported
          if ('vibrate' in navigator) {
            navigator.vibrate(50)
          }
          
          if (canDeleteInDeleteMode) {
            deletePoint(point.id)
          } else if (isSelected && canDelete) {
            deletePoint(point.id)
          }
        }
      }, 500)
    }
    
    setSelectedPoint(point.id)
  }, [canDrag, canDelete, canDeleteInDeleteMode, isSelected, point.id, deletePoint, setSelectedPoint])
  
  const handleTouchMove = useCallback((e: any) => {
    if (!canDrag || !touchStartPos.current) return
    
    const touch = e.originalEvent.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y)
    
    // Start dragging if moved more than threshold
    if (deltaX > 5 || deltaY > 5) {
      hasMoved.current = true
      clearLongPressTimer()
      
      if (!isDragging) {
        setIsDragging(true)
      }
      
      // The marker component will handle the actual position update
    }
  }, [canDrag, isDragging, clearLongPressTimer])
  
  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer()
    
    if (isDragging) {
      setIsDragging(false)
      saveCurrentStateToHistory()
    } else if (!hasMoved.current) {
      // It was a tap - toggle selection
      if (!canDeleteInDeleteMode) {
        setSelectedPoint(isSelected ? null : point.id)
      }
    }
    
    touchStartPos.current = null
    hasMoved.current = false
  }, [isDragging, isSelected, canDeleteInDeleteMode, point.id, clearLongPressTimer, saveCurrentStateToHistory, setSelectedPoint])
  
  // Original mouse handlers
  const handleDragStart = useCallback(() => {
    if (!isTouchDevice()) {
      setIsDragging(true)
      setSelectedPoint(point.id)
    }
  }, [point.id, setSelectedPoint])
  
  const handleDrag = useCallback((e: any) => {
    const { lngLat } = e
    movePointWithoutHistory(point.id, lngLat.lat, lngLat.lng)
  }, [point.id, movePointWithoutHistory])
  
  const handleDragEnd = useCallback(() => {
    if (!isTouchDevice()) {
      setIsDragging(false)
      saveCurrentStateToHistory()
    }
  }, [saveCurrentStateToHistory])
  
  const handleClick = useCallback((e: any) => {
    if (isTouchDevice()) return // Handled by touch events
    
    e.originalEvent.stopPropagation()
    
    if (canDeleteInDeleteMode) {
      deletePoint(point.id)
    } else if (isSelected && canDelete) {
      deletePoint(point.id)
    } else {
      setSelectedPoint(point.id)
    }
  }, [isSelected, canDelete, canDeleteInDeleteMode, point.id, deletePoint, setSelectedPoint])
  
  const handleMouseEnter = useCallback(() => {
    if (!isTouchDevice()) {
      setHoveredPoint(point.id)
    }
  }, [point.id, setHoveredPoint])
  
  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice()) {
      setHoveredPoint(null)
    }
  }, [setHoveredPoint])
  
  return {
    isDragging,
    isSelected,
    canDrag,
    canDelete,
    handlers: {
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}
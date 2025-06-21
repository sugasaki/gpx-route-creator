import { useState, useCallback } from 'react'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'
import { RoutePoint } from '../types'

interface UseMarkerDragProps {
  point: RoutePoint
  isFirst: boolean
  isLast: boolean
}

export function useMarkerDrag({ point, isFirst, isLast }: UseMarkerDragProps) {
  const { movePointWithoutHistory, saveCurrentStateToHistory, deletePoint } = useRouteStore()
  const { editMode, selectedPointId, setSelectedPoint, setHoveredPoint } = useUIStore()
  const [isDragging, setIsDragging] = useState(false)
  
  const isSelected = selectedPointId === point.id
  const canDrag = true // Always allow dragging
  const canDelete = editMode === 'edit' && !isFirst && !isLast
  
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    setSelectedPoint(point.id)
  }, [point.id, setSelectedPoint])
  
  const handleDrag = useCallback((e: any) => {
    const { lngLat } = e
    movePointWithoutHistory(point.id, lngLat.lat, lngLat.lng)
  }, [point.id, movePointWithoutHistory])
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    saveCurrentStateToHistory()
  }, [saveCurrentStateToHistory])
  
  const handleClick = useCallback((e: any) => {
    e.originalEvent.stopPropagation()
    
    // Always allow selection
    if (isSelected && canDelete) {
      deletePoint(point.id)
    } else {
      setSelectedPoint(point.id)
    }
  }, [isSelected, canDelete, point.id, deletePoint, setSelectedPoint])
  
  const handleMouseEnter = useCallback(() => {
    setHoveredPoint(point.id)
  }, [point.id, setHoveredPoint])
  
  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null)
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
      onMouseLeave: handleMouseLeave
    }
  }
}
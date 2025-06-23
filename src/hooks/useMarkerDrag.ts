import { useState, useCallback } from 'react'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { RoutePoint } from '@/types'

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
  const canDrag = editMode !== 'delete' && editMode !== 'delete-range' // ドラッグは削除モード以外で可能
  const canDelete = editMode === 'edit' && !isFirst && !isLast
  const canDeleteInDeleteMode = editMode === 'delete' // 削除モードでは全てのポイントが削除可能
  
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
    
    // 削除モードの場合は即座に削除
    if (canDeleteInDeleteMode) {
      deletePoint(point.id)
    } 
    // 編集モードで選択済みの場合は削除（始点・終点以外）
    else if (isSelected && canDelete) {
      deletePoint(point.id)
    } 
    // それ以外は選択
    else {
      setSelectedPoint(point.id)
    }
  }, [isSelected, canDelete, canDeleteInDeleteMode, point.id, deletePoint, setSelectedPoint])
  
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
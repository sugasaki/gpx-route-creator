import { useCallback, useState } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import { RoutePoint } from '../types'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'

interface RouteMarkerProps {
  point: RoutePoint
  index: number
  isFirst: boolean
  isLast: boolean
  isVisible: boolean
}

export default function RouteMarker({ point, isFirst, isLast, isVisible }: RouteMarkerProps) {
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
  
  const getMarkerColor = () => {
    if (isDragging) return '#ef4444' // red
    if (isSelected) return '#10b981' // green
    if (isFirst) return '#3b82f6' // blue
    if (isLast) return '#f59e0b' // orange
    return '#6b7280' // gray
  }
  
  return (
    <Marker
      longitude={point.lng}
      latitude={point.lat}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div
        className={`
          rounded-full border border-white shadow-lg cursor-pointer
          transition-all duration-200 hover:scale-110
          ${isDragging ? 'scale-125' : ''}
          ${(isFirst || isLast) ? 'w-4 h-4' : 'w-3.5 h-3.5'}
          ${!isVisible ? 'opacity-0 pointer-events-none' : ''}
          ${isFirst ? 'border-2' : ''}
          ${isLast ? 'border-2 border-dashed' : ''}
        `}
        style={{ 
          backgroundColor: getMarkerColor(),
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={() => setHoveredPoint(point.id)}
        onMouseLeave={() => setHoveredPoint(null)}
      />
    </Marker>
  )
}
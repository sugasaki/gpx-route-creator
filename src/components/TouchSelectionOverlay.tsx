import { useRef, useCallback, useState, useEffect } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { isTouchDevice } from '@/utils/device'

interface TouchSelectionOverlayProps {
  mapRef: React.RefObject<MapRef | null>
}

export default function TouchSelectionOverlay({ mapRef }: TouchSelectionOverlayProps) {
  const { route, deleteMultiplePoints } = useRouteStore()
  const { editMode, selectionBox, setSelectionBox } = useUIStore()
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  
  useEffect(() => {
    if (editMode !== 'delete-range') {
      setIsDragging(false)
      startPointRef.current = null
    }
  }, [editMode])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (editMode !== 'delete-range' || !containerRef.current || e.touches.length !== 1) return
    
    e.preventDefault()
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    startPointRef.current = { x, y }
    setIsDragging(true)
    setSelectionBox({ start: { x, y }, end: { x, y } })
  }, [editMode, setSelectionBox])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !startPointRef.current || !containerRef.current || e.touches.length !== 1) return
    
    e.preventDefault()
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    setSelectionBox({
      start: startPointRef.current,
      end: { x, y }
    })
  }, [isDragging, setSelectionBox])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !selectionBox || !mapRef.current) return
    
    const pointsToDelete: string[] = []
    
    const minX = Math.min(selectionBox.start.x, selectionBox.end.x)
    const maxX = Math.max(selectionBox.start.x, selectionBox.end.x)
    const minY = Math.min(selectionBox.start.y, selectionBox.end.y)
    const maxY = Math.max(selectionBox.start.y, selectionBox.end.y)
    
    route.points.forEach((point) => {
      const pixel = mapRef.current!.project([point.lng, point.lat])
      
      if (pixel.x >= minX && pixel.x <= maxX && pixel.y >= minY && pixel.y <= maxY) {
        pointsToDelete.push(point.id)
      }
    })
    
    if (pointsToDelete.length > 0) {
      deleteMultiplePoints(pointsToDelete)
    }
    
    setIsDragging(false)
    setSelectionBox(null)
    startPointRef.current = null
  }, [isDragging, selectionBox, route.points, deleteMultiplePoints, setSelectionBox, mapRef])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice()) return // Let touch handlers take over
    
    if (editMode !== 'delete-range' || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    startPointRef.current = { x, y }
    setIsDragging(true)
    setSelectionBox({ start: { x, y }, end: { x, y } })
  }, [editMode, setSelectionBox])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice() || !isDragging || !startPointRef.current || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setSelectionBox({
      start: startPointRef.current,
      end: { x, y }
    })
  }, [isDragging, setSelectionBox])

  const handleMouseUp = useCallback(() => {
    if (isTouchDevice()) return
    handleTouchEnd()
  }, [handleTouchEnd])

  if (editMode !== 'delete-range') return null
  
  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 z-10"
        style={{ cursor: 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      
      {selectionBox && (
        <div
          className="absolute border-2 border-orange-500 bg-orange-500 bg-opacity-20 pointer-events-none z-20"
          style={{
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y),
          }}
        />
      )}
    </>
  )
}
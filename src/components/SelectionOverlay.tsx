import { useRef, useCallback, useState, useEffect } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'

interface SelectionOverlayProps {
  mapRef: React.RefObject<MapRef | null>
}

export default function SelectionOverlay({ mapRef }: SelectionOverlayProps) {
  const { route, deleteMultiplePoints } = useRouteStore()
  const { editMode, selectionBox, setSelectionBox } = useUIStore()
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  
  // モード変更時にローカル状態をリセット
  useEffect(() => {
    if (editMode !== 'delete-range') {
      setIsDragging(false)
      startPointRef.current = null
    }
  }, [editMode])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (editMode !== 'delete-range' || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    startPointRef.current = { x, y }
    setIsDragging(true)
    setSelectionBox({ start: { x, y }, end: { x, y } })
  }, [editMode, setSelectionBox])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !startPointRef.current || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setSelectionBox({
      start: startPointRef.current,
      end: { x, y }
    })
  }, [isDragging, setSelectionBox])

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !selectionBox || !mapRef.current) return
    
    // 選択範囲内のポイントを検出
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
    
    // ポイントを削除
    if (pointsToDelete.length > 0) {
      deleteMultiplePoints(pointsToDelete)
    }
    
    // 選択状態をリセット
    setIsDragging(false)
    setSelectionBox(null)
    startPointRef.current = null
  }, [isDragging, selectionBox, route.points, deleteMultiplePoints, setSelectionBox, mapRef])

  if (editMode !== 'delete-range') return null
  
  return (
    <>
      {/* 透明なオーバーレイ */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-10"
        style={{ cursor: 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* 選択ボックス */}
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
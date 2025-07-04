import { useCallback, RefObject, useEffect } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { findClosestSegmentIndex } from '@/utils/geo'
import { MAP_CONSTANTS } from '@/constants/map'
import { useWaypointHandlers } from './useWaypointHandlers'

interface UseMapHandlersProps {
  mapRef: RefObject<MapRef | null>
}

export function useMapHandlers({ mapRef }: UseMapHandlersProps) {
  const { route, addPoint, insertPoint } = useRouteStore()
  const { editMode, hoveredPointId, setHoveredPoint } = useUIStore()
  const { handleWaypointModeClick, getCursorForWaypointMode } = useWaypointHandlers({ mapRef })
  
  // Set cursor based on edit mode
  useEffect(() => {
    if (!mapRef.current) return
    
    const canvas = mapRef.current.getCanvas()
    if (editMode === 'create') {
      canvas.style.cursor = 'crosshair'
    } else if (editMode === 'delete') {
      canvas.style.cursor = 'pointer'
    } else if (editMode === 'delete-range') {
      canvas.style.cursor = 'crosshair'
    } else if (editMode === 'waypoint') {
      canvas.style.cursor = 'crosshair'
    } else {
      canvas.style.cursor = ''
    }
  }, [editMode, mapRef])
  
  const handleMapClick = useCallback((e: any) => {
    // Waypointモードの処理を委譲
    if (handleWaypointModeClick(e)) {
      return
    }
    
    // Allow line clicks in both create and edit modes
    if (editMode !== 'create' && editMode !== 'edit') return
    
    // Check if we clicked on the line
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ['route-line']
    })
    
    if (features && features.length > 0) {
      // Clicked on the line - find the best insertion point
      const clickPoint = e.lngLat
      const insertIndex = findClosestSegmentIndex(
        clickPoint.lat, 
        clickPoint.lng, 
        route.points
      )
      
      insertPoint(insertIndex, {
        lat: clickPoint.lat,
        lng: clickPoint.lng
      })
    } else if (editMode === 'create') {
      // Clicked on empty space - add to end (only in create mode)
      addPoint({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      })
    }
  }, [editMode, addPoint, insertPoint, route.points, handleWaypointModeClick, mapRef])
  
  const handleMouseMove = useCallback((e: any) => {
    if (!mapRef.current) return
    
    // Waypointモードのカーソル処理
    const waypointCursor = getCursorForWaypointMode(e.point.x, e.point.y)
    if (waypointCursor) {
      mapRef.current.getCanvas().style.cursor = waypointCursor
    }
    
    // ポイントのホバー処理
    if (route.points.length === 0) return
    
    const { point } = e
    const threshold: number = MAP_CONSTANTS.HOVER_THRESHOLD_PIXELS
    
    // Check distance to all points
    let closestPoint = null
    let minDistance = threshold
    
    for (let i = 0; i < route.points.length; i++) {
      const routePoint = route.points[i]
      const pixel = mapRef.current.project([routePoint.lng, routePoint.lat])
      const distance = Math.sqrt(
        (point.x - pixel.x) ** 2 + (point.y - pixel.y) ** 2
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = routePoint
      }
    }
    
    if (closestPoint) {
      setHoveredPoint(closestPoint.id)
    } else if (hoveredPointId) {
      setHoveredPoint(null)
    }
  }, [route.points, hoveredPointId, setHoveredPoint, getCursorForWaypointMode, mapRef])
  
  const handleMouseEnter = useCallback((e: any) => {
    if ((editMode === 'create' || editMode === 'edit') && e.features && e.features.length > 0 && e.features[0].layer.id === 'route-line') {
      e.target.getCanvas().style.cursor = 'pointer'
    } else if (editMode === 'waypoint' && e.features && e.features.length > 0 && e.features[0].layer.id === 'route-line') {
      e.target.getCanvas().style.cursor = 'pointer'
    }
  }, [editMode])
  
  const handleMouseLeave = useCallback((e: any) => {
    if (editMode === 'create') {
      e.target.getCanvas().style.cursor = 'crosshair'
    } else if (editMode === 'delete') {
      e.target.getCanvas().style.cursor = 'pointer'
    } else if (editMode === 'delete-range') {
      e.target.getCanvas().style.cursor = 'crosshair'
    } else if (editMode === 'waypoint') {
      e.target.getCanvas().style.cursor = 'crosshair'
    } else {
      e.target.getCanvas().style.cursor = ''
    }
  }, [editMode])
  
  return {
    handleMapClick,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  }
}
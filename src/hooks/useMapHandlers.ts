import { useCallback, RefObject } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'
import { findClosestSegmentIndex } from '../utils/geo'
import { MAP_CONSTANTS } from '../constants/map'

interface UseMapHandlersProps {
  mapRef: RefObject<MapRef | null>
}

export function useMapHandlers({ mapRef }: UseMapHandlersProps) {
  const { route, addPoint, insertPoint } = useRouteStore()
  const { editMode, hoveredPointId, setHoveredPoint } = useUIStore()
  
  const handleMapClick = useCallback((e: any) => {
    if (editMode !== 'create') return
    
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
    } else {
      // Clicked on empty space - add to end
      addPoint({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      })
    }
  }, [editMode, addPoint, insertPoint, route.points])
  
  const handleMouseMove = useCallback((e: any) => {
    if (!mapRef.current || route.points.length <= 2) return
    
    const { point } = e
    const threshold: number = MAP_CONSTANTS.HOVER_THRESHOLD_PIXELS
    
    // Check distance to middle points only
    let closestPoint = null
    let minDistance = threshold
    
    for (let i = 1; i < route.points.length - 1; i++) {
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
      // Check if currently hovered point is a middle point
      const hoveredIndex = route.points.findIndex(p => p.id === hoveredPointId)
      if (hoveredIndex > 0 && hoveredIndex < route.points.length - 1) {
        setHoveredPoint(null)
      }
    }
  }, [route.points, hoveredPointId, setHoveredPoint])
  
  const handleMouseEnter = useCallback((e: any) => {
    if (editMode === 'create' && e.features && e.features.length > 0 && e.features[0].layer.id === 'route-line') {
      e.target.getCanvas().style.cursor = 'pointer'
    }
  }, [editMode])
  
  const handleMouseLeave = useCallback((e: any) => {
    e.target.getCanvas().style.cursor = ''
  }, [])
  
  return {
    handleMapClick,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  }
}
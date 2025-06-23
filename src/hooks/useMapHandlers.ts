import { useCallback, RefObject, useEffect } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { findClosestSegmentIndex, findClosestPointOnRoute } from '@/utils/geo'
import { MAP_CONSTANTS } from '@/constants/map'

interface UseMapHandlersProps {
  mapRef: RefObject<MapRef | null>
}

export function useMapHandlers({ mapRef }: UseMapHandlersProps) {
  const { route, addPoint, insertPoint, waypoints } = useRouteStore()
  const { editMode, hoveredPointId, setHoveredPoint, setPendingWaypoint, setWaypointDialogOpen } = useUIStore()
  
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
    if (editMode === 'waypoint') {
      // Waypointモード: 既存のWaypointマーカーをクリックしたかチェック
      const clickRadius = 20 // Waypointマーカーのクリック判定半径（ピクセル）
      
      // 既存のWaypointとの距離をチェック
      for (const waypoint of waypoints) {
        const waypointPixel = mapRef.current?.project([waypoint.lng, waypoint.lat])
        if (waypointPixel) {
          const distance = Math.sqrt(
            Math.pow(e.point.x - waypointPixel.x, 2) + 
            Math.pow(e.point.y - waypointPixel.y, 2)
          )
          
          // 既存のWaypointの近くをクリックした場合は、新規作成しない
          if (distance < clickRadius) {
            return
          }
        }
      }
      
      // ライン付近にWaypointを追加
      if (route.points.length >= 2) {
        // ルートの線幅の1.5倍の範囲内かチェック
        const lineWidth = MAP_CONSTANTS.LINE_WIDTH
        const clickRadius = lineWidth * 1.5 // 線幅の1.5倍
        const bbox: [[number, number], [number, number]] = [
          [e.point.x - clickRadius, e.point.y - clickRadius],
          [e.point.x + clickRadius, e.point.y + clickRadius]
        ]
        
        const features = mapRef.current?.queryRenderedFeatures(bbox, {
          layers: ['route-line']
        })
        
        // ライン付近をクリックした場合のみWaypointを追加
        if (features && features.length > 0) {
          // ライン上の最も近い点を計算
          const closestPoint = findClosestPointOnRoute(
            e.lngLat.lat,
            e.lngLat.lng,
            route.points
          )
          
          // 計算された点にWaypointを配置
          setPendingWaypoint({
            lat: closestPoint.lat,
            lng: closestPoint.lng
          })
          setWaypointDialogOpen(true)
        }
      }
      return
    }
    
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
  }, [editMode, addPoint, insertPoint, route.points, waypoints, setPendingWaypoint, setWaypointDialogOpen, mapRef])
  
  const handleMouseMove = useCallback((e: any) => {
    if (!mapRef.current) return
    
    // Waypointモードの場合、ライン付近でカーソルを変更
    if (editMode === 'waypoint') {
      const canvas = mapRef.current.getCanvas()
      
      // 既存のWaypoint上にカーソルがあるかチェック
      const hoverRadius = 20
      let isOverWaypoint = false
      
      for (const waypoint of waypoints) {
        const waypointPixel = mapRef.current.project([waypoint.lng, waypoint.lat])
        if (waypointPixel) {
          const distance = Math.sqrt(
            Math.pow(e.point.x - waypointPixel.x, 2) + 
            Math.pow(e.point.y - waypointPixel.y, 2)
          )
          
          if (distance < hoverRadius) {
            isOverWaypoint = true
            break
          }
        }
      }
      
      if (isOverWaypoint) {
        canvas.style.cursor = 'pointer'
      } else if (route.points.length >= 2) {
        // ライン付近でカーソルを変更（線幅の1.5倍の範囲）
        const lineWidth = MAP_CONSTANTS.LINE_WIDTH
        const searchRadius = lineWidth * 1.5
        const bbox: [[number, number], [number, number]] = [
          [e.point.x - searchRadius, e.point.y - searchRadius],
          [e.point.x + searchRadius, e.point.y + searchRadius]
        ]
        
        const features = mapRef.current.queryRenderedFeatures(bbox, {
          layers: ['route-line']
        })
        
        if (features && features.length > 0) {
          canvas.style.cursor = 'pointer'
        } else {
          canvas.style.cursor = 'crosshair'
        }
      } else {
        canvas.style.cursor = 'crosshair'
      }
    }
    
    // 中間点のホバー処理
    if (route.points.length <= 2) return
    
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
  }, [route.points, hoveredPointId, setHoveredPoint, editMode, waypoints, mapRef])
  
  const handleMouseEnter = useCallback((e: any) => {
    if (editMode === 'create' && e.features && e.features.length > 0 && e.features[0].layer.id === 'route-line') {
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
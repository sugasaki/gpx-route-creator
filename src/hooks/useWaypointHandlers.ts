import { useCallback, RefObject } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { findClosestPointOnRoute } from '@/utils/geo'
import { MAP_CONSTANTS } from '@/constants/map'

interface UseWaypointHandlersProps {
  mapRef: RefObject<MapRef | null>
}

export function useWaypointHandlers({ mapRef }: UseWaypointHandlersProps) {
  const { route, waypoints } = useRouteStore()
  const { editMode, setPendingWaypoint, setWaypointDialogOpen } = useUIStore()
  
  const isNearExistingWaypoint = useCallback((clickX: number, clickY: number): boolean => {
    if (!mapRef.current) return false
    
    const clickRadius = 20 // Waypointマーカーのクリック判定半径（ピクセル）
    
    for (const waypoint of waypoints) {
      const waypointPixel = mapRef.current.project([waypoint.lng, waypoint.lat])
      if (waypointPixel) {
        const distance = Math.sqrt(
          Math.pow(clickX - waypointPixel.x, 2) + 
          Math.pow(clickY - waypointPixel.y, 2)
        )
        
        if (distance < clickRadius) {
          return true
        }
      }
    }
    
    return false
  }, [waypoints, mapRef])
  
  const isNearRoute = useCallback((clickX: number, clickY: number): boolean => {
    if (!mapRef.current || route.points.length < 2) return false
    
    const lineWidth = MAP_CONSTANTS.LINE_WIDTH
    const clickRadius = lineWidth * 1.5 // 線幅の1.5倍
    const bbox: [[number, number], [number, number]] = [
      [clickX - clickRadius, clickY - clickRadius],
      [clickX + clickRadius, clickY + clickRadius]
    ]
    
    const features = mapRef.current.queryRenderedFeatures(bbox, {
      layers: ['route-line']
    })
    
    return features && features.length > 0
  }, [route.points, mapRef])
  
  const handleWaypointModeClick = useCallback((e: any) => {
    if (editMode !== 'waypoint') return false
    
    // 既存のWaypointの近くをクリックした場合は、新規作成しない
    if (isNearExistingWaypoint(e.point.x, e.point.y)) {
      return true // イベントを処理したことを示す
    }
    
    // ライン付近をクリックした場合のみWaypointを追加
    if (isNearRoute(e.point.x, e.point.y)) {
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
    
    return true // イベントを処理したことを示す
  }, [editMode, isNearExistingWaypoint, isNearRoute, route.points, setPendingWaypoint, setWaypointDialogOpen])
  
  const getCursorForWaypointMode = useCallback((mouseX: number, mouseY: number): string => {
    if (editMode !== 'waypoint') return ''
    
    // 既存のWaypoint上にカーソルがあるか
    if (isNearExistingWaypoint(mouseX, mouseY)) {
      return 'pointer'
    }
    
    // ライン付近にカーソルがあるか
    if (isNearRoute(mouseX, mouseY)) {
      return 'pointer'
    }
    
    return 'crosshair'
  }, [editMode, isNearExistingWaypoint, isNearRoute])
  
  return {
    handleWaypointModeClick,
    getCursorForWaypointMode,
    isNearExistingWaypoint,
    isNearRoute
  }
}
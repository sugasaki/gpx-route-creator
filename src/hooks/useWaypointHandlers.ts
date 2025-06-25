import { useCallback, RefObject } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { findClosestPointOnRoute } from '@/utils/geo'
import { isNearExistingWaypoint, isNearRenderedFeatures } from '@/utils/maplibreHelpers'

interface UseWaypointHandlersProps {
  mapRef: RefObject<MapRef | null>
}

export function useWaypointHandlers({ mapRef }: UseWaypointHandlersProps) {
  const { route, waypoints } = useRouteStore()
  const { editMode, setPendingWaypoint, setWaypointDialogOpen } = useUIStore()
  
  const handleWaypointModeClick = useCallback((e: any) => {
    if (editMode !== 'waypoint') return false
    
    // 既存のWaypointの近くをクリックした場合は、新規作成しない
    if (mapRef.current && isNearExistingWaypoint(e.point.x, e.point.y, waypoints, mapRef.current)) {
      return true // イベントを処理したことを示す
    }
    
    // ライン付近をクリックした場合のみWaypointを追加
    if (mapRef.current && route.points.length >= 2 && isNearRenderedFeatures(e.point.x, e.point.y, mapRef.current, { layers: ['route-line'] })) {
      // ライン上の最も近い点を計算
      const closestPoint = findClosestPointOnRoute(
        e.lngLat.lat,
        e.lngLat.lng,
        route.points
      )
      
      // 計算された点にWaypointを配置
      setPendingWaypoint({
        lat: closestPoint.lat,
        lng: closestPoint.lng,
        nearestPointIndex: closestPoint.nearestPointIndex
      })
      setWaypointDialogOpen(true)
    }
    
    return true // イベントを処理したことを示す
  }, [editMode, waypoints, route.points, setPendingWaypoint, setWaypointDialogOpen, mapRef])
  
  const getCursorForWaypointMode = useCallback((mouseX: number, mouseY: number): string => {
    if (editMode !== 'waypoint') return ''
    
    // 既存のWaypoint上にカーソルがあるか
    if (mapRef.current && isNearExistingWaypoint(mouseX, mouseY, waypoints, mapRef.current)) {
      return 'pointer'
    }
    
    // ライン付近にカーソルがあるか
    if (mapRef.current && route.points.length >= 2 && isNearRenderedFeatures(mouseX, mouseY, mapRef.current, { layers: ['route-line'] })) {
      return 'pointer'
    }
    
    return 'crosshair'
  }, [editMode, waypoints, route.points, mapRef])
  
  return {
    handleWaypointModeClick,
    getCursorForWaypointMode
  }
}
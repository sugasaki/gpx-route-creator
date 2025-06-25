import { useEffect } from 'react'
import { useRouteStore } from '@/store/routeStore'

/**
 * アプリケーション起動時に既存のWaypointの距離を初期化する
 */
export function useInitializeWaypointDistances() {
  const route = useRouteStore((state) => state.route)
  const waypoints = useRouteStore((state) => state.waypoints)
  const updateWaypointDistances = useRouteStore((state) => state.updateWaypointDistances)
  
  useEffect(() => {
    // ルートとWaypointが存在し、距離情報がないWaypointがある場合
    const hasUninitializedWaypoints = waypoints.some(
      w => w.nearestPointIndex !== undefined && w.distanceFromStart === undefined
    )
    
    if (route.points.length >= 2 && waypoints.length > 0 && hasUninitializedWaypoints) {
      updateWaypointDistances()
    }
  }, []) // 初回マウントのみ実行
}
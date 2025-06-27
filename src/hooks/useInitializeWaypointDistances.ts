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
    // ルートとWaypointが存在する場合
    if (route.points.length >= 2 && waypoints.length > 0) {
      // 距離が未計算のWaypointがあるかチェック
      const hasUninitializedWaypoints = waypoints.some(
        w => w.distanceFromStart === undefined
      )
      if (hasUninitializedWaypoints) {
        updateWaypointDistances()
      }
    }
  }, [route.points.length, waypoints, updateWaypointDistances]) // Waypointの内容が変更されたら実行
}
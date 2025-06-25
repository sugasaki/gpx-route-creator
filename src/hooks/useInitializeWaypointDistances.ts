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
    // デバッグログ
    console.log('Initializing waypoint distances...', {
      routePoints: route.points.length,
      waypoints: waypoints.length,
      waypointsData: waypoints
    })
    
    // ルートとWaypointが存在する場合
    if (route.points.length >= 2 && waypoints.length > 0) {
      console.log('Updating waypoint distances...')
      updateWaypointDistances()
    }
  }, [route.points.length, waypoints.length]) // ルートやWaypointが変更されたら実行
}
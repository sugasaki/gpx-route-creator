import { Waypoint, RoutePoint } from '@/types'
import { createWaypoint } from './waypoint-factory'
import { WaypointCalculator } from './waypoint-calculator'

/**
 * Waypoint操作に関するビジネスロジック
 */
export class WaypointManager {
  /**
   * 新しいWaypointを追加する
   */
  static addWaypoint(
    waypoints: Waypoint[],
    waypoint: Omit<Waypoint, 'id' | 'distanceFromStart'>,
    routePoints: RoutePoint[]
  ): Waypoint[] {
    const newWaypoint = createWaypoint(waypoint, routePoints)
    return [...waypoints, newWaypoint]
  }
  
  /**
   * Waypointを更新する
   */
  static updateWaypoint(
    waypoints: Waypoint[],
    id: string,
    updates: Partial<Waypoint>,
    routePoints: RoutePoint[]
  ): Waypoint[] {
    return waypoints.map(w => {
      if (w.id === id) {
        const updatedWaypoint = { ...w, ...updates }
        // 位置や紐付けが変更された場合、距離を再計算
        if (
          updates.nearestPointIndex !== undefined ||
          updates.lat !== undefined ||
          updates.lng !== undefined
        ) {
          updatedWaypoint.distanceFromStart = WaypointCalculator.calculateDistanceToWaypoint(
            updatedWaypoint,
            routePoints
          )
        }
        return updatedWaypoint
      }
      return w
    })
  }
  
  /**
   * Waypointを削除する
   */
  static deleteWaypoint(waypoints: Waypoint[], id: string): Waypoint[] {
    return waypoints.filter(w => w.id !== id)
  }
  
  /**
   * Waypointをルート上の新しい位置に移動する
   */
  static moveWaypointOnRoute(
    waypoints: Waypoint[],
    id: string,
    nearestPointIndex: number,
    routePoints: RoutePoint[]
  ): Waypoint[] {
    return waypoints.map(w => {
      if (w.id === id) {
        const updatedWaypoint = { ...w, nearestPointIndex }
        return WaypointCalculator.updateWaypointDistance(
          updatedWaypoint,
          routePoints
        )
      }
      return w
    })
  }
}
import { Waypoint, RoutePoint } from '@/types'
import { calculateDistanceToWaypoint, calculateAllWaypointDistances } from '@/utils/geo'

/**
 * Waypoint関連の計算ロジック
 */
export class WaypointCalculator {
  /**
   * ルート開始地点からWaypointまでの距離を計算する
   * @param waypoint 対象のWaypoint
   * @param routePoints ルートポイントの配列
   * @returns 距離（キロメートル）
   */
  static calculateDistanceToWaypoint(
    waypoint: Waypoint,
    routePoints: RoutePoint[]
  ): number {
    return calculateDistanceToWaypoint(waypoint, routePoints)
  }
  
  /**
   * Waypointの距離を更新して新しいオブジェクトを返す
   * @param waypoint 対象のWaypoint
   * @param routePoints ルートポイントの配列
   * @returns 距離が更新された新しいWaypointオブジェクト
   */
  static updateWaypointDistance(
    waypoint: Waypoint,
    routePoints: RoutePoint[]
  ): Waypoint {
    return {
      ...waypoint,
      distanceFromStart: this.calculateDistanceToWaypoint(waypoint, routePoints)
    }
  }
  
  /**
   * すべてのWaypointの距離を再計算する
   * @param waypoints Waypointの配列
   * @param routePoints ルートポイントの配列
   * @returns 距離が更新された新しいWaypoint配列
   */
  static updateAllWaypointDistances(
    waypoints: Waypoint[],
    routePoints: RoutePoint[]
  ): Waypoint[] {
    return calculateAllWaypointDistances(waypoints, routePoints)
  }
}
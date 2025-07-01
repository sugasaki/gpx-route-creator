import { Waypoint, RoutePoint } from '@/types'
import { generateId } from './id-generator'
import { calculateDistanceToWaypoint } from '@/utils/geo'

/**
 * Waypointを作成するファクトリー関数
 * @param waypoint - ID と distanceFromStart を除いた Waypoint データ
 * @param routePoints - 距離計算用のルートポイント配列
 * @returns 完全な Waypoint オブジェクト
 */
export const createWaypoint = (
  waypoint: Omit<Waypoint, 'id' | 'distanceFromStart'>,
  routePoints: RoutePoint[]
): Waypoint => {
  const newWaypoint: Waypoint = {
    ...waypoint,
    id: generateId(),
    distanceFromStart: 0 // 一時的な値
  }
  
  // 距離を計算して設定
  newWaypoint.distanceFromStart = calculateDistanceToWaypoint(newWaypoint, routePoints)
  
  return newWaypoint
}
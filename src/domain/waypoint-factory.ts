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
  const id = generateId()
  const newWaypoint: Waypoint = {
    ...waypoint,
    id,
    distanceFromStart: calculateDistanceToWaypoint({ ...waypoint, id } as Waypoint, routePoints)
  }
  
  return newWaypoint
}
import { RoutePoint, Waypoint } from '@/types'
import { parseGPX, readFileAsText } from './gpxParser'

/**
 * GPXファイルの検証
 */
export function isValidGPXFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.gpx')
}

/**
 * GPXファイルを処理してルートポイントとウェイポイントを返す
 */
export async function processGPXFile(file: File): Promise<{
  routePoints: Omit<RoutePoint, 'id'>[]
  waypoints: Omit<Waypoint, 'id' | 'nearestPointIndex' | 'distanceFromStart'>[]
}> {
  const content = await readFileAsText(file)
  return parseGPX(content)
}

/**
 * 既存ルートの置換確認
 */
export function confirmRouteReplacement(hasExistingRoute: boolean): boolean {
  if (!hasExistingRoute) return true
  
  return window.confirm(
    'This will replace the existing route. Do you want to continue?'
  )
}

/**
 * GPXデータをルートストアに適用
 */
export interface GPXImportActions {
  clearRoute: () => void
  addPoint: (point: Omit<RoutePoint, 'id'>) => void
  addWaypoint: (waypoint: Omit<Waypoint, 'id'>) => void
}

export function applyGPXData(
  routePoints: Omit<RoutePoint, 'id'>[],
  waypoints: Omit<Waypoint, 'id' | 'nearestPointIndex' | 'distanceFromStart'>[],
  actions: GPXImportActions
): void {
  // ルートをクリア
  actions.clearRoute()
  
  // ルートポイントを追加
  routePoints.forEach(point => {
    actions.addPoint({
      lat: point.lat,
      lng: point.lng,
      elevation: point.elevation
    })
  })
  
  // ウェイポイントを追加
  waypoints.forEach(waypoint => {
    actions.addWaypoint(waypoint)
  })
}
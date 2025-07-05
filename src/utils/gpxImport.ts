import { RoutePoint, Waypoint } from '@/types'
import { parseGPX, readFileAsText } from './gpxParser'
import { calculateDistanceToWaypoint } from './geo'
import { findNearestSegmentIndex } from './geoHelpers'

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
  getRoutePoints: () => RoutePoint[]
}

export function applyGPXData(
  routePoints: Omit<RoutePoint, 'id'>[],
  waypoints: Omit<Waypoint, 'id' | 'nearestPointIndex' | 'distanceFromStart'>[],
  actions: GPXImportActions
): void {
  // ルートをクリア
  actions.clearRoute()
  
  // ルートポイントを追加し、追加されたポイントを追跡
  // IDが付与されていないため、元のroutePointsデータを使用する
  const addedRoutePoints: RoutePoint[] = []
  routePoints.forEach((point, index) => {
    actions.addPoint({
      lat: point.lat,
      lng: point.lng,
      elevation: point.elevation
    })
    // 追加されたポイントをシミュレート（実際のIDは不明だが、順序は保証される）
    addedRoutePoints.push({
      id: `temp-${index}`,
      lat: point.lat,
      lng: point.lng,
      elevation: point.elevation
    })
  })
  
  // 追加したルートポイントを使用してWaypoint計算を行う
  waypoints.forEach((waypoint) => {
    // 最も近いセグメントのインデックスを見つける
    const nearestPointIndex = findNearestSegmentIndex(
      waypoint.lat,
      waypoint.lng,
      addedRoutePoints
    )
    
    // 距離を計算
    const waypointWithIndex = {
      ...waypoint,
      nearestPointIndex
    }
    const distanceFromStart = calculateDistanceToWaypoint(
      waypointWithIndex as Waypoint,
      addedRoutePoints
    )
    
    // nearestPointIndexとdistanceFromStartを含めて追加
    actions.addWaypoint({
      ...waypointWithIndex,
      distanceFromStart
    })
  })
}
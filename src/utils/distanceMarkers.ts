import * as turf from '@turf/turf'
import { RoutePoint } from '@/types'

export interface DistanceMarker {
  id: string
  lat: number
  lng: number
  distance: number // km単位の距離
}

/**
 * ルート上に指定間隔で距離マーカーを生成する
 * @param routePoints ルートポイントの配列
 * @param intervalKm マーカー間隔（km）
 * @returns 距離マーカーの配列
 */
export function generateDistanceMarkers(
  routePoints: RoutePoint[],
  intervalKm: number = 1
): DistanceMarker[] {
  if (routePoints.length < 2 || intervalKm <= 0) {
    return []
  }

  const markers: DistanceMarker[] = []
  
  // ルートラインを作成
  const coordinates = routePoints.map(point => [point.lng, point.lat])
  const line = turf.lineString(coordinates)
  
  // ルート全体の長さを取得（km単位）
  const totalLength = turf.lineDistance(line, 'kilometers')
  
  // 指定間隔でマーカーを生成
  let currentDistance = intervalKm
  while (currentDistance < totalLength) {
    // 指定距離の位置を計算
    const point = turf.along(line, currentDistance, 'kilometers')
    const [lng, lat] = point.geometry.coordinates
    
    markers.push({
      id: `marker-${currentDistance}`,
      lat,
      lng,
      distance: currentDistance
    })
    
    currentDistance += intervalKm
  }
  
  return markers
}

/**
 * ビューポート内のマーカーのみをフィルタリングする
 * @param markers 全てのマーカー
 * @param bounds ビューポートの境界
 * @returns ビューポート内のマーカー
 */
export function filterMarkersInViewport(
  markers: DistanceMarker[],
  bounds: { north: number; south: number; east: number; west: number }
): DistanceMarker[] {
  return markers.filter(marker => {
    const { lat, lng } = marker
    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    )
  })
}

/**
 * 距離を表示用の文字列にフォーマットする
 * @param distanceKm 距離（km）
 * @returns フォーマット済みの文字列
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 10) {
    return `${distanceKm}`
  } else {
    return `${Math.round(distanceKm)}`
  }
}
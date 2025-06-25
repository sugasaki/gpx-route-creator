import * as turf from 'turf'
import { RoutePoint } from '@/types'

export interface DistanceMarker {
  id: string
  lat: number
  lng: number
  distance: number // km単位の距離
}

/**
 * ルートの総距離に基づいて適切なマーカー間隔を計算する
 * @param totalDistanceKm ルートの総距離（km）
 * @returns 適切なマーカー間隔（km）
 */
export function calculateOptimalInterval(totalDistanceKm: number): number {
  if (totalDistanceKm <= 10) {
    return 1 // 0-10km: 1kmごと
  } else if (totalDistanceKm <= 50) {
    return 5 // 10-50km: 5kmごと
  } else if (totalDistanceKm <= 100) {
    return 10 // 50-100km: 10kmごと
  } else if (totalDistanceKm <= 500) {
    return 20 // 100-500km: 20kmごと
  } else {
    return 50 // 500km以上: 50kmごと
  }
}

/**
 * ルート上に指定間隔で距離マーカーを生成する
 * @param routePoints ルートポイントの配列
 * @param intervalKm マーカー間隔（km）- 省略時は自動計算
 * @returns 距離マーカーの配列
 */
export function generateDistanceMarkers(
  routePoints: RoutePoint[],
  intervalKm?: number
): DistanceMarker[] {
  if (routePoints.length < 2) {
    return []
  }

  const markers: DistanceMarker[] = []
  
  // ルートラインを作成
  const coordinates = routePoints.map(point => [point.lng, point.lat])
  const line = turf.lineString(coordinates)
  
  // ルート全体の長さを取得（km単位）
  const totalLength = turf.lineDistance(line, 'kilometers')
  
  // 間隔が指定されていない場合は、総距離に基づいて自動計算
  const interval = intervalKm ?? calculateOptimalInterval(totalLength)
  
  if (interval <= 0) {
    return []
  }
  
  // 指定間隔でマーカーを生成
  let currentDistance = interval
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
    
    currentDistance += interval
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

/**
 * 距離マーカーをGeoJSON形式に変換する
 * @param markers 距離マーカーの配列
 * @returns GeoJSON FeatureCollection
 */
export function markersToGeoJSON(markers: DistanceMarker[]) {
  return {
    type: 'FeatureCollection' as const,
    features: markers.map(marker => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.lng, marker.lat]
      },
      properties: {
        id: marker.id,
        distance: marker.distance,
        label: formatDistance(marker.distance)
      }
    }))
  }
}
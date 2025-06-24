import { RoutePoint } from '@/types'

/**
 * ルートラインのGeoJSONを生成
 */
export function getLineGeoJSON(points: RoutePoint[]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: points.map(p => [p.lng, p.lat])
    }
  }
}

/**
 * 状態に基づいてマーカーの色を取得
 */
export function getMarkerColor(
  isDragging: boolean,
  isSelected: boolean,
  isFirst: boolean,
  isLast: boolean
): string {
  if (isDragging) return '#ef4444' // red
  if (isSelected) return '#10b981' // green
  if (isFirst) return '#3b82f6' // blue
  if (isLast) return '#f59e0b' // orange
  return '#6b7280' // gray
}
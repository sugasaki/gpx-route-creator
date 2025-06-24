import { Waypoint } from '@/types'
import { MapRef } from 'react-map-gl/maplibre'
import { MAP_CONSTANTS } from '@/constants/map'

/**
 * クリック位置が既存のWaypointの近くかどうかを判定
 * MapLibre GLのprojectメソッドを使用して座標をスクリーンピクセルに変換
 */
export function isNearExistingWaypoint(
  clickX: number,
  clickY: number,
  waypoints: Waypoint[],
  mapRef: MapRef
): boolean {
  const clickRadius = 20 // Waypointマーカーのクリック判定半径（ピクセル）
  
  for (const waypoint of waypoints) {
    const waypointPixel = mapRef.project([waypoint.lng, waypoint.lat])
    if (waypointPixel) {
      const distance = Math.sqrt(
        Math.pow(clickX - waypointPixel.x, 2) + 
        Math.pow(clickY - waypointPixel.y, 2)
      )
      
      if (distance < clickRadius) {
        return true
      }
    }
  }
  
  return false
}

/**
 * 指定されたレイヤー上のレンダリングされたフィーチャーの近くをクリックしたかどうかを判定
 * 
 * MapLibre GLのqueryRenderedFeaturesを使用して、指定された座標周辺の
 * レンダリングされたフィーチャーを検出します。
 * 
 * @param clickX - クリックX座標（ピクセル）
 * @param clickY - クリックY座標（ピクセル）
 * @param mapRef - MapLibre GLのマップ参照
 * @param options - 検出オプション
 * @param options.layers - 検索対象のレイヤーID配列
 * @param options.clickRadiusMultiplier - クリック判定半径の倍率（デフォルト: 1.5）
 * @param options.clickRadiusPixels - クリック判定半径（ピクセル）。指定時は倍率より優先
 * @returns 指定範囲内にフィーチャーが存在する場合true
 */
export function isNearRenderedFeatures(
  clickX: number,
  clickY: number,
  mapRef: MapRef,
  options: {
    layers: string[]
    clickRadiusMultiplier?: number
    clickRadiusPixels?: number
  }
): boolean {
  const { layers, clickRadiusMultiplier = 1.5, clickRadiusPixels } = options
  
  // 指定されたピクセル半径を使用するか、線幅から計算
  const clickRadius = clickRadiusPixels ?? (MAP_CONSTANTS.LINE_WIDTH * clickRadiusMultiplier)
  
  const bbox: [[number, number], [number, number]] = [
    [clickX - clickRadius, clickY - clickRadius],
    [clickX + clickRadius, clickY + clickRadius]
  ]
  
  const features = mapRef.queryRenderedFeatures(bbox, { layers })
  
  return !!features && features.length > 0
}


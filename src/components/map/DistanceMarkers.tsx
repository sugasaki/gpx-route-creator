import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import { useMap } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { generateDistanceMarkers, filterMarkersInViewport, markersToGeoJSON } from '@/utils/distanceMarkers'

export default function DistanceMarkers() {
  const { current: map } = useMap()
  const { route } = useRouteStore()
  const [visibleMarkers, setVisibleMarkers] = useState<ReturnType<typeof generateDistanceMarkers>>([])
  const updateTimeoutRef = useRef<number | null>(null)
  const markerInterval = 1 // 1km固定
  
  // 全マーカーを計算（メモ化）
  const allMarkers = useMemo(() => {
    if (route.points.length < 2) {
      return []
    }
    return generateDistanceMarkers(route.points, markerInterval)
  }, [route.points, markerInterval])
  
  // ビューポートが変更されたときの処理（デバウンス付き）
  const updateVisibleMarkers = useCallback(() => {
    if (!map || allMarkers.length === 0) {
      setVisibleMarkers([])
      return
    }
    
    // 既存のタイムアウトをクリア
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current)
    }
    
    // デバウンス処理: 地図の移動・ズーム中は高頻度でイベントが発生するため、
    // パフォーマンス最適化のために100ms間隔で処理を間引く。
    // これにより、スムーズな地図操作を維持しながら、必要な更新を行う。
    updateTimeoutRef.current = window.setTimeout(() => {
      const bounds = map.getBounds()
      const viewport = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
      
      // ビューポートを10%拡張して、画面端でのマーカーの見切れを防ぐ。
      // ユーザーが地図を素早く動かしても、マーカーが突然現れたり消えたりしない。
      const latRange = viewport.north - viewport.south
      const lngRange = viewport.east - viewport.west
      const expandedViewport = {
        north: viewport.north + latRange * 0.1,
        south: viewport.south - latRange * 0.1,
        east: viewport.east + lngRange * 0.1,
        west: viewport.west - lngRange * 0.1
      }
      
      const filtered = filterMarkersInViewport(allMarkers, expandedViewport)
      setVisibleMarkers(filtered)
    }, 100) // 100msのデバウンス
  }, [map, allMarkers])
  
  // マップの移動・ズーム時にビューポート内のマーカーを更新
  useEffect(() => {
    if (!map) return
    
    const handleViewportChange = () => {
      updateVisibleMarkers()
    }
    
    // 初回実行
    updateVisibleMarkers()
    
    // イベントリスナー登録
    map.on('move', handleViewportChange)
    map.on('zoom', handleViewportChange)
    map.on('moveend', handleViewportChange)
    map.on('zoomend', handleViewportChange)
    
    return () => {
      map.off('move', handleViewportChange)
      map.off('zoom', handleViewportChange)
      map.off('moveend', handleViewportChange)
      map.off('zoomend', handleViewportChange)
      // クリーンアップ時にタイムアウトもクリア
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [map, updateVisibleMarkers])
  
  if (visibleMarkers.length === 0) {
    return null
  }
  
  // GeoJSONデータを作成
  const geojson = markersToGeoJSON(visibleMarkers)
  
  return (
    <Source id="distance-markers" type="geojson" data={geojson}>
      {/* マーカーの背景円 */}
      <Layer
        id="distance-markers-circle"
        type="circle"
        paint={{
          'circle-radius': 8,
          'circle-color': '#3B82F6', // blue-500
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 1
        }}
      />
      {/* 距離ラベル */}
      <Layer
        id="distance-markers-label"
        type="symbol"
        layout={{
          'text-field': '{label}',
          'text-size': 10,
          'text-anchor': 'center'
        }}
        paint={{
          'text-color': '#FFFFFF',
          'text-halo-color': '#3B82F6',
          'text-halo-width': 1
        }}
      />
    </Source>
  )
}
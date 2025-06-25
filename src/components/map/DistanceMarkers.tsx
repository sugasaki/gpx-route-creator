import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import { useMap } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useDistanceMarkerStore } from '@/store/distanceMarkerStore'
import { generateDistanceMarkers, filterMarkersInViewport, formatDistance } from '@/utils/distanceMarkers'

export default function DistanceMarkers() {
  const { current: map } = useMap()
  const { route } = useRouteStore()
  const { isDistanceMarkersVisible, markerInterval } = useDistanceMarkerStore()
  const [visibleMarkers, setVisibleMarkers] = useState<ReturnType<typeof generateDistanceMarkers>>([])
  const updateTimeoutRef = useRef<number | null>(null)
  
  // 全マーカーを計算（メモ化）
  const allMarkers = useMemo(() => {
    if (!isDistanceMarkersVisible || route.points.length < 2) {
      return []
    }
    return generateDistanceMarkers(route.points, markerInterval)
  }, [route.points, isDistanceMarkersVisible, markerInterval])
  
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
    
    // デバウンス処理
    updateTimeoutRef.current = window.setTimeout(() => {
      const bounds = map.getBounds()
      const viewport = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }
      
      // ビューポートを少し拡張して、端の見切れを防ぐ
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
    
    // イベントリスナー登録（move中も更新）
    map.on('move', handleViewportChange)
    map.on('zoom', handleViewportChange)
    
    return () => {
      map.off('move', handleViewportChange)
      map.off('zoom', handleViewportChange)
      // クリーンアップ時にタイムアウトもクリア
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [map, updateVisibleMarkers])
  
  if (!isDistanceMarkersVisible || visibleMarkers.length === 0) {
    return null
  }
  
  // GeoJSONデータを作成
  const geojson = {
    type: 'FeatureCollection' as const,
    features: visibleMarkers.map(marker => ({
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
  
  return (
    <Source id="distance-markers" type="geojson" data={geojson}>
      {/* マーカーの背景円 */}
      <Layer
        id="distance-markers-circle"
        type="circle"
        paint={{
          'circle-radius': 16,
          'circle-color': '#3B82F6', // blue-500
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }}
      />
      {/* 距離ラベル */}
      <Layer
        id="distance-markers-label"
        type="symbol"
        layout={{
          'text-field': '{label}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
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
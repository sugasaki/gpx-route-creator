import { useMemo } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import { useRouteStore } from '@/store/routeStore'
import { useDistanceMarkerStore } from '@/store/distanceMarkerStore'
import { generateDistanceMarkers, markersToGeoJSON } from '@/utils/distanceMarkers'

export default function DistanceMarkers() {
  const { route } = useRouteStore()
  const { markerInterval } = useDistanceMarkerStore()
  
  // 全マーカーを計算（メモ化）
  const allMarkers = useMemo(() => {
    if (markerInterval === 'off' || route.points.length < 2) {
      return []
    }
    
    // 'auto'の場合はundefinedを渡して自動計算させる
    const intervalKm = markerInterval === 'auto' ? undefined : markerInterval
    return generateDistanceMarkers(route.points, intervalKm)
  }, [route.points, markerInterval])
  
  if (markerInterval === 'off' || allMarkers.length === 0) {
    return null
  }
  
  // GeoJSONデータを作成
  const geojson = markersToGeoJSON(allMarkers)
  
  return (
    <Source id="distance-markers" type="geojson" data={geojson}>
      {/* 距離ラベル（背景付き） */}
      <Layer
        id="distance-markers-label"
        type="symbol"
        layout={{
          'text-field': '{label}',
          'text-size': 12,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center',
          'text-padding': 2,
          'text-allow-overlap': true
        }}
        paint={{
          'text-color': '#3B82F6', // blue-500
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 8,
          'text-halo-blur': 0
        }}
      />
    </Source>
  )
}
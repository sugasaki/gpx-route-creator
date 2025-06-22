import { Source, Layer } from 'react-map-gl/maplibre'
import { MAP_CONSTANTS } from '../../constants/map'
import { useRouteStore } from '../../store/routeStore'
import { useColorStore } from '../../store/colorStore'
import { getLineGeoJSON } from '../../utils/mapHelpers'

export default function RouteLine() {
  const { route } = useRouteStore()
  const { routeLineColor } = useColorStore()
  
  if (route.points.length <= 1) return null
  
  return (
    <Source
      id="route-source"
      type="geojson"
      data={getLineGeoJSON(route.points)}
    >
      <Layer
        id="route-line-hover"
        type="line"
        paint={{
          'line-color': routeLineColor,
          'line-width': MAP_CONSTANTS.LINE_HOVER_WIDTH,
          'line-opacity': MAP_CONSTANTS.LINE_HOVER_OPACITY
        }}
      />
      <Layer
        id="route-line"
        type="line"
        paint={{
          'line-color': routeLineColor,
          'line-width': MAP_CONSTANTS.LINE_WIDTH,
          'line-opacity': MAP_CONSTANTS.LINE_OPACITY
        }}
      />
    </Source>
  )
}
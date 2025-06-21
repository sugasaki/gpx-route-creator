import { useRef } from 'react'
import Map, { MapRef, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'
import { useMapHandlers } from '../hooks/useMapHandlers'
import { getLineGeoJSON } from '../utils/mapHelpers'
import { MAP_CONSTANTS } from '../constants/map'
import MapControls from './MapControls'
import RouteMarker from './RouteMarker'

export default function MapComponent() {
  const mapRef = useRef<MapRef>(null)
  const { route } = useRouteStore()
  const { editMode, hoveredPointId } = useUIStore()
  
  const {
    handleMapClick,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  } = useMapHandlers({ mapRef })
  
  const shouldShowInteractiveLine = editMode === 'create' && route.points.length > 1
  
  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapStyle={MAP_CONSTANTS.STYLE_URL}
        initialViewState={MAP_CONSTANTS.INITIAL_VIEW_STATE}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        interactiveLayerIds={shouldShowInteractiveLine ? ['route-line'] : []}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {route.points.length > 1 && (
          <Source
            id="route-source"
            type="geojson"
            data={getLineGeoJSON(route.points)}
          >
            <Layer
              id="route-line-hover"
              type="line"
              paint={{
                'line-color': MAP_CONSTANTS.COLORS.LINE,
                'line-width': MAP_CONSTANTS.LINE_HOVER_WIDTH,
                'line-opacity': MAP_CONSTANTS.LINE_HOVER_OPACITY
              }}
            />
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': MAP_CONSTANTS.COLORS.LINE,
                'line-width': MAP_CONSTANTS.LINE_WIDTH,
                'line-opacity': MAP_CONSTANTS.LINE_OPACITY
              }}
            />
          </Source>
        )}
        
        {route.points.map((point, index) => {
          const isEndpoint = index === 0 || index === route.points.length - 1
          const isHovered = hoveredPointId === point.id
          
          // Endpoints are always visible, middle points only when hovered
          const isVisible = isEndpoint || isHovered || route.points.length <= 2
          
          return (
            <RouteMarker
              key={point.id}
              point={point}
              index={index}
              isFirst={index === 0}
              isLast={index === route.points.length - 1}
              isVisible={isVisible}
            />
          )
        })}
      </Map>
      
      <MapControls />
    </div>
  )
}
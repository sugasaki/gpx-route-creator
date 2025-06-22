import { useRef } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useMapHandlers } from '../hooks/useMapHandlers'
import MapControls from './MapControls'
import MapContainer from './map/MapContainer'
import RouteLine from './map/RouteLine'
import RouteMarkers from './map/RouteMarkers'
import SelectionOverlay from './SelectionOverlay'

export default function MapComponent() {
  const mapRef = useRef<MapRef>(null)
  
  const {
    handleMapClick,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  } = useMapHandlers({ mapRef })
  
  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <RouteLine />
        <RouteMarkers />
      </MapContainer>
      
      <SelectionOverlay mapRef={mapRef} />
      <MapControls />
    </div>
  )
}
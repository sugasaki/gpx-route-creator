import { useRef } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useMapHandlers } from '@/hooks/useMapHandlers'
import MapControls from '@/components/MapControls'
import MapContainer from '@/components/map/MapContainer'
import RouteLine from '@/components/map/RouteLine'
import RouteMarkers from '@/components/map/RouteMarkers'
import WaypointMarkers from '@/components/map/WaypointMarkers'
import DistanceMarkers from '@/components/map/DistanceMarkers'
import SelectionOverlay from '@/components/SelectionOverlay'
import WaypointDialog from '@/components/WaypointDialog'

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
        <DistanceMarkers />
        <RouteMarkers />
        <WaypointMarkers />
      </MapContainer>
      
      <SelectionOverlay mapRef={mapRef} />
      <MapControls />
      <WaypointDialog />
    </div>
  )
}
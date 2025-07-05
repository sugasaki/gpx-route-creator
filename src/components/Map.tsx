import { useRef } from 'react'
import { MapRef } from 'react-map-gl/maplibre'
import { useMapHandlers } from '@/hooks/useMapHandlers'
import MapControls from '@/components/MapControls'
import MobileMapControls from '@/components/MobileMapControls'
import MapContainer from '@/components/map/MapContainer'
import RouteLine from '@/components/map/RouteLine'
import RouteMarkers from '@/components/map/RouteMarkers'
import WaypointMarkers from '@/components/map/WaypointMarkers'
import DistanceMarkers from '@/components/map/DistanceMarkers'
import SelectionOverlay from '@/components/SelectionOverlay'
import TouchSelectionOverlay from '@/components/TouchSelectionOverlay'
import WaypointDialog from '@/components/WaypointDialog'
import { isTouchDevice } from '@/utils/device'

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
      
      {isTouchDevice() ? (
        <TouchSelectionOverlay mapRef={mapRef} />
      ) : (
        <SelectionOverlay mapRef={mapRef} />
      )}
      {isTouchDevice() ? <MobileMapControls /> : <MapControls />}
      <WaypointDialog />
    </div>
  )
}
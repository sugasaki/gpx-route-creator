import { forwardRef } from 'react'
import Map, { MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { MAP_CONSTANTS, MAP_STYLES } from '@/constants/map'

interface MapContainerProps {
  onClick: (e: any) => void
  onMouseMove: (e: any) => void
  onMouseEnter: (e: any) => void
  onMouseLeave: (e: any) => void
  children: React.ReactNode
}

const MapContainer = forwardRef<MapRef, MapContainerProps>(
  ({ onClick, onMouseMove, onMouseEnter, onMouseLeave, children }, ref) => {
    const { route } = useRouteStore()
    const { editMode, mapStyle } = useUIStore()
    
    const shouldShowInteractiveLine = (editMode === 'create' || editMode === 'edit' || editMode === 'waypoint') && route.points.length > 1
    const selectedStyle = MAP_STYLES[mapStyle]
    
    // Fallback to dark style if selected style has no URL (missing API key)
    const mapStyleUrl = selectedStyle.url || MAP_STYLES.dark.url
    
    return (
      <Map
        ref={ref}
        mapStyle={mapStyleUrl}
        initialViewState={MAP_CONSTANTS.INITIAL_VIEW_STATE}
        onClick={onClick}
        onMouseMove={onMouseMove}
        interactiveLayerIds={shouldShowInteractiveLine ? ['route-line'] : []}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </Map>
    )
  }
)

MapContainer.displayName = 'MapContainer'

export default MapContainer
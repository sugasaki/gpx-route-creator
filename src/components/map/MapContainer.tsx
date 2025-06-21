import { forwardRef } from 'react'
import Map, { MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/uiStore'
import { MAP_CONSTANTS } from '../../constants/map'

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
    const { editMode } = useUIStore()
    
    const shouldShowInteractiveLine = editMode === 'create' && route.points.length > 1
    
    return (
      <div className={editMode === 'create' ? 'map-cursor-crosshair' : ''}>
        <Map
          ref={ref}
          mapStyle={MAP_CONSTANTS.STYLE_URL}
          initialViewState={MAP_CONSTANTS.INITIAL_VIEW_STATE}
          onClick={onClick}
          onMouseMove={onMouseMove}
          interactiveLayerIds={shouldShowInteractiveLine ? ['route-line'] : []}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </Map>
      </div>
    )
  }
)

MapContainer.displayName = 'MapContainer'

export default MapContainer
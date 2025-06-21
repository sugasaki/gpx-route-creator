import { Marker } from 'react-map-gl/maplibre'
import { RoutePoint } from '../types'
import { useMarkerDrag } from '../hooks/useMarkerDrag'
import { getMarkerColor } from '../utils/mapHelpers'
import { useUIStore } from '../store/uiStore'

interface RouteMarkerProps {
  point: RoutePoint
  index: number
  isFirst: boolean
  isLast: boolean
  isVisible: boolean
}

export default function RouteMarker({ point, isFirst, isLast, isVisible }: RouteMarkerProps) {
  const {
    isDragging,
    isSelected,
    canDrag,
    canDelete,
    handlers
  } = useMarkerDrag({ point, isFirst, isLast })
  
  const { editMode } = useUIStore()
  const markerColor = getMarkerColor(isDragging, isSelected, isFirst, isLast)
  
  // Show tooltip for deletable points
  const showDeleteHint = isSelected && canDelete && editMode === 'edit'
  
  return (
    <Marker
      longitude={point.lng}
      latitude={point.lat}
      draggable={canDrag}
      {...handlers}
    >
      <div className="relative">
        <div
          className={`
            rounded-full border border-white shadow-lg cursor-pointer
            transition-all duration-200 hover:scale-110
            ${isDragging ? 'scale-125' : ''}
            ${(isFirst || isLast) ? 'w-4 h-4' : 'w-3.5 h-3.5'}
            ${!isVisible ? 'opacity-0 pointer-events-none' : ''}
            ${isFirst ? 'border-2' : ''}
            ${isLast ? 'border-2 border-dashed' : ''}
            ${showDeleteHint ? 'ring-2 ring-red-500 ring-offset-2' : ''}
          `}
          style={{ 
            backgroundColor: markerColor,
            transition: 'opacity 0.2s, box-shadow 0.2s'
          }}
        />
        
        {showDeleteHint && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              クリックまたはDeleteキーで削除
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Marker>
  )
}
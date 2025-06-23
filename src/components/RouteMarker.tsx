import { Marker } from 'react-map-gl/maplibre'
import { RoutePoint } from '@/types'
import { useMarkerDrag } from '@/hooks/useMarkerDrag'
import { getMarkerColor } from '@/utils/mapHelpers'

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
    handlers
  } = useMarkerDrag({ point, isFirst, isLast })
  
  const markerColor = getMarkerColor(isDragging, isSelected, isFirst, isLast)
  
  return (
    <Marker
      longitude={point.lng}
      latitude={point.lat}
      draggable={canDrag}
      {...handlers}
    >
      <div
        className={`
          rounded-full border border-white shadow-lg cursor-pointer
          transition-all duration-200 hover:scale-110
          ${isDragging ? 'scale-125' : ''}
          ${(isFirst || isLast) ? 'w-4 h-4' : 'w-3.5 h-3.5'}
          ${!isVisible ? 'opacity-0 pointer-events-none' : ''}
          ${isFirst ? 'border-2' : ''}
          ${isLast ? 'border-2 border-dashed' : ''}
        `}
        style={{ 
          backgroundColor: markerColor,
          transition: 'opacity 0.2s'
        }}
      />
    </Marker>
  )
}
import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/uiStore'
import RouteMarker from '../RouteMarker'

export default function RouteMarkers() {
  const { route } = useRouteStore()
  const { hoveredPointId } = useUIStore()
  
  return (
    <>
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
    </>
  )
}
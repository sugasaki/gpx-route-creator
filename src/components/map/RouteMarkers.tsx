import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import RouteMarker from '@/components/RouteMarker'

export default function RouteMarkers() {
  const { route } = useRouteStore()
  const { hoveredPointId, editMode } = useUIStore()
  
  return (
    <>
      {route.points.map((point, index) => {
        const isEndpoint = index === 0 || index === route.points.length - 1
        const isHovered = hoveredPointId === point.id
        
        // 削除モードまたは矩形削除モードの場合は全てのポイントを表示
        // それ以外の場合は、エンドポイントは常に表示、中間点はホバー時のみ
        const isVisible = editMode === 'delete' || editMode === 'delete-range' || isEndpoint || isHovered || route.points.length <= 2
        
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
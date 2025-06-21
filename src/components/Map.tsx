import { useRef, useCallback } from 'react'
import Map, { MapRef, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'
import MapControls from './MapControls'
import RouteMarker from './RouteMarker'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'

// Helper function to calculate distance from point to line segment
function distanceToSegment(
  px: number, py: number, // point
  x1: number, y1: number, // segment start
  x2: number, y2: number  // segment end
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  
  if (dx === 0 && dy === 0) {
    // Segment is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  }
  
  // Calculate projection parameter t
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  
  // Find the closest point on the segment
  const closestX = x1 + t * dx
  const closestY = y1 + t * dy
  
  // Calculate distance
  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2)
}

export default function MapComponent() {
  const mapRef = useRef<MapRef>(null)
  const { route, addPoint, insertPoint } = useRouteStore()
  const { editMode, hoveredPointId, setHoveredPoint } = useUIStore()
  
  const handleMapClick = useCallback((e: any) => {
    if (editMode !== 'create') return
    
    // Check if we clicked on the line
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ['route-line']
    })
    
    if (features && features.length > 0) {
      // Clicked on the line - find the best insertion point
      const clickPoint = e.lngLat
      const coordinates = route.points
      
      // Find the closest segment
      let minDistance = Infinity
      let insertIndex = 1
      
      for (let i = 0; i < coordinates.length - 1; i++) {
        const p1 = coordinates[i]
        const p2 = coordinates[i + 1]
        
        // Calculate distance from click point to line segment
        const segmentDistance = distanceToSegment(
          clickPoint.lat, clickPoint.lng,
          p1.lat, p1.lng,
          p2.lat, p2.lng
        )
        
        if (segmentDistance < minDistance) {
          minDistance = segmentDistance
          insertIndex = i + 1
        }
      }
      
      insertPoint(insertIndex, {
        lat: clickPoint.lat,
        lng: clickPoint.lng
      })
    } else {
      // Clicked on empty space - add to end
      addPoint({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      })
    }
  }, [editMode, addPoint, insertPoint, route.points])
  
  const handleMouseMove = useCallback((e: any) => {
    if (!mapRef.current || route.points.length <= 2) return
    
    const { point } = e
    const threshold = 20 // pixels (reduced for smaller markers)
    
    // Check distance to middle points only
    let closestPoint = null
    let minDistance = threshold
    
    for (let i = 1; i < route.points.length - 1; i++) {
      const routePoint = route.points[i]
      const pixel = mapRef.current.project([routePoint.lng, routePoint.lat])
      const distance = Math.sqrt(
        (point.x - pixel.x) ** 2 + (point.y - pixel.y) ** 2
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = routePoint
      }
    }
    
    if (closestPoint) {
      setHoveredPoint(closestPoint.id)
    } else if (hoveredPointId) {
      // Check if currently hovered point is a middle point
      const hoveredIndex = route.points.findIndex(p => p.id === hoveredPointId)
      if (hoveredIndex > 0 && hoveredIndex < route.points.length - 1) {
        setHoveredPoint(null)
      }
    }
  }, [route.points, hoveredPointId, setHoveredPoint])
  
  const getLineGeoJSON = () => {
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: route.points.map(p => [p.lng, p.lat])
      }
    }
  }
  
  
  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={{
          longitude: 139.7528,
          latitude: 35.6854,
          zoom: 14
        }}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        interactiveLayerIds={editMode === 'create' && route.points.length > 1 ? ['route-line'] : []}
        onMouseEnter={(e) => {
          if (editMode === 'create' && e.features && e.features.length > 0 && e.features[0].layer.id === 'route-line') {
            e.target.getCanvas().style.cursor = 'pointer'
          }
        }}
        onMouseLeave={(e) => {
          e.target.getCanvas().style.cursor = ''
        }}
      >
        {route.points.length > 1 && (
          <Source
            id="route-source"
            type="geojson"
            data={getLineGeoJSON()}
          >
            <Layer
              id="route-line-hover"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 12,
                'line-opacity': 0.2
              }}
            />
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8
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
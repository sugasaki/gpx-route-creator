import { useRouteStore } from '@/store/routeStore'

export default function RouteInfoBar() {
  const { route } = useRouteStore()
  const hasRoute = route.points.length > 0
  
  if (!hasRoute) return null
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">
          {(route.distance / 1000).toFixed(2)} km
        </span>
        <span className="text-gray-400">Distance</span>
        <span className="font-medium">
          0 m
        </span>
        <span className="text-gray-400">Elevation</span>
      </div>
    </div>
  )
}
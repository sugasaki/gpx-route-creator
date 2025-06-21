import { useRouteStore } from '../../store/routeStore'
import { downloadGPX } from '../../utils/gpx'
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export default function RouteActions() {
  const { route, clearRoute } = useRouteStore()
  const hasRoute = route.points.length > 0
  
  const handleExportGPX = () => {
    downloadGPX(route.points)
  }
  
  return (
    <>
      <button
        onClick={clearRoute}
        disabled={!hasRoute}
        className={`
          p-3 bg-white rounded-lg shadow-lg transition-all
          ${hasRoute 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title="Clear route"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={handleExportGPX}
        disabled={!hasRoute}
        className={`
          p-3 bg-white rounded-lg shadow-lg transition-all
          ${hasRoute 
            ? 'text-gray-700 hover:bg-gray-100' 
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title="Export GPX"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
      </button>
    </>
  )
}
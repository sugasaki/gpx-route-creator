import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'
import { downloadGPX } from '../utils/gpx'
import { 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'

export default function MapControls() {
  const { route, undo, redo, clearRoute, history, historyIndex } = useRouteStore()
  const { editMode, setEditMode } = useUIStore()
  
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const hasRoute = route.points.length > 0
  
  const handleExportGPX = () => {
    downloadGPX(route.points)
  }
  
  return (
    <>
      {/* Top bar with distance and elevation */}
      {hasRoute && (
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
      )}
      
      {/* Right side controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={() => setEditMode(editMode === 'create' ? 'view' : 'create')}
          className={`
            p-3 rounded-lg shadow-lg transition-all
            ${editMode === 'create' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }
          `}
          title="Create route"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setEditMode(editMode === 'edit' ? 'view' : 'edit')}
          disabled={!hasRoute}
          className={`
            p-3 rounded-lg shadow-lg transition-all
            ${editMode === 'edit'
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }
            ${!hasRoute ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title="Edit route"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        
        <div className="h-px bg-gray-300 my-1" />
        
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`
            p-3 bg-white rounded-lg shadow-lg transition-all
            ${canUndo 
              ? 'text-gray-700 hover:bg-gray-100' 
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
          title="Undo"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`
            p-3 bg-white rounded-lg shadow-lg transition-all
            ${canRedo 
              ? 'text-gray-700 hover:bg-gray-100' 
              : 'text-gray-300 cursor-not-allowed'
            }
          `}
          title="Redo"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </button>
        
        <div className="h-px bg-gray-300 my-1" />
        
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
      </div>
      
      {/* Mode indicator */}
      <div className="absolute bottom-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex flex-col gap-1">
          {editMode === 'view' ? (
            <div className="flex items-center gap-2">
              <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Drag points to move</span>
            </div>
          ) : editMode === 'create' ? (
            <>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Click to add points</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Drag points to move</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <PencilIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm">Click points to delete</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Drag points to move</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
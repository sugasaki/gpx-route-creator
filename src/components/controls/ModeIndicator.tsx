import { useUIStore } from '../../store/uiStore'
import { ArrowsPointingOutIcon, MapPinIcon, PencilIcon, XCircleIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline'

export default function ModeIndicator() {
  const { editMode } = useUIStore()
  
  return (
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
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xs">Press ESC to exit create mode</span>
            </div>
          </>
        ) : editMode === 'edit' ? (
          <>
            <div className="flex items-center gap-2">
              <PencilIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm">Click points to delete</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Drag points to move</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xs">Press ESC to exit edit mode</span>
            </div>
          </>
        ) : editMode === 'delete' ? (
          <>
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              <span className="text-sm">Click points to delete</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xs">Press ESC to exit delete mode</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ViewfinderCircleIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm">Drag to select points and delete</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xs">Press ESC to exit range delete mode</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
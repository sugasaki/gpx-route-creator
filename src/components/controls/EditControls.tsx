import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/uiStore'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function EditControls() {
  const { route } = useRouteStore()
  const { editMode, setEditMode } = useUIStore()
  const hasRoute = route.points.length > 0
  
  return (
    <>
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
    </>
  )
}
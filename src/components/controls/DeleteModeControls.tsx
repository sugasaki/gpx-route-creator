import { useEffect } from 'react'
import { useRouteStore } from '../../store/routeStore'
import { useUIStore } from '../../store/uiStore'
import { XCircleIcon } from '@heroicons/react/24/outline'

export default function DeleteModeControls() {
  const { route } = useRouteStore()
  const { editMode, setEditMode } = useUIStore()
  const hasRoute = route.points.length > 0
  
  // ESCキーで削除モードを解除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editMode === 'delete' && e.key === 'Escape') {
        setEditMode('view')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editMode, setEditMode])
  
  return (
    <button
      onClick={() => setEditMode(editMode === 'delete' ? 'view' : 'delete')}
      disabled={!hasRoute}
      className={`
        p-3 rounded-lg shadow-lg transition-all
        ${editMode === 'delete'
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-gray-700 hover:bg-gray-100'
        }
        ${!hasRoute ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title="Delete points"
    >
      <XCircleIcon className="w-5 h-5" />
    </button>
  )
}
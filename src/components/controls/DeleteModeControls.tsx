import { useEffect } from 'react'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { getControlButtonClasses } from '@/utils/styles'

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
      className={`${getControlButtonClasses(editMode === 'delete', 'red')} ${!hasRoute ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Delete points"
    >
      <XCircleIcon className="w-5 h-5" />
    </button>
  )
}
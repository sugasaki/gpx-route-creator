import { useEffect } from 'react'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { PlusIcon, PencilIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { getControlButtonClasses } from '@/utils/styles'

export default function EditControls() {
  const { route } = useRouteStore()
  const { editMode, setEditMode } = useUIStore()
  const hasRoute = route.points.length > 0
  
  // ESCキーで作成モード・編集モードを解除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((editMode === 'create' || editMode === 'edit' || editMode === 'waypoint') && e.key === 'Escape') {
        setEditMode('view')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editMode, setEditMode])
  
  return (
    <>
      <button
        onClick={() => {
          if (editMode === 'create') {
            setEditMode('view')
          } else {
            setEditMode('create')
          }
        }}
        className={getControlButtonClasses(editMode === 'create', 'blue')}
        title="Create route"
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={() => {
          if (editMode === 'edit') {
            setEditMode('view')
          } else {
            setEditMode('edit')
          }
        }}
        disabled={!hasRoute}
        className={`${getControlButtonClasses(editMode === 'edit', 'green')} ${!hasRoute ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Edit route"
      >
        <PencilIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={() => {
          if (editMode === 'waypoint') {
            setEditMode('view')
          } else {
            setEditMode('waypoint')
          }
        }}
        disabled={!hasRoute}
        className={`${getControlButtonClasses(editMode === 'waypoint', 'purple')} ${!hasRoute ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Add waypoints"
      >
        <MapPinIcon className="w-5 h-5" />
      </button>
    </>
  )
}
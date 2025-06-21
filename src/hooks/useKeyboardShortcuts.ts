import { useEffect } from 'react'
import { useRouteStore } from '../store/routeStore'
import { useUIStore } from '../store/uiStore'

export function useKeyboardShortcuts() {
  const { deletePoint, route } = useRouteStore()
  const { selectedPointId, editMode } = useUIStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key for point deletion
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPointId && editMode === 'edit') {
        // Find the selected point
        const selectedPoint = route.points.find(p => p.id === selectedPointId)
        if (!selectedPoint) return

        // Check if it's not the first or last point
        const index = route.points.indexOf(selectedPoint)
        const isFirst = index === 0
        const isLast = index === route.points.length - 1

        if (!isFirst && !isLast) {
          e.preventDefault()
          deletePoint(selectedPointId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPointId, editMode, route.points, deletePoint])
}
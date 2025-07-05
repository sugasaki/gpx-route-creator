import { useRouteStore } from '@/store/routeStore'
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { getIconButtonClasses } from '@/utils/styles'

export default function HistoryControls() {
  const { undo, redo, history, historyIndex } = useRouteStore()
  
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  
  return (
    <>
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`${getIconButtonClasses()} ${!canUndo ? 'text-gray-300 cursor-not-allowed' : ''}`}
        title="Undo"
      >
        <ArrowUturnLeftIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`${getIconButtonClasses()} ${!canRedo ? 'text-gray-300 cursor-not-allowed' : ''}`}
        title="Redo"
      >
        <ArrowUturnRightIcon className="w-5 h-5" />
      </button>
    </>
  )
}
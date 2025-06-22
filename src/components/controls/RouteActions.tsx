import { useState } from 'react'
import { useRouteStore } from '../../store/routeStore'
import { downloadGPX } from '../../utils/gpx'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import ConfirmationDialog from '../ConfirmationDialog'

export default function RouteActions() {
  const { route, clearRoute } = useRouteStore()
  const hasRoute = route.points.length > 0
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const handleExportGPX = () => {
    downloadGPX(route.points)
  }
  
  const handleClearRoute = () => {
    setShowConfirmDialog(true)
  }
  
  const confirmClearRoute = () => {
    clearRoute()
    setShowConfirmDialog(false)
  }
  
  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmClearRoute}
        title="ルートをクリアしますか？"
        message="この操作は取り消すことができません。現在のルートがすべて削除されます。"
        confirmText="クリア"
        cancelText="キャンセル"
        variant="danger"
      />
      <button
        onClick={handleClearRoute}
        disabled={!hasRoute}
        className={`
          p-3 bg-white rounded-lg shadow-lg transition-all
          ${hasRoute 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title="ルートをクリア"
      >
        <XMarkIcon className="w-5 h-5" />
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
        title="GPXファイルをエクスポート"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
      </button>
    </>
  )
}
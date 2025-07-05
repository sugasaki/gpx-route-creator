import { useRef, useState } from 'react'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { useRouteStore } from '@/store/routeStore'
import { 
  isValidGPXFile, 
  processGPXFile, 
  confirmRouteReplacement, 
  applyGPXData 
} from '@/utils/gpxImport'

export default function GPXImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { route, clearRoute, addPoint, addWaypoint } = useRouteStore()
  const store = useRouteStore()
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // GPXファイルかチェック
    if (!isValidGPXFile(file)) {
      setError('Please select a GPX file')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // GPXファイルを処理
      const { routePoints, waypoints } = await processGPXFile(file)
      
      if (routePoints.length === 0) {
        setError('No route points found in GPX file')
        return
      }
      
      // 既存のルートがある場合は確認
      if (!confirmRouteReplacement(route.points.length > 0)) {
        return
      }
      
      // GPXデータを適用
      applyGPXData(routePoints, waypoints, {
        clearRoute,
        addPoint,
        addWaypoint,
        getRoutePoints: () => store.route.points
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import GPX file')
    } finally {
      setIsLoading(false)
      // ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const handleClick = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select GPX file"
      />
      
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          p-3 bg-white rounded-lg shadow-lg transition-all
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'hover:bg-gray-100'
          }
        `}
        title="Import GPX file"
      >
        <DocumentArrowUpIcon className="w-5 h-5 text-gray-700" />
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  )
}
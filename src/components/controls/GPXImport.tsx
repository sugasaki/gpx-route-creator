import { useRef, useState } from 'react'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { useRouteStore } from '@/store/routeStore'
import { parseGPX, readFileAsText } from '@/utils/gpxParser'

export default function GPXImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { route, clearRoute, addPoint, addWaypoint } = useRouteStore()
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // GPXファイルかチェック
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError('Please select a GPX file')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // ファイルを読み込む
      const content = await readFileAsText(file)
      
      // GPXをパース
      const { routePoints, waypoints } = parseGPX(content)
      
      if (routePoints.length === 0) {
        setError('No route points found in GPX file')
        return
      }
      
      // 既存のルートがある場合は確認
      if (route.points.length > 0) {
        const confirmed = window.confirm(
          'This will replace the existing route. Do you want to continue?'
        )
        if (!confirmed) {
          return
        }
      }
      
      // ルートをクリア
      clearRoute()
      
      // ルートポイントを追加
      routePoints.forEach(point => {
        addPoint({
          lat: point.lat,
          lng: point.lng,
          elevation: point.elevation
        })
      })
      
      // ウェイポイントを追加
      waypoints.forEach(waypoint => {
        addWaypoint(waypoint)
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
          p-2 rounded-lg shadow-lg transition-all
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 active:scale-95'
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
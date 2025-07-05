import { useState, useCallback } from 'react'
import { useRouteStore } from '@/store/routeStore'
import { parseGPX, readFileAsText } from '@/utils/gpxParser'

interface DropZoneProps {
  children: React.ReactNode
}

export default function DropZone({ children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { route, clearRoute, addPoint, addWaypoint } = useRouteStore()
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // ドラッグされているアイテムがファイルかチェック
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // ドロップゾーンから完全に出た場合のみ
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)
    
    const files = Array.from(e.dataTransfer.files)
    const gpxFile = files.find(file => file.name.toLowerCase().endsWith('.gpx'))
    
    if (!gpxFile) {
      setError('Please drop a GPX file')
      setTimeout(() => setError(null), 3000)
      return
    }
    
    try {
      // ファイルを読み込む
      const content = await readFileAsText(gpxFile)
      
      // GPXをパース
      const { routePoints, waypoints } = parseGPX(content)
      
      if (routePoints.length === 0) {
        setError('No route points found in GPX file')
        setTimeout(() => setError(null), 3000)
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
      setTimeout(() => setError(null), 3000)
    }
  }, [route.points.length, clearRoute, addPoint, addWaypoint])
  
  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {/* ドラッグオーバーレイ */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 z-50 pointer-events-none flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 border-4 border-dashed border-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">Drop GPX file here</p>
          </div>
        </div>
      )}
      
      {/* エラー表示 */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect, useMemo } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useRouteStore } from '@/store/routeStore'
import { WaypointType } from '@/types'
import { calculateDistanceToWaypoint } from '@/utils/geo'

interface WaypointFormData {
  name: string
  description: string
  type: WaypointType
}

const waypointTypes: { value: WaypointType; label: string; icon: string }[] = [
  { value: 'pin', label: 'ピン', icon: '📍' },
  { value: 'food', label: '食事', icon: '🍴' },
  { value: 'rest', label: '休憩', icon: '🛏️' },
  { value: 'scenic', label: '景色', icon: '🏔️' },
  { value: 'danger', label: '注意', icon: '⚠️' },
  { value: 'info', label: '情報', icon: 'ℹ️' }
]

export default function WaypointDialog() {
  const waypointDialogOpen = useUIStore((state) => state.waypointDialogOpen)
  const setWaypointDialogOpen = useUIStore((state) => state.setWaypointDialogOpen)
  const pendingWaypoint = useUIStore((state) => state.pendingWaypoint)
  const setPendingWaypoint = useUIStore((state) => state.setPendingWaypoint)
  const selectedWaypointId = useUIStore((state) => state.selectedWaypointId)
  const setSelectedWaypoint = useUIStore((state) => state.setSelectedWaypoint)
  
  const waypoints = useRouteStore((state) => state.waypoints)
  const route = useRouteStore((state) => state.route)
  const addWaypoint = useRouteStore((state) => state.addWaypoint)
  const updateWaypoint = useRouteStore((state) => state.updateWaypoint)
  const deleteWaypoint = useRouteStore((state) => state.deleteWaypoint)
  
  const [formData, setFormData] = useState<WaypointFormData>({
    name: '',
    description: '',
    type: 'pin'
  })
  
  // 選択されたWaypointがある場合は編集モード
  const isEditMode = !!selectedWaypointId
  const selectedWaypoint = waypoints.find(w => w.id === selectedWaypointId)
  
  // 新規追加時の距離を計算
  const pendingWaypointDistance = useMemo(() => {
    if (!pendingWaypoint || pendingWaypoint.nearestPointIndex === undefined) return undefined
    
    const tempWaypoint = {
      id: 'temp',
      lat: pendingWaypoint.lat,
      lng: pendingWaypoint.lng,
      name: '',
      type: 'pin' as WaypointType,
      nearestPointIndex: pendingWaypoint.nearestPointIndex
    }
    
    return calculateDistanceToWaypoint(tempWaypoint, route.points)
  }, [pendingWaypoint, route.points])
  
  useEffect(() => {
    if (isEditMode && selectedWaypoint) {
      setFormData({
        name: selectedWaypoint.name,
        description: selectedWaypoint.description || '',
        type: selectedWaypoint.type
      })
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'pin'
      })
    }
  }, [isEditMode, selectedWaypoint])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('名前を入力してください')
      return
    }
    
    if (isEditMode && selectedWaypointId) {
      // 編集モード
      updateWaypoint(selectedWaypointId, {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type
      })
    } else if (pendingWaypoint) {
      // 新規作成モード
      addWaypoint({
        lat: pendingWaypoint.lat,
        lng: pendingWaypoint.lng,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        nearestPointIndex: pendingWaypoint.nearestPointIndex
      })
    }
    
    handleClose()
  }
  
  const handleDelete = () => {
    if (isEditMode && selectedWaypointId) {
      if (confirm('このWaypointを削除しますか？')) {
        deleteWaypoint(selectedWaypointId)
        handleClose()
      }
    }
  }
  
  const handleClose = () => {
    setWaypointDialogOpen(false)
    setPendingWaypoint(null)
    setSelectedWaypoint(null)
    setFormData({
      name: '',
      description: '',
      type: 'pin'
    })
  }
  
  if (!waypointDialogOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* ダイアログ */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {isEditMode ? 'Waypointを編集' : 'Waypointを追加'}
            </h2>
            {/* 距離表示 */}
            {(selectedWaypoint?.distanceFromStart !== undefined || pendingWaypointDistance !== undefined) && (
              <span className="text-sm text-blue-600 font-medium">
                始点から: {selectedWaypoint?.distanceFromStart !== undefined 
                  ? `${selectedWaypoint.distanceFromStart.toFixed(2)}km`
                  : pendingWaypointDistance !== undefined
                  ? `${pendingWaypointDistance.toFixed(2)}km`
                  : '計算中...'}
              </span>
            )}
          </div>
          
          {/* 名前入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 展望台"
              autoFocus
            />
          </div>
          
          {/* 説明入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 富士山が見える絶景スポット"
              rows={3}
            />
          </div>
          
          {/* タイプ選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイプ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {waypointTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="flex gap-2">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                削除
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditMode ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
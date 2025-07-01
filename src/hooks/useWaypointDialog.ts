import { useState, useEffect, useMemo } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useRouteStore } from '@/store/routeStore'
import { WaypointType } from '@/types'
import { calculateDistanceToWaypoint } from '@/utils/geo'

interface WaypointFormData {
  name: string
  description: string
  type: WaypointType
}

const initialFormData: WaypointFormData = {
  name: '',
  description: '',
  type: 'pin'
}

export function useWaypointDialog() {
  // UI Store
  const waypointDialogOpen = useUIStore((state) => state.waypointDialogOpen)
  const setWaypointDialogOpen = useUIStore((state) => state.setWaypointDialogOpen)
  const pendingWaypoint = useUIStore((state) => state.pendingWaypoint)
  const setPendingWaypoint = useUIStore((state) => state.setPendingWaypoint)
  const selectedWaypointId = useUIStore((state) => state.selectedWaypointId)
  const setSelectedWaypoint = useUIStore((state) => state.setSelectedWaypoint)
  
  // Route Store
  const waypoints = useRouteStore((state) => state.waypoints)
  const route = useRouteStore((state) => state.route)
  const addWaypoint = useRouteStore((state) => state.addWaypoint)
  const updateWaypoint = useRouteStore((state) => state.updateWaypoint)
  const deleteWaypoint = useRouteStore((state) => state.deleteWaypoint)
  
  // Form state
  const [formData, setFormData] = useState<WaypointFormData>(initialFormData)
  
  // 編集モードの判定
  const isEditMode = !!selectedWaypointId
  const selectedWaypoint = waypoints.find(w => w.id === selectedWaypointId)
  
  // 距離計算
  const currentDistance = useMemo(() => {
    // 編集モードの場合
    if (selectedWaypoint?.distanceFromStart !== undefined) {
      return selectedWaypoint.distanceFromStart
    }
    
    // 新規作成モードの場合
    if (pendingWaypoint && pendingWaypoint.nearestPointIndex !== undefined) {
      const tempWaypoint = {
        id: 'temp',
        lat: pendingWaypoint.lat,
        lng: pendingWaypoint.lng,
        name: '',
        type: 'pin' as WaypointType,
        nearestPointIndex: pendingWaypoint.nearestPointIndex
      }
      return calculateDistanceToWaypoint(tempWaypoint, route.points)
    }
    
    return undefined
  }, [pendingWaypoint, selectedWaypoint, route.points])
  
  // フォームデータの初期化
  useEffect(() => {
    if (isEditMode && selectedWaypoint) {
      setFormData({
        name: selectedWaypoint.name,
        description: selectedWaypoint.description || '',
        type: selectedWaypoint.type
      })
    } else {
      setFormData(initialFormData)
    }
  }, [isEditMode, selectedWaypoint])
  
  // ダイアログを閉じる
  const handleClose = () => {
    setWaypointDialogOpen(false)
    setPendingWaypoint(null)
    setSelectedWaypoint(null)
    setFormData(initialFormData)
  }
  
  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('名前を入力してください')
      return
    }
    
    if (isEditMode && selectedWaypointId) {
      updateWaypoint(selectedWaypointId, {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type
      })
    } else if (pendingWaypoint) {
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
  
  // 削除処理
  const handleDelete = () => {
    if (isEditMode && selectedWaypointId && confirm('このWaypointを削除しますか？')) {
      deleteWaypoint(selectedWaypointId)
      handleClose()
    }
  }
  
  return {
    // State
    waypointDialogOpen,
    isEditMode,
    formData,
    currentDistance,
    
    // Handlers
    setFormData,
    handleSubmit,
    handleDelete,
    handleClose
  }
}
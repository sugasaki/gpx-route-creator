import { useState, useCallback } from 'react'
import { useRouteStore } from '@/store/routeStore'
import { useUIStore } from '@/store/uiStore'
import { Waypoint } from '@/types'
import { findClosestPointOnRoute } from '@/utils/geo'

interface UseWaypointDragProps {
  waypoint: Waypoint
}

export function useWaypointDrag({ waypoint }: UseWaypointDragProps) {
  const { route, updateWaypoint } = useRouteStore()
  const { editMode, selectedWaypointId, setSelectedWaypoint, setWaypointDialogOpen } = useUIStore()
  const [isDragging, setIsDragging] = useState(false)
  
  const isSelected = selectedWaypointId === waypoint.id
  const canDrag = editMode === 'waypoint' || editMode === 'edit'
  
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    setSelectedWaypoint(waypoint.id)
  }, [waypoint.id, setSelectedWaypoint])
  
  const handleDrag = useCallback((e: any) => {
    const { lngLat } = e
    
    // ルートが存在しない場合は、自由に移動
    if (route.points.length < 2) {
      updateWaypoint(waypoint.id, {
        lat: lngLat.lat,
        lng: lngLat.lng,
        nearestPointIndex: undefined
      })
      return
    }
    
    // ルート上の最も近い点を計算
    const closestPoint = findClosestPointOnRoute(
      lngLat.lat,
      lngLat.lng,
      route.points
    )
    
    // Waypointを更新（ルート上に制約）
    updateWaypoint(waypoint.id, {
      lat: closestPoint.lat,
      lng: closestPoint.lng,
      nearestPointIndex: closestPoint.nearestPointIndex
    })
  }, [waypoint.id, updateWaypoint, route.points])
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  const handleClick = useCallback((e: any) => {
    e.originalEvent.stopPropagation()
    
    if (editMode === 'waypoint' || editMode === 'edit') {
      setSelectedWaypoint(waypoint.id)
      setWaypointDialogOpen(true)
    }
  }, [editMode, waypoint.id, setSelectedWaypoint, setWaypointDialogOpen])
  
  return {
    isDragging,
    isSelected,
    canDrag,
    handlers: {
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      onClick: handleClick
    }
  }
}
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EditMode } from '@/types'
import { MapStyleId, MAP_CONSTANTS } from '@/constants/map'

interface UIState {
  editMode: EditMode
  selectedPointId: string | null
  hoveredPointId: string | null
  selectedWaypointId: string | null
  hoveredWaypointId: string | null
  waypointDialogOpen: boolean
  pendingWaypoint: { lat: number; lng: number; nearestPointIndex?: number } | null
  selectionBox: { start: { x: number; y: number }; end: { x: number; y: number } } | null
  mapStyle: MapStyleId
  setEditMode: (mode: EditMode) => void
  setSelectedPoint: (id: string | null) => void
  setHoveredPoint: (id: string | null) => void
  setSelectedWaypoint: (id: string | null) => void
  setHoveredWaypoint: (id: string | null) => void
  setWaypointDialogOpen: (open: boolean) => void
  setPendingWaypoint: (waypoint: { lat: number; lng: number; nearestPointIndex?: number } | null) => void
  setSelectionBox: (box: { start: { x: number; y: number }; end: { x: number; y: number } } | null) => void
  setMapStyle: (style: MapStyleId) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      editMode: 'view',
      selectedPointId: null,
      hoveredPointId: null,
      selectedWaypointId: null,
      hoveredWaypointId: null,
      waypointDialogOpen: false,
      pendingWaypoint: null,
      selectionBox: null,
      mapStyle: MAP_CONSTANTS.DEFAULT_STYLE,
      
      setEditMode: (mode) => set({ 
        editMode: mode,
        // モード変更時に選択ボックスをクリア
        selectionBox: null,
        // ウェイポイント関連の状態もクリア
        selectedWaypointId: null,
        pendingWaypoint: null,
        waypointDialogOpen: false
      }),
      setSelectedPoint: (id) => set({ selectedPointId: id }),
      setHoveredPoint: (id) => set({ hoveredPointId: id }),
      setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),
      setHoveredWaypoint: (id) => set({ hoveredWaypointId: id }),
      setWaypointDialogOpen: (open) => set({ waypointDialogOpen: open }),
      setPendingWaypoint: (waypoint) => set({ pendingWaypoint: waypoint }),
      setSelectionBox: (box) => set({ selectionBox: box }),
      setMapStyle: (style) => set({ mapStyle: style })
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ mapStyle: state.mapStyle }) // Only persist mapStyle
    }
  )
)
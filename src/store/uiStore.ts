import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EditMode } from '../types'
import { MapStyleId, MAP_CONSTANTS } from '../constants/map'

interface UIState {
  editMode: EditMode
  selectedPointId: string | null
  hoveredPointId: string | null
  selectionBox: { start: { x: number; y: number }; end: { x: number; y: number } } | null
  mapStyle: MapStyleId
  setEditMode: (mode: EditMode) => void
  setSelectedPoint: (id: string | null) => void
  setHoveredPoint: (id: string | null) => void
  setSelectionBox: (box: { start: { x: number; y: number }; end: { x: number; y: number } } | null) => void
  setMapStyle: (style: MapStyleId) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      editMode: 'view',
      selectedPointId: null,
      hoveredPointId: null,
      selectionBox: null,
      mapStyle: MAP_CONSTANTS.DEFAULT_STYLE,
      
      setEditMode: (mode) => set({ 
        editMode: mode,
        // モード変更時に選択ボックスをクリア
        selectionBox: null
      }),
      setSelectedPoint: (id) => set({ selectedPointId: id }),
      setHoveredPoint: (id) => set({ hoveredPointId: id }),
      setSelectionBox: (box) => set({ selectionBox: box }),
      setMapStyle: (style) => set({ mapStyle: style })
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ mapStyle: state.mapStyle }) // Only persist mapStyle
    }
  )
)
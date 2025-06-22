import { create } from 'zustand'
import { EditMode } from '../types'

interface UIState {
  editMode: EditMode
  selectedPointId: string | null
  hoveredPointId: string | null
  selectionBox: { start: { x: number; y: number }; end: { x: number; y: number } } | null
  setEditMode: (mode: EditMode) => void
  setSelectedPoint: (id: string | null) => void
  setHoveredPoint: (id: string | null) => void
  setSelectionBox: (box: { start: { x: number; y: number }; end: { x: number; y: number } } | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  editMode: 'view',
  selectedPointId: null,
  hoveredPointId: null,
  selectionBox: null,
  
  setEditMode: (mode) => set({ 
    editMode: mode,
    // モード変更時に選択ボックスをクリア
    selectionBox: null
  }),
  setSelectedPoint: (id) => set({ selectedPointId: id }),
  setHoveredPoint: (id) => set({ hoveredPointId: id }),
  setSelectionBox: (box) => set({ selectionBox: box })
}))
import { create } from 'zustand'
import { EditMode } from '../types'

interface UIState {
  editMode: EditMode
  selectedPointId: string | null
  hoveredPointId: string | null
  setEditMode: (mode: EditMode) => void
  setSelectedPoint: (id: string | null) => void
  setHoveredPoint: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  editMode: 'view',
  selectedPointId: null,
  hoveredPointId: null,
  
  setEditMode: (mode) => set({ editMode: mode }),
  setSelectedPoint: (id) => set({ selectedPointId: id }),
  setHoveredPoint: (id) => set({ hoveredPointId: id })
}))
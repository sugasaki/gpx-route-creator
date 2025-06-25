import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DistanceMarkerState {
  isDistanceMarkersVisible: boolean
  markerInterval: number // キロメートル単位
  setDistanceMarkersVisible: (visible: boolean) => void
  setMarkerInterval: (interval: number) => void
  toggleDistanceMarkers: () => void
}

export const useDistanceMarkerStore = create<DistanceMarkerState>()(
  persist(
    (set) => ({
      isDistanceMarkersVisible: false,
      markerInterval: 1, // デフォルトは1km間隔
      
      setDistanceMarkersVisible: (visible) => set({ isDistanceMarkersVisible: visible }),
      setMarkerInterval: (interval) => set({ markerInterval: interval }),
      toggleDistanceMarkers: () => set((state) => ({ 
        isDistanceMarkersVisible: !state.isDistanceMarkersVisible 
      }))
    }),
    {
      name: 'distance-marker-store',
      partialize: (state) => ({
        isDistanceMarkersVisible: state.isDistanceMarkersVisible,
        markerInterval: state.markerInterval
      })
    }
  )
)
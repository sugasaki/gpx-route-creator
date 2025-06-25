import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MarkerIntervalOption = 'auto' | 'off' | 1 | 5 | 10 | 20 | 50

interface DistanceMarkerState {
  markerInterval: MarkerIntervalOption
  setMarkerInterval: (interval: MarkerIntervalOption) => void
}

export const useDistanceMarkerStore = create<DistanceMarkerState>()(
  persist(
    (set) => ({
      markerInterval: 'auto', // デフォルトで自動
      
      setMarkerInterval: (interval) => set({ markerInterval: interval })
    }),
    {
      name: 'distance-marker-store',
      partialize: (state) => ({
        markerInterval: state.markerInterval
      })
    }
  )
)
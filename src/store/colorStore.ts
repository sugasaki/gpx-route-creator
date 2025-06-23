import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAP_CONSTANTS } from '@/constants/map'

interface ColorState {
  routeLineColor: string
  setRouteLineColor: (color: string) => void
}

export const useColorStore = create<ColorState>()(
  persist(
    (set) => ({
      routeLineColor: MAP_CONSTANTS.COLORS.LINE,
      setRouteLineColor: (color) => set({ routeLineColor: color })
    }),
    {
      name: 'color-store'
    }
  )
)
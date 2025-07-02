import { create } from 'zustand'
import { RoutePoint, Route, Waypoint } from '@/types'
import { RouteHistoryManager, type HistoryState } from '@/domain/RouteHistoryManager'
import { createWaypoint } from '@/domain/waypoint-factory'
import { generateId } from '@/domain/id-generator'
import { RouteCalculator } from '@/domain/route-calculator'
import { WaypointCalculator } from '@/domain/waypoint-calculator'

interface RouteState {
  route: Route
  waypoints: Waypoint[]
  history: HistoryState[]
  historyIndex: number
  addPoint: (point: Omit<RoutePoint, 'id'>) => void
  insertPoint: (index: number, point: Omit<RoutePoint, 'id'>) => void
  updatePoint: (id: string, point: Partial<RoutePoint>) => void
  deletePoint: (id: string) => void
  deleteMultiplePoints: (ids: string[]) => void
  movePoint: (id: string, lat: number, lng: number) => void
  movePointWithoutHistory: (id: string, lat: number, lng: number) => void
  addWaypoint: (waypoint: Omit<Waypoint, 'id'>) => void
  updateWaypoint: (id: string, waypoint: Partial<Waypoint>) => void
  deleteWaypoint: (id: string) => void
  moveWaypointOnRoute: (id: string, nearestPointIndex: number) => void
  saveCurrentStateToHistory: () => void
  undo: () => void
  redo: () => void
  clearRoute: () => void
  calculateDistance: () => void
  recalculateWaypointDistances: () => void
}


export const useRouteStore = create<RouteState>((set, get) => {
  // ヘルパー関数：履歴を更新し、新しい状態を設定
  const updateHistoryAndState = (
    newRoute: Route | null,
    newWaypoints: Waypoint[] | null
  ) => {
    const currentRoute = newRoute || get().route
    const currentWaypoints = newWaypoints || get().waypoints
    
    const historyResult = RouteHistoryManager.addToHistory(
      get().history,
      get().historyIndex,
      RouteHistoryManager.createSnapshot(currentRoute, currentWaypoints)
    )
    
    const updates: Partial<RouteState> = {
      history: historyResult.history,
      historyIndex: historyResult.newIndex
    }
    
    if (newRoute) updates.route = newRoute
    if (newWaypoints) updates.waypoints = newWaypoints
    
    set(updates)
  }

  return {
  route: { points: [], distance: 0 },
  waypoints: [],
  history: [{ route: { points: [], distance: 0 }, waypoints: [] }],
  historyIndex: 0,
  
  addPoint: (point) => {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points, newPoint]
    const newRoute = RouteCalculator.createRoute(newPoints)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  insertPoint: (index, point) => {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points]
    newPoints.splice(index, 0, newPoint)
    const newRoute = RouteCalculator.createRoute(newPoints)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  updatePoint: (id, updates) => {
    const newPoints = get().route.points.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    const newRoute = RouteCalculator.createRoute(newPoints)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  deletePoint: (id) => {
    const newPoints = get().route.points.filter(p => p.id !== id)
    const newRoute = RouteCalculator.createRoute(newPoints)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  deleteMultiplePoints: (ids) => {
    const newPoints = get().route.points.filter(p => !ids.includes(p.id))
    const newRoute = RouteCalculator.createRoute(newPoints)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  movePoint: (id, lat, lng) => {
    get().updatePoint(id, { lat, lng })
  },
  
  movePointWithoutHistory: (id, lat, lng) => {
    const newPoints = get().route.points.map(p => 
      p.id === id ? { ...p, lat, lng } : p
    )
    const newRoute = RouteCalculator.createRoute(newPoints)
    
    set({ route: newRoute })
    get().recalculateWaypointDistances()
  },
  
  saveCurrentStateToHistory: () => {
    updateHistoryAndState(null, null)
  },
  
  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      set({
        route: previousState.route,
        waypoints: previousState.waypoints,
        historyIndex: historyIndex - 1
      })
      get().recalculateWaypointDistances()
    }
  },
  
  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      set({
        route: nextState.route,
        waypoints: nextState.waypoints,
        historyIndex: historyIndex + 1
      })
      get().recalculateWaypointDistances()
    }
  },
  
  clearRoute: () => {
    const emptyRoute = { points: [], distance: 0 }
    const emptyState = { route: emptyRoute, waypoints: [] }
    set({
      route: emptyRoute,
      waypoints: [],
      history: [emptyState],
      historyIndex: 0
    })
  },
  
  calculateDistance: () => {
    const updatedRoute = RouteCalculator.updateRouteDistance(get().route)
    set({ route: updatedRoute })
  },
  
  addWaypoint: (waypoint) => {
    const newWaypoint = createWaypoint(waypoint, get().route.points)
    const newWaypoints = [...get().waypoints, newWaypoint]
    
    updateHistoryAndState(null, newWaypoints)
  },
  
  updateWaypoint: (id, updates) => {
    const updatedWaypoints = get().waypoints.map(w => {
      if (w.id === id) {
        const updatedWaypoint = { ...w, ...updates }
        // nearestPointIndexが更新された場合、距離を再計算
        if (updates.nearestPointIndex !== undefined || updates.lat !== undefined || updates.lng !== undefined) {
          updatedWaypoint.distanceFromStart = WaypointCalculator.calculateDistanceToWaypoint(
            updatedWaypoint,
            get().route.points
          )
        }
        return updatedWaypoint
      }
      return w
    })
    
    updateHistoryAndState(null, updatedWaypoints)
  },
  
  deleteWaypoint: (id) => {
    const newWaypoints = get().waypoints.filter(w => w.id !== id)
    
    updateHistoryAndState(null, newWaypoints)
  },
  
  moveWaypointOnRoute: (id, nearestPointIndex) => {
    const updatedWaypoints = get().waypoints.map(w => {
      if (w.id === id) {
        const updatedWaypoint = { ...w, nearestPointIndex }
        return WaypointCalculator.updateWaypointDistance(
          updatedWaypoint,
          get().route.points
        )
      }
      return w
    })
    
    updateHistoryAndState(null, updatedWaypoints)
  },
  
  recalculateWaypointDistances: () => {
    set(state => ({
      waypoints: WaypointCalculator.updateAllWaypointDistances(state.waypoints, state.route.points)
    }))
  }
  }
})
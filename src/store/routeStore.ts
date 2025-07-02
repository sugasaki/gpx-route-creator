import { create } from 'zustand'
import { RoutePoint, Route, Waypoint } from '@/types'
import { RouteHistoryManager, type HistoryState } from '@/domain/RouteHistoryManager'
import { RouteManager } from '@/domain/RouteManager'
import { WaypointManager } from '@/domain/WaypointManager'
import { WaypointCalculator } from '@/domain/waypoint-calculator'
import { RouteCalculator } from '@/domain/route-calculator'

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
    const newRoute = RouteManager.addPoint(get().route, point)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  insertPoint: (index, point) => {
    const newRoute = RouteManager.insertPoint(get().route, index, point)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  updatePoint: (id, updates) => {
    const newRoute = RouteManager.updatePoint(get().route, id, updates)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  deletePoint: (id) => {
    const newRoute = RouteManager.deletePoint(get().route, id)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  deleteMultiplePoints: (ids) => {
    const newRoute = RouteManager.deleteMultiplePoints(get().route, ids)
    
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  },
  
  movePoint: (id, lat, lng) => {
    get().updatePoint(id, { lat, lng })
  },
  
  movePointWithoutHistory: (id, lat, lng) => {
    const newRoute = RouteManager.movePoint(get().route, id, lat, lng)
    
    set({ route: newRoute })
    get().recalculateWaypointDistances()
  },
  
  saveCurrentStateToHistory: () => {
    updateHistoryAndState(null, null)
  },
  
  undo: () => {
    const result = RouteHistoryManager.undo(get().history, get().historyIndex)
    if (result) {
      set({
        route: result.state.route,
        waypoints: result.state.waypoints,
        historyIndex: result.newIndex
      })
      get().recalculateWaypointDistances()
    }
  },
  
  redo: () => {
    const result = RouteHistoryManager.redo(get().history, get().historyIndex)
    if (result) {
      set({
        route: result.state.route,
        waypoints: result.state.waypoints,
        historyIndex: result.newIndex
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
    const newWaypoints = WaypointManager.addWaypoint(
      get().waypoints,
      waypoint,
      get().route.points
    )
    
    updateHistoryAndState(null, newWaypoints)
  },
  
  updateWaypoint: (id, updates) => {
    const updatedWaypoints = WaypointManager.updateWaypoint(
      get().waypoints,
      id,
      updates,
      get().route.points
    )
    
    updateHistoryAndState(null, updatedWaypoints)
  },
  
  deleteWaypoint: (id) => {
    const newWaypoints = WaypointManager.deleteWaypoint(get().waypoints, id)
    
    updateHistoryAndState(null, newWaypoints)
  },
  
  moveWaypointOnRoute: (id, nearestPointIndex) => {
    const updatedWaypoints = WaypointManager.moveWaypointOnRoute(
      get().waypoints,
      id,
      nearestPointIndex,
      get().route.points
    )
    
    updateHistoryAndState(null, updatedWaypoints)
  },
  
  recalculateWaypointDistances: () => {
    set(state => ({
      waypoints: WaypointCalculator.updateAllWaypointDistances(state.waypoints, state.route.points)
    }))
  }
  }
})
import { create } from 'zustand'
import { RoutePoint, Route, Waypoint } from '@/types'
import { RouteHistoryManager, type HistoryState } from '@/domain/RouteHistoryManager'
import { RouteManager } from '@/domain/RouteManager'
import { WaypointManager } from '@/domain/WaypointManager'
import { WaypointCalculator } from '@/domain/waypoint-calculator'
import { RouteCalculator } from '@/domain/route-calculator'
import { StateManager } from '@/domain/StateManager'

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
  
  // ルート操作の共通パターン
  const updateRouteWithHistory = (routeUpdater: (route: Route) => Route) => {
    const newRoute = routeUpdater(get().route)
    updateHistoryAndState(newRoute, null)
    get().recalculateWaypointDistances()
  }
  
  // Waypoint操作の共通パターン
  const updateWaypointsWithHistory = (
    waypointUpdater: (waypoints: Waypoint[], routePoints: RoutePoint[]) => Waypoint[]
  ) => {
    const newWaypoints = waypointUpdater(get().waypoints, get().route.points)
    updateHistoryAndState(null, newWaypoints)
  }

  return {
  ...StateManager.getInitialState(),
  
  addPoint: (point) => {
    updateRouteWithHistory(route => RouteManager.addPoint(route, point))
  },
  
  insertPoint: (index, point) => {
    updateRouteWithHistory(route => RouteManager.insertPoint(route, index, point))
  },
  
  updatePoint: (id, updates) => {
    updateRouteWithHistory(route => RouteManager.updatePoint(route, id, updates))
  },
  
  deletePoint: (id) => {
    updateRouteWithHistory(route => RouteManager.deletePoint(route, id))
  },
  
  deleteMultiplePoints: (ids) => {
    updateRouteWithHistory(route => RouteManager.deleteMultiplePoints(route, ids))
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
      set(StateManager.applyHistoryState(result.state, result.newIndex))
      get().recalculateWaypointDistances()
    }
  },
  
  redo: () => {
    const result = RouteHistoryManager.redo(get().history, get().historyIndex)
    if (result) {
      set(StateManager.applyHistoryState(result.state, result.newIndex))
      get().recalculateWaypointDistances()
    }
  },
  
  clearRoute: () => {
    set(StateManager.createClearRouteUpdate())
  },
  
  calculateDistance: () => {
    const updatedRoute = RouteCalculator.updateRouteDistance(get().route)
    set({ route: updatedRoute })
  },
  
  addWaypoint: (waypoint) => {
    updateWaypointsWithHistory((waypoints, routePoints) => 
      WaypointManager.addWaypoint(waypoints, waypoint, routePoints)
    )
  },
  
  updateWaypoint: (id, updates) => {
    updateWaypointsWithHistory((waypoints, routePoints) =>
      WaypointManager.updateWaypoint(waypoints, id, updates, routePoints)
    )
  },
  
  deleteWaypoint: (id) => {
    updateWaypointsWithHistory((waypoints) =>
      WaypointManager.deleteWaypoint(waypoints, id)
    )
  },
  
  moveWaypointOnRoute: (id, nearestPointIndex) => {
    updateWaypointsWithHistory((waypoints, routePoints) =>
      WaypointManager.moveWaypointOnRoute(waypoints, id, nearestPointIndex, routePoints)
    )
  },
  
  recalculateWaypointDistances: () => {
    set(state => ({
      waypoints: WaypointCalculator.updateAllWaypointDistances(state.waypoints, state.route.points)
    }))
  }
  }
})
import { create } from 'zustand'
import { RoutePoint, Route, Waypoint } from '@/types'
import { RouteHistoryManager, type HistoryState } from '@/domain/RouteHistoryManager'
import { RouteManager } from '@/domain/RouteManager'
import { WaypointManager } from '@/domain/WaypointManager'
import { WaypointCalculator } from '@/domain/waypoint-calculator'
import { RouteCalculator } from '@/domain/route-calculator'
import { StateManager } from '@/domain/StateManager'
import { HistoryManager } from '@/domain/HistoryManager'

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
  // ルート操作の共通パターン
  const updateRouteWithHistory = (routeUpdater: (route: Route) => Route) => {
    const newRoute = routeUpdater(get().route)
    set(HistoryManager.updateWithHistory(get(), newRoute, null))
    get().recalculateWaypointDistances()
  }
  
  // Waypoint操作の共通パターン
  const updateWaypointsWithHistory = (
    waypointUpdater: (waypoints: Waypoint[], routePoints: RoutePoint[]) => Waypoint[]
  ) => {
    const newWaypoints = waypointUpdater(get().waypoints, get().route.points)
    set(HistoryManager.updateWithHistory(get(), null, newWaypoints))
  }
  
  // 履歴なしでルートを更新
  const updateRouteWithoutHistory = (routeUpdater: (route: Route) => Route) => {
    set({ route: routeUpdater(get().route) })
    get().recalculateWaypointDistances()
  }
  
  // 履歴操作の共通パターン
  const applyHistoryOperation = (
    operation: (history: HistoryState[], index: number) => { state: HistoryState, newIndex: number } | null
  ) => {
    const result = operation(get().history, get().historyIndex)
    if (result) {
      set(StateManager.applyHistoryState(result.state, result.newIndex))
      get().recalculateWaypointDistances()
    }
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
    updateRouteWithoutHistory(route => RouteManager.movePoint(route, id, lat, lng))
  },
  
  saveCurrentStateToHistory: () => {
    set(HistoryManager.updateWithHistory(get(), null, null))
  },
  
  undo: () => {
    applyHistoryOperation((history, index) => RouteHistoryManager.undo(history, index))
  },
  
  redo: () => {
    applyHistoryOperation((history, index) => RouteHistoryManager.redo(history, index))
  },
  
  clearRoute: () => {
    set(StateManager.createClearRouteUpdate())
  },
  
  calculateDistance: () => {
    set({ route: RouteCalculator.updateRouteDistance(get().route) })
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
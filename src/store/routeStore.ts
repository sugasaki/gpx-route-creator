import { create } from 'zustand'
import { RoutePoint, Route, Waypoint } from '@/types'
import { calculateDistance, calculateDistanceToWaypoint, calculateAllWaypointDistances } from '@/utils/geo'

interface HistoryState {
  route: Route
  waypoints: Waypoint[]
}

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

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useRouteStore = create<RouteState>((set, get) => ({
  route: { points: [], distance: 0 },
  waypoints: [],
  history: [{ route: { points: [], distance: 0 }, waypoints: [] }],
  historyIndex: 0,
  
  addPoint: (point) => {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points, newPoint]
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: newRoute, waypoints: get().waypoints })
    
    set({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
    get().recalculateWaypointDistances()
  },
  
  insertPoint: (index, point) => {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points]
    newPoints.splice(index, 0, newPoint)
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: newRoute, waypoints: get().waypoints })
    
    set({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
    get().recalculateWaypointDistances()
  },
  
  updatePoint: (id, updates) => {
    const newPoints = get().route.points.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: newRoute, waypoints: get().waypoints })
    
    set({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
    get().recalculateWaypointDistances()
  },
  
  deletePoint: (id) => {
    const newPoints = get().route.points.filter(p => p.id !== id)
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: newRoute, waypoints: get().waypoints })
    
    set({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
    get().recalculateWaypointDistances()
  },
  
  deleteMultiplePoints: (ids) => {
    const newPoints = get().route.points.filter(p => !ids.includes(p.id))
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: newRoute, waypoints: get().waypoints })
    
    set({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
    get().recalculateWaypointDistances()
  },
  
  movePoint: (id, lat, lng) => {
    get().updatePoint(id, { lat, lng })
  },
  
  movePointWithoutHistory: (id, lat, lng) => {
    const newPoints = get().route.points.map(p => 
      p.id === id ? { ...p, lat, lng } : p
    )
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    set({ route: newRoute })
    get().recalculateWaypointDistances()
  },
  
  saveCurrentStateToHistory: () => {
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: get().route, waypoints: get().waypoints })
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
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
    const distance = calculateDistance(get().route.points)
    set(state => ({
      route: { ...state.route, distance }
    }))
  },
  
  addWaypoint: (waypoint) => {
    const newWaypoint: Waypoint = { 
      ...waypoint, 
      id: generateId(),
      distanceFromStart: calculateDistanceToWaypoint(
        waypoint as Waypoint,
        get().route.points
      )
    }
    const newWaypoints = [...get().waypoints, newWaypoint]
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: get().route, waypoints: newWaypoints })
    
    set({
      waypoints: newWaypoints,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  updateWaypoint: (id, updates) => {
    const updatedWaypoints = get().waypoints.map(w => {
      if (w.id === id) {
        const updatedWaypoint = { ...w, ...updates }
        // nearestPointIndexが更新された場合、距離を再計算
        if (updates.nearestPointIndex !== undefined || updates.lat !== undefined || updates.lng !== undefined) {
          updatedWaypoint.distanceFromStart = calculateDistanceToWaypoint(
            updatedWaypoint,
            get().route.points
          )
        }
        return updatedWaypoint
      }
      return w
    })
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: get().route, waypoints: updatedWaypoints })
    
    set({
      waypoints: updatedWaypoints,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  deleteWaypoint: (id) => {
    const newWaypoints = get().waypoints.filter(w => w.id !== id)
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: get().route, waypoints: newWaypoints })
    
    set({
      waypoints: newWaypoints,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  moveWaypointOnRoute: (id, nearestPointIndex) => {
    const updatedWaypoints = get().waypoints.map(w => {
      if (w.id === id) {
        const updatedWaypoint = { ...w, nearestPointIndex }
        return {
          ...updatedWaypoint,
          distanceFromStart: calculateDistanceToWaypoint(
            updatedWaypoint,
            get().route.points
          )
        }
      }
      return w
    })
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push({ route: get().route, waypoints: updatedWaypoints })
    
    set({
      waypoints: updatedWaypoints,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  recalculateWaypointDistances: () => {
    set(state => ({
      waypoints: calculateAllWaypointDistances(state.waypoints, state.route.points)
    }))
  }
}))
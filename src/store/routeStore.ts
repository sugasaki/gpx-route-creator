import { create } from 'zustand'
import { RoutePoint, Route, Waypoint } from '@/types'
import { calculateDistance, getDistanceToWaypoint } from '@/utils/geo'

interface RouteState {
  route: Route
  waypoints: Waypoint[]
  history: Route[]
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
  updateWaypointsDistances: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useRouteStore = create<RouteState>((set, get) => {
  const _setRouteState = (state: Partial<RouteState>) => {
    set(state);
    // ルートが更新された後にウェイポイントの距離を再計算
    get().updateWaypointsDistances();
  };

  return {
  route: { points: [], distance: 0 },
  waypoints: [],
  history: [{ points: [], distance: 0 }],
  historyIndex: 0,
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points, newPoint]
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(newRoute)
    
    _setRouteState({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  insertPoint: (index, point) => {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points]
    newPoints.splice(index, 0, newPoint)
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(newRoute)
    
    _setRouteState({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  updatePoint: (id, updates) => {
    const newPoints = get().route.points.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(newRoute)
    
    _setRouteState({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  deletePoint: (id) => {
    const newPoints = get().route.points.filter(p => p.id !== id)
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(newRoute)
    
    _setRouteState({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  deleteMultiplePoints: (ids) => {
    const newPoints = get().route.points.filter(p => !ids.includes(p.id))
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(newRoute)
    
    _setRouteState({
      route: newRoute,
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  movePoint: (id, lat, lng) => {
    get().updatePoint(id, { lat, lng })
  },
  
  movePointWithoutHistory: (id, lat, lng) => {
    const newPoints = get().route.points.map(p => 
      p.id === id ? { ...p, lat, lng } : p
    )
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    _setRouteState({ route: newRoute })
  },
  
  saveCurrentStateToHistory: () => {
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(get().route)
    
    _setRouteState({
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex > 0) {
      _setRouteState({
        route: history[historyIndex - 1],
        historyIndex: historyIndex - 1
      })
    }
  },
  
  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex < history.length - 1) {
      _setRouteState({
        route: history[historyIndex + 1],
        historyIndex: historyIndex + 1
      })
    }
  },
  
  clearRoute: () => {
    const emptyRoute = { points: [], distance: 0 }
    _setRouteState({
      route: emptyRoute,
      waypoints: [],
      history: [emptyRoute],
      historyIndex: 0
    })
  },
  
  calculateDistance: () => {
    const distance = calculateDistance(get().route.points)
    _setRouteState(state => ({
      route: { ...state.route, distance }
    }))
  },
  
  addWaypoint: (waypoint) => {
    const newWaypoint: Waypoint = { ...waypoint, id: generateId() }
    set(state => ({
      waypoints: [...state.waypoints, newWaypoint]
    }))
  },
  
  updateWaypoint: (id, updates) => {
    set(state => ({
      waypoints: state.waypoints.map(w => 
        w.id === id ? { ...w, ...updates } : w
      )
    }))
    // ウェイポイントの座標が変更された可能性があるため、距離を再計算
    if (updates.lat !== undefined || updates.lng !== undefined) {
      get().updateWaypointsDistances();
    }
  },
  
  deleteWaypoint: (id) => {
    set(state => ({
      waypoints: state.waypoints.filter(w => w.id !== id)
    }))
  },
  
  moveWaypointOnRoute: (id, nearestPointIndex) => {
    set(state => ({
      waypoints: state.waypoints.map(w => 
        w.id === id ? { ...w, nearestPointIndex } : w
      )
    }))
  },

  updateWaypointsDistances: () => {
    const { route, waypoints } = get();
    if (route.points.length < 2) {
      set({ waypoints: waypoints.map(w => ({ ...w, distanceFromStart: 0 })) });
      return;
    }

    const updatedWaypoints = waypoints.map(w => {
      const distanceFromStart = getDistanceToWaypoint(w, route.points);
      return { ...w, distanceFromStart };
    });
    set({ waypoints: updatedWaypoints });
  }
}))
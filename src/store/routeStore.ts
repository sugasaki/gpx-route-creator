import { create } from 'zustand'
import { RoutePoint, Route } from '../types'
import { calculateDistance } from '../utils/geo'

interface RouteState {
  route: Route
  history: Route[]
  historyIndex: number
  addPoint: (point: Omit<RoutePoint, 'id'>) => void
  insertPoint: (index: number, point: Omit<RoutePoint, 'id'>) => void
  updatePoint: (id: string, point: Partial<RoutePoint>) => void
  deletePoint: (id: string) => void
  movePoint: (id: string, lat: number, lng: number) => void
  movePointWithoutHistory: (id: string, lat: number, lng: number) => void
  saveCurrentStateToHistory: () => void
  undo: () => void
  redo: () => void
  clearRoute: () => void
  calculateDistance: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useRouteStore = create<RouteState>((set, get) => ({
  route: { points: [], distance: 0 },
  history: [{ points: [], distance: 0 }],
  historyIndex: 0,
  
  addPoint: (point) => {
    const newPoint: RoutePoint = { ...point, id: generateId() }
    const newPoints = [...get().route.points, newPoint]
    const newRoute = { points: newPoints, distance: calculateDistance(newPoints) }
    
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(newRoute)
    
    set({
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
    
    set({
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
    
    set({
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
    
    set({
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
    
    set({ route: newRoute })
  },
  
  saveCurrentStateToHistory: () => {
    const newHistory = get().history.slice(0, get().historyIndex + 1)
    newHistory.push(get().route)
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },
  
  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex > 0) {
      set({
        route: history[historyIndex - 1],
        historyIndex: historyIndex - 1
      })
    }
  },
  
  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex < history.length - 1) {
      set({
        route: history[historyIndex + 1],
        historyIndex: historyIndex + 1
      })
    }
  },
  
  clearRoute: () => {
    const emptyRoute = { points: [], distance: 0 }
    set({
      route: emptyRoute,
      history: [emptyRoute],
      historyIndex: 0
    })
  },
  
  calculateDistance: () => {
    const distance = calculateDistance(get().route.points)
    set(state => ({
      route: { ...state.route, distance }
    }))
  }
}))
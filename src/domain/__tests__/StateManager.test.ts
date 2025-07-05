import { describe, it, expect } from 'vitest'
import { StateManager } from '../StateManager'
import { Route, Waypoint } from '@/types'

describe('StateManager', () => {
  const mockRoute: Route = {
    points: [
      { id: '1', lat: 35.6762, lng: 139.6503 },
      { id: '2', lat: 35.6795, lng: 139.6475 }
    ],
    distance: 1000
  }
  
  const mockWaypoints: Waypoint[] = [
    {
      id: 'w1',
      lat: 35.6770,
      lng: 139.6490,
      name: 'Waypoint 1',
      description: 'Test waypoint',
      nearestPointIndex: 0,
      distanceFromStart: 500
    }
  ]
  
  describe('createEmptyState', () => {
    it('should create an empty state with default values', () => {
      const emptyState = StateManager.createEmptyState()
      
      expect(emptyState).toEqual({
        route: { points: [], distance: 0 },
        waypoints: []
      })
    })
  })
  
  describe('getInitialState', () => {
    it('should return initial state for store', () => {
      const initialState = StateManager.getInitialState()
      
      expect(initialState).toEqual({
        route: { points: [], distance: 0 },
        waypoints: [],
        history: [],
        historyIndex: -1
      })
    })
  })
  
  describe('applyHistoryState', () => {
    it('should create state update from history state', () => {
      const historyState = {
        route: mockRoute,
        waypoints: mockWaypoints
      }
      const newIndex = 2
      
      const update = StateManager.applyHistoryState(historyState, newIndex)
      
      expect(update).toEqual({
        route: mockRoute,
        waypoints: mockWaypoints,
        historyIndex: newIndex
      })
    })
  })
  
  describe('createClearRouteUpdate', () => {
    it('should create update object for clearing route', () => {
      const update = StateManager.createClearRouteUpdate()
      
      expect(update).toEqual({
        route: { points: [], distance: 0 },
        waypoints: [],
        history: [],
        historyIndex: -1
      })
    })
  })
})
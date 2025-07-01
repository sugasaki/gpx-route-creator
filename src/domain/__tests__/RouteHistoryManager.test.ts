import { describe, it, expect } from 'vitest'
import { RouteHistoryManager } from '../RouteHistoryManager'
import { Route, Waypoint } from '@/types'

describe('RouteHistoryManager', () => {
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

  describe('createSnapshot', () => {
    it('should create a snapshot with route and waypoints', () => {
      const snapshot = RouteHistoryManager.createSnapshot(mockRoute, mockWaypoints)
      
      expect(snapshot).toEqual({
        route: mockRoute,
        waypoints: mockWaypoints
      })
    })
    
    it('should create independent copies of route and waypoints', () => {
      const snapshot = RouteHistoryManager.createSnapshot(mockRoute, mockWaypoints)
      
      // 元のオブジェクトを変更
      mockRoute.distance = 2000
      mockWaypoints[0].name = 'Modified'
      
      // スナップショットは影響を受けない
      expect(snapshot.route.distance).toBe(1000)
      expect(snapshot.waypoints[0].name).toBe('Waypoint 1')
    })
  })
  
  describe('canUndo', () => {
    it('should return false when historyIndex is 0', () => {
      expect(RouteHistoryManager.canUndo(0)).toBe(false)
    })
    
    it('should return true when historyIndex is greater than 0', () => {
      expect(RouteHistoryManager.canUndo(1)).toBe(true)
      expect(RouteHistoryManager.canUndo(5)).toBe(true)
    })
  })
  
  describe('canRedo', () => {
    it('should return false when at the latest state', () => {
      expect(RouteHistoryManager.canRedo(2, 3)).toBe(false) // index 2, length 3
    })
    
    it('should return true when not at the latest state', () => {
      expect(RouteHistoryManager.canRedo(0, 3)).toBe(true) // index 0, length 3
      expect(RouteHistoryManager.canRedo(1, 3)).toBe(true) // index 1, length 3
    })
  })
  
  describe('addToHistory', () => {
    it('should add new state and update index when at the latest state', () => {
      const history = [
        { route: mockRoute, waypoints: [] },
        { route: mockRoute, waypoints: mockWaypoints }
      ]
      const currentIndex = 1
      const newState = { route: mockRoute, waypoints: [...mockWaypoints, ...mockWaypoints] }
      
      const result = RouteHistoryManager.addToHistory(history, currentIndex, newState)
      
      expect(result.history).toHaveLength(3)
      expect(result.history[2]).toEqual(newState)
      expect(result.newIndex).toBe(2)
    })
    
    it('should truncate future history when adding from middle', () => {
      const history = [
        { route: mockRoute, waypoints: [] },
        { route: mockRoute, waypoints: mockWaypoints },
        { route: mockRoute, waypoints: [...mockWaypoints, ...mockWaypoints] }
      ]
      const currentIndex = 1 // 中間の状態
      const newState = { route: mockRoute, waypoints: [] }
      
      const result = RouteHistoryManager.addToHistory(history, currentIndex, newState)
      
      expect(result.history).toHaveLength(3) // 0, 1, new
      expect(result.history[2]).toEqual(newState)
      expect(result.newIndex).toBe(2)
    })
  })
})
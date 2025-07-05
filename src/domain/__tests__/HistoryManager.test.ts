import { describe, it, expect } from 'vitest'
import { HistoryManager } from '../HistoryManager'
import { Route, Waypoint } from '@/types'
import { HistoryState } from '../RouteHistoryManager'

describe('HistoryManager', () => {
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
  
  const mockState = {
    route: mockRoute,
    waypoints: mockWaypoints,
    history: [
      { route: mockRoute, waypoints: [] },
      { route: mockRoute, waypoints: mockWaypoints }
    ] as HistoryState[],
    historyIndex: 1
  }
  
  describe('updateWithHistory', () => {
    it('should update history and return state changes when route is updated', () => {
      const newRoute: Route = {
        points: [...mockRoute.points, { id: '3', lat: 35.6820, lng: 139.6450 }],
        distance: 1500
      }
      
      const result = HistoryManager.updateWithHistory(
        mockState,
        newRoute,
        null
      )
      
      expect(result.route).toEqual(newRoute)
      expect(result.waypoints).toBeUndefined()
      expect(result.history).toHaveLength(3)
      expect(result.historyIndex).toBe(2)
    })
    
    it('should update history and return state changes when waypoints are updated', () => {
      const newWaypoints = [...mockWaypoints, { ...mockWaypoints[0], id: 'w2' }]
      
      const result = HistoryManager.updateWithHistory(
        mockState,
        null,
        newWaypoints
      )
      
      expect(result.waypoints).toEqual(newWaypoints)
      expect(result.route).toBeUndefined()
      expect(result.history).toHaveLength(3)
      expect(result.historyIndex).toBe(2)
    })
    
    it('should use current state when null is passed', () => {
      const result = HistoryManager.updateWithHistory(
        mockState,
        null,
        null
      )
      
      expect(result.history).toHaveLength(3)
      expect(result.history[2]).toEqual({
        route: mockRoute,
        waypoints: mockWaypoints
      })
    })
    
    it('should create initial history when history is empty', () => {
      const emptyHistoryState = {
        route: { points: [], distance: 0 },
        waypoints: [],
        history: [] as HistoryState[],
        historyIndex: -1
      }
      
      const newRoute: Route = {
        points: [{ id: '1', lat: 35.6762, lng: 139.6503 }],
        distance: 0
      }
      
      const result = HistoryManager.updateWithHistory(
        emptyHistoryState,
        newRoute,
        null
      )
      
      // 履歴に2つのエントリが作成されることを確認
      expect(result.history).toHaveLength(2)
      expect(result.historyIndex).toBe(1)
      
      // 最初のエントリは空の状態
      expect(result.history[0]).toEqual({
        route: { points: [], distance: 0 },
        waypoints: []
      })
      
      // 2番目のエントリは新しい状態
      expect(result.history[1]).toEqual({
        route: newRoute,
        waypoints: []
      })
      
      expect(result.route).toEqual(newRoute)
    })
    
    it('should truncate future history when adding from middle of history', () => {
      const stateWithLongHistory = {
        route: mockRoute,
        waypoints: mockWaypoints,
        history: [
          { route: { points: [], distance: 0 }, waypoints: [] },
          { route: mockRoute, waypoints: [] },
          { route: mockRoute, waypoints: mockWaypoints },
          { route: mockRoute, waypoints: [...mockWaypoints, { ...mockWaypoints[0], id: 'w2' }] }
        ] as HistoryState[],
        historyIndex: 1  // 現在は2番目の状態
      }
      
      const newRoute: Route = {
        points: [...mockRoute.points, { id: '3', lat: 35.6820, lng: 139.6450 }],
        distance: 1500
      }
      
      const result = HistoryManager.updateWithHistory(
        stateWithLongHistory,
        newRoute,
        null
      )
      
      // 未来の履歴は削除され、新しい履歴が追加される
      expect(result.history).toHaveLength(3)
      expect(result.historyIndex).toBe(2)
      expect(result.history[2].route).toEqual(newRoute)
    })
    
    it('should handle both route and waypoints updates simultaneously', () => {
      const newRoute: Route = {
        points: [...mockRoute.points, { id: '3', lat: 35.6820, lng: 139.6450 }],
        distance: 1500
      }
      const newWaypoints = [...mockWaypoints, { ...mockWaypoints[0], id: 'w2' }]
      
      const result = HistoryManager.updateWithHistory(
        mockState,
        newRoute,
        newWaypoints
      )
      
      expect(result.route).toEqual(newRoute)
      expect(result.waypoints).toEqual(newWaypoints)
      expect(result.history).toHaveLength(3)
      expect(result.history[2]).toEqual({
        route: newRoute,
        waypoints: newWaypoints
      })
    })
  })
})
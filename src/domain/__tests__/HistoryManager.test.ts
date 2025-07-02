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
  })
})
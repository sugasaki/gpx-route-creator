import { describe, it, expect } from 'vitest'
import { WaypointManager } from '../WaypointManager'
import { Waypoint, RoutePoint } from '@/types'

describe('WaypointManager', () => {
  const mockRoutePoints: RoutePoint[] = [
    { id: '1', lat: 35.6762, lng: 139.6503 },
    { id: '2', lat: 35.6795, lng: 139.6475 },
    { id: '3', lat: 35.6820, lng: 139.6450 }
  ]
  
  const mockWaypoints: Waypoint[] = [
    {
      id: 'w1',
      lat: 35.6780,
      lng: 139.6480,
      name: 'Waypoint 1',
      description: 'First waypoint',
      nearestPointIndex: 0,
      distanceFromStart: 100
    },
    {
      id: 'w2',
      lat: 35.6810,
      lng: 139.6460,
      name: 'Waypoint 2',
      description: 'Second waypoint',
      nearestPointIndex: 1,
      distanceFromStart: 500
    }
  ]
  
  describe('addWaypoint', () => {
    it('should add new waypoint to the list', () => {
      const newWaypoint = {
        lat: 35.6830,
        lng: 139.6440,
        name: 'New Waypoint',
        description: 'Test waypoint',
        nearestPointIndex: 2
      }
      
      const result = WaypointManager.addWaypoint(
        mockWaypoints,
        newWaypoint,
        mockRoutePoints
      )
      
      expect(result).toHaveLength(3)
      expect(result[2]).toMatchObject({
        ...newWaypoint,
        id: expect.any(String),
        distanceFromStart: expect.any(Number)
      })
      expect(result[2].distanceFromStart).toBeGreaterThan(0)
    })
    
    it('should handle empty waypoints list', () => {
      const newWaypoint = {
        lat: 35.6780,
        lng: 139.6480,
        name: 'First Waypoint',
        description: 'Initial waypoint',
        nearestPointIndex: 0
      }
      
      const result = WaypointManager.addWaypoint([], newWaypoint, mockRoutePoints)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBeDefined()
    })
  })
  
  describe('updateWaypoint', () => {
    it('should update waypoint properties', () => {
      const updates = {
        name: 'Updated Name',
        description: 'Updated description'
      }
      
      const result = WaypointManager.updateWaypoint(
        mockWaypoints,
        'w1',
        updates,
        mockRoutePoints
      )
      
      expect(result[0]).toMatchObject({
        ...mockWaypoints[0],
        ...updates
      })
      expect(result[1]).toEqual(mockWaypoints[1])
    })
    
    it('should recalculate distance when position changes', () => {
      const updates = {
        lat: 35.6790,
        lng: 139.6470
      }
      
      const result = WaypointManager.updateWaypoint(
        mockWaypoints,
        'w1',
        updates,
        mockRoutePoints
      )
      
      expect(result[0].lat).toBe(updates.lat)
      expect(result[0].lng).toBe(updates.lng)
      expect(result[0].distanceFromStart).not.toBe(mockWaypoints[0].distanceFromStart)
    })
    
    it('should recalculate distance when nearestPointIndex changes', () => {
      const updates = {
        nearestPointIndex: 2
      }
      
      const result = WaypointManager.updateWaypoint(
        mockWaypoints,
        'w1',
        updates,
        mockRoutePoints
      )
      
      expect(result[0].nearestPointIndex).toBe(2)
      expect(result[0].distanceFromStart).not.toBe(mockWaypoints[0].distanceFromStart)
    })
    
    it('should return unchanged list if waypoint not found', () => {
      const updates = { name: 'Updated' }
      
      const result = WaypointManager.updateWaypoint(
        mockWaypoints,
        'nonexistent',
        updates,
        mockRoutePoints
      )
      
      expect(result).toEqual(mockWaypoints)
    })
  })
  
  describe('deleteWaypoint', () => {
    it('should delete waypoint by id', () => {
      const result = WaypointManager.deleteWaypoint(mockWaypoints, 'w1')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('w2')
    })
    
    it('should handle deletion of non-existent waypoint', () => {
      const result = WaypointManager.deleteWaypoint(mockWaypoints, 'nonexistent')
      
      expect(result).toEqual(mockWaypoints)
    })
    
    it('should handle empty waypoints list', () => {
      const result = WaypointManager.deleteWaypoint([], 'any-id')
      
      expect(result).toEqual([])
    })
  })
  
  describe('moveWaypointOnRoute', () => {
    it('should update nearestPointIndex and recalculate distance', () => {
      const result = WaypointManager.moveWaypointOnRoute(
        mockWaypoints,
        'w1',
        2,
        mockRoutePoints
      )
      
      expect(result[0].nearestPointIndex).toBe(2)
      expect(result[0].distanceFromStart).not.toBe(mockWaypoints[0].distanceFromStart)
      expect(result[1]).toEqual(mockWaypoints[1])
    })
    
    it('should return unchanged list if waypoint not found', () => {
      const result = WaypointManager.moveWaypointOnRoute(
        mockWaypoints,
        'nonexistent',
        2,
        mockRoutePoints
      )
      
      expect(result).toEqual(mockWaypoints)
    })
  })
})
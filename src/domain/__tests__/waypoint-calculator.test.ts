import { describe, it, expect } from 'vitest'
import { WaypointCalculator } from '../waypoint-calculator'
import { RoutePoint, Waypoint } from '@/types'

describe('WaypointCalculator', () => {
  const mockRoutePoints: RoutePoint[] = [
    { id: '1', lat: 35.6762, lng: 139.6503 },
    { id: '2', lat: 35.6795, lng: 139.6475 },
    { id: '3', lat: 35.6820, lng: 139.6450 }
  ]
  
  const mockWaypoint: Waypoint = {
    id: 'w1',
    lat: 35.6780,
    lng: 139.6480,
    name: 'Test Waypoint',
    description: 'Test description',
    nearestPointIndex: 0,
    distanceFromStart: 0
  }
  
  describe('calculateDistanceToWaypoint', () => {
    it('should return 0 for empty route', () => {
      const distance = WaypointCalculator.calculateDistanceToWaypoint(mockWaypoint, [])
      expect(distance).toBe(0)
    })
    
    it('should return 0 for single point route', () => {
      const distance = WaypointCalculator.calculateDistanceToWaypoint(
        mockWaypoint, 
        [mockRoutePoints[0]]
      )
      expect(distance).toBe(0)
    })
    
    it('should calculate distance for waypoint on route', () => {
      const distance = WaypointCalculator.calculateDistanceToWaypoint(
        mockWaypoint,
        mockRoutePoints
      )
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(1) // Less than 1km
    })
    
    it('should handle waypoint without nearestPointIndex', () => {
      const waypointWithoutIndex = { ...mockWaypoint, nearestPointIndex: undefined }
      const distance = WaypointCalculator.calculateDistanceToWaypoint(
        waypointWithoutIndex as Waypoint,
        mockRoutePoints
      )
      expect(distance).toBe(0)
    })
  })
  
  describe('updateWaypointDistance', () => {
    it('should update waypoint with calculated distance', () => {
      const updatedWaypoint = WaypointCalculator.updateWaypointDistance(
        mockWaypoint,
        mockRoutePoints
      )
      
      expect(updatedWaypoint).not.toBe(mockWaypoint) // New object
      expect(updatedWaypoint.distanceFromStart).toBeGreaterThan(0)
      expect(updatedWaypoint.id).toBe(mockWaypoint.id)
      expect(updatedWaypoint.name).toBe(mockWaypoint.name)
    })
  })
  
  describe('updateAllWaypointDistances', () => {
    it('should update all waypoints with calculated distances', () => {
      const waypoints: Waypoint[] = [
        { ...mockWaypoint, id: 'w1', nearestPointIndex: 0 },
        { ...mockWaypoint, id: 'w2', nearestPointIndex: 1, lat: 35.6800 }
      ]
      
      const updatedWaypoints = WaypointCalculator.updateAllWaypointDistances(
        waypoints,
        mockRoutePoints
      )
      
      expect(updatedWaypoints).toHaveLength(2)
      expect(updatedWaypoints[0].distanceFromStart).toBeGreaterThan(0)
      expect(updatedWaypoints[1].distanceFromStart).toBeGreaterThan(
        updatedWaypoints[0].distanceFromStart
      )
    })
    
    it('should handle empty waypoints array', () => {
      const updatedWaypoints = WaypointCalculator.updateAllWaypointDistances(
        [],
        mockRoutePoints
      )
      expect(updatedWaypoints).toEqual([])
    })
  })
})
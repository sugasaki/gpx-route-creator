import { describe, it, expect } from 'vitest'
import { RouteCalculator } from '../route-calculator'
import { RoutePoint, Route } from '@/types'

describe('RouteCalculator', () => {
  const mockPoints: RoutePoint[] = [
    { id: '1', lat: 35.6762, lng: 139.6503 }, // Tokyo Tower
    { id: '2', lat: 35.6795, lng: 139.6475 }, // ~500m north
    { id: '3', lat: 35.6820, lng: 139.6450 }  // ~750m further
  ]
  
  describe('calculateRouteDistance', () => {
    it('should return 0 for empty route', () => {
      const distance = RouteCalculator.calculateRouteDistance([])
      expect(distance).toBe(0)
    })
    
    it('should return 0 for single point', () => {
      const distance = RouteCalculator.calculateRouteDistance([mockPoints[0]])
      expect(distance).toBe(0)
    })
    
    it('should calculate distance for multiple points', () => {
      const distance = RouteCalculator.calculateRouteDistance(mockPoints)
      // Approximate distance should be around 800 meters
      expect(distance).toBeGreaterThan(700)
      expect(distance).toBeLessThan(900)
    })
    
    it('should return consistent results', () => {
      const distance1 = RouteCalculator.calculateRouteDistance(mockPoints)
      const distance2 = RouteCalculator.calculateRouteDistance(mockPoints)
      expect(distance1).toBe(distance2)
    })
  })
  
  describe('createRoute', () => {
    it('should create route with calculated distance', () => {
      const route = RouteCalculator.createRoute(mockPoints)
      expect(route.points).toEqual(mockPoints)
      expect(route.distance).toBeGreaterThan(0)
    })
    
    it('should handle empty points', () => {
      const route = RouteCalculator.createRoute([])
      expect(route.points).toEqual([])
      expect(route.distance).toBe(0)
    })
  })
  
  describe('updateRouteDistance', () => {
    it('should update existing route with new distance', () => {
      const route: Route = { points: mockPoints, distance: 0 }
      const updatedRoute = RouteCalculator.updateRouteDistance(route)
      
      expect(updatedRoute.points).toEqual(mockPoints)
      expect(updatedRoute.distance).toBeGreaterThan(0)
      expect(updatedRoute).not.toBe(route) // Should return new object
    })
    
    it('should preserve route points', () => {
      const route: Route = { points: mockPoints, distance: 999 }
      const updatedRoute = RouteCalculator.updateRouteDistance(route)
      
      expect(updatedRoute.points).toBe(route.points) // Same reference
    })
  })
})